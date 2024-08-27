const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

let gameState = {
    grid: [
        ['A-P1', 'A-H1', 'A-P2', 'A-H2', 'A-P3'],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        ['B-P1', 'B-H1', 'B-P2', 'B-H2', 'B-P3'],
    ],
    players: {
        A: [
            { type: 'P1', position: [0, 0] },
            { type: 'H1', position: [0, 1] },
            { type: 'P2', position: [0, 2] },
            { type: 'H2', position: [0, 3] },
            { type: 'P3', position: [0, 4] },
        ],
        B: [
            { type: 'P1', position: [4, 0] },
            { type: 'H1', position: [4, 1] },
            { type: 'P2', position: [4, 2] },
            { type: 'H2', position: [4, 3] },
            { type: 'P3', position: [4, 4] },
        ],
    },
    currentPlayer: 'A',
    moveHistory: [],
    winner: null,
};

const isValidMove = (position, direction, player, piece) => {
    const [x, y] = position;
    const moveDistance = piece === 'H1' || piece === 'H2' ? 2 : 1;
    switch (direction) {
        case 'L': return y - moveDistance >= 0;
        case 'R': return y + moveDistance < 5;
        case 'F': return player === 'A' ? x + moveDistance < 5 : x - moveDistance >= 0;
        case 'B': return player === 'A' ? x - moveDistance >= 0 : x + moveDistance < 5;
        case 'FL': return player === 'A' ? (x + moveDistance < 5 && y - moveDistance >= 0) : (x - moveDistance >= 0 && y - moveDistance >= 0);
        case 'FR': return player === 'A' ? (x + moveDistance < 5 && y + moveDistance < 5) : (x - moveDistance >= 0 && y + moveDistance < 5);
        case 'BL': return player === 'A' ? (x - moveDistance >= 0 && y - moveDistance >= 0) : (x + moveDistance < 5 && y - moveDistance >= 0);
        case 'BR': return player === 'A' ? (x - moveDistance >= 0 && y + moveDistance < 5) : (x + moveDistance < 5 && y + moveDistance < 5);
        default: return false;
    }
};

const applyMove = (piece, direction) => {
    const player = piece.startsWith('A') ? 'A' : 'B';
    const charIndex = gameState.players[player].findIndex(c => c.type === piece.split('-')[1]);
    if (charIndex === -1) return;

    const char = gameState.players[player][charIndex];
    const [x, y] = char.position;

    let newX = x, newY = y;
    const moveDistance = piece.includes('H1') || piece.includes('H2') ? 2 : 1;

    if (isValidMove([x, y], direction, player, piece.split('-')[1])) {
        switch (direction) {
            case 'L':
                newY -= moveDistance;
                break;
            case 'R':
                newY += moveDistance;
                break;
            case 'F':
                newX += player === 'A' ? moveDistance : -moveDistance;
                break;
            case 'B':
                newX -= player === 'A' ? moveDistance : -moveDistance;
                break;
            case 'FL':
                newX += player === 'A' ? moveDistance : -moveDistance;
                newY -= moveDistance;
                break;
            case 'FR':
                newX += player === 'A' ? moveDistance : -moveDistance;
                newY += moveDistance;
                break;
            case 'BL':
                newX -= player === 'A' ? moveDistance : -moveDistance;
                newY -= moveDistance;
                break;
            case 'BR':
                newX -= player === 'A' ? moveDistance : -moveDistance;
                newY += moveDistance;
                break;
        }
    }

    if (newX < 0 || newX >= 5 || newY < 0 || newY >= 5) return;

    const targetCell = gameState.grid[newX][newY];
    let capturedPiece = null;

    if (targetCell && targetCell.startsWith(player === 'A' ? 'B' : 'A')) {
        const opponent = player === 'A' ? 'B' : 'A';
        capturedPiece = targetCell;
        gameState.players[opponent] = gameState.players[opponent].filter(c => c.position[0] !== newX || c.position[1] !== newY);
    }

    gameState.grid[x][y] = null;
    gameState.grid[newX][newY] = piece;
    gameState.players[player][charIndex].position = [newX, newY];

    let moveRecord = `${piece} moved ${direction}`;
    if (capturedPiece) {
        moveRecord += ` (Captured ${capturedPiece})`;
    }

    gameState.moveHistory.push(moveRecord);

    if (gameState.players['A'].length === 0 || gameState.players['B'].length === 0) {
        gameState.winner = gameState.currentPlayer === 'A' ? 'B' : 'A';
    }

    gameState.currentPlayer = gameState.currentPlayer === 'A' ? 'B' : 'A';
};

app.prepare().then(() => {
    const server = express();
    const httpServer = http.createServer(server);
    const io = new Server(httpServer);

    io.on('connection', (socket) => {
        socket.emit('gameState', gameState);

        socket.on('requestGameState', () => {
            socket.emit('gameState', gameState);
        });

        socket.on('move', (moveData) => {
            applyMove(moveData.piece, moveData.direction);
            io.emit('gameState', gameState);
        });

        socket.on('reset', () => {
            gameState = {
                grid: [
                    ['A-P1', 'A-H1', 'A-P2', 'A-H2', 'A-P3'],
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null],
                    ['B-P1', 'B-H1', 'B-P2', 'B-H2', 'B-P3'],
                ],
                players: {
                    A: [
                        { type: 'P1', position: [0, 0] },
                        { type: 'H1', position: [0, 1] },
                        { type: 'P2', position: [0, 2] },
                        { type: 'H2', position: [0, 3] },
                        { type: 'P3', position: [0, 4] },
                    ],
                    B: [
                        { type: 'P1', position: [4, 0] },
                        { type: 'H1', position: [4, 1] },
                        { type: 'P2', position: [4, 2] },
                        { type: 'H2', position: [4, 3] },
                        { type: 'P3', position: [4, 4] },
                    ],
                },
                currentPlayer: 'A',
                moveHistory: [],
                winner: null,
            };

            io.emit('gameState', gameState);
        });

        socket.on('disconnect', () => {
            console.log(`Player disconnected: ${socket.id}`);
        });
    });

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    httpServer.listen(3000, (err) => {
        if (err) throw err;
        console.log('Server is running on http://localhost:3000');
    });
});

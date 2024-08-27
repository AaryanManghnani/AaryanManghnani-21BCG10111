export class Game {
    constructor() {
        this.grid = Array(5).fill(null).map(() => Array(5).fill(null));
        this.players = {
            A: [],
            B: []
        };
        this.currentPlayer = 'A';
        this.moveHistory = [];
        this.winner = null;
    }

    initializePlayer(player, characters) {
        if (player === 'A') {
            for (let i = 0; i < 5; i++) {
                this.grid[0][i] = `${player}-${characters[i]}`;
                this.players[player].push({ type: characters[i], position: [0, i] });
            }
        } else {
            for (let i = 0; i < 5; i++) {
                this.grid[4][i] = `${player}-${characters[i]}`;
                this.players[player].push({ type: characters[i], position: [4, i] });
            }
        }
    }

    moveCharacter(character, move) {
        if (this.winner) return false;

        const player = this.currentPlayer;
        const charIndex = this.players[player].findIndex(c => c.type === character);
        if (charIndex === -1) return false;

        const char = this.players[player][charIndex];
        const [x, y] = char.position;
        let newX = x, newY = y;
        const moveDistance = (character === 'H1' || character === 'H2') ? 2 : 1;

        const path = [];
        let captured = [];

        switch (move) {
            case 'L': 
                for (let i = 1; i <= moveDistance; i++) {
                    path.push([x, y - i]);
                }
                newY -= moveDistance; 
                break;
            case 'R': 
                for (let i = 1; i <= moveDistance; i++) {
                    path.push([x, y + i]);
                }
                newY += moveDistance; 
                break;
            case 'F': 
                for (let i = 1; i <= moveDistance; i++) {
                    path.push([x + (player === 'A' ? i : -i), y]);
                }
                newX += (player === 'A' ? moveDistance : -moveDistance); 
                break;
            case 'B': 
                for (let i = 1; i <= moveDistance; i++) {
                    path.push([x - (player === 'A' ? i : -i), y]);
                }
                newX -= (player === 'A' ? moveDistance : -moveDistance); 
                break;
            case 'FL': 
                for (let i = 1; i <= moveDistance; i++) {
                    path.push([x + (player === 'A' ? i : -i), y - i]);
                }
                newX += (player === 'A' ? moveDistance : -moveDistance); 
                newY -= moveDistance; 
                break;
            case 'FR': 
                for (let i = 1; i <= moveDistance; i++) {
                    path.push([x + (player === 'A' ? i : -i), y + i]);
                }
                newX += (player === 'A' ? moveDistance : -moveDistance); 
                newY += moveDistance; 
                break;
            case 'BL': 
                for (let i = 1; i <= moveDistance; i++) {
                    path.push([x - (player === 'A' ? i : -i), y - i]);
                }
                newX -= (player === 'A' ? moveDistance : -moveDistance); 
                newY -= moveDistance; 
                break;
            case 'BR': 
                for (let i = 1; i <= moveDistance; i++) {
                    path.push([x - (player === 'A' ? i : -i), y + i]);
                }
                newX -= (player === 'A' ? moveDistance : -moveDistance); 
                newY += moveDistance; 
                break;
            default: return false;
        }

        if (this.isValidPath(path)) {
            path.forEach(([px, py]) => {
                const capturedChar = this.handleCombat(px, py);
                if (capturedChar) captured.push(capturedChar);
            });
            this.grid[x][y] = null;
            this.grid[newX][newY] = `${player}-${character}`;
            char.position = [newX, newY];
            this.currentPlayer = this.currentPlayer === 'A' ? 'B' : 'A';

            let moveRecord = `${player}-${character}: ${move}`;
            if (captured.length > 0) {
                moveRecord += ` (Captured ${captured.join(', ')})`;
            }
            this.moveHistory.push(moveRecord);

            if (this.checkWin()) {
                this.moveHistory.push(`Player ${this.currentPlayer === 'A' ? 'B' : 'A'} wins!`);
                this.winner = this.currentPlayer === 'A' ? 'B' : 'A';
            }
            return true;
        }
        return false;
    }

    isValidPath(path) {
        return path.every(([x, y]) => x >= 0 && x < 5 && y >= 0 && y < 5);
    }

    handleCombat(x, y) {
        const opponent = this.currentPlayer === 'A' ? 'B' : 'A';
        const char = this.grid[x][y];
        if (char && char.startsWith(opponent)) {
            this.players[opponent] = this.players[opponent].filter(c => !(c.position[0] === x && c.position[1] === y));
            this.grid[x][y] = null;
            return char;
        }
        return null;
    }

    checkWin() {
        const opponent = this.currentPlayer === 'A' ? 'B' : 'A';
        return this.players[opponent].length === 0;
    }
}

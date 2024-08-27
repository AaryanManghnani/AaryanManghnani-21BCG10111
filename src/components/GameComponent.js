import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io();

const GameComponent = () => {
    const [gameState, setGameState] = useState(null);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(null);

    useEffect(() => {
        console.log('GameComponent mounted');

        socket.emit('requestGameState');

        socket.on('gameState', (state) => {
            console.log('Received game state:', state);
            setGameState(state);  
            setCurrentPlayer(state.currentPlayer);
            setSelectedPiece(null); 
        });

        return () => {
            socket.off('gameState');
        };
    }, []);

    const handleCellClick = (rowIndex, colIndex) => {
        if (!gameState) return;
        const piece = gameState.grid[rowIndex][colIndex];
        if (piece && piece.startsWith(currentPlayer)) {
            setSelectedPiece({ piece, rowIndex, colIndex });
        }
    };

    const movePiece = (direction) => {
        if (!selectedPiece) return;

        console.log(`Attempting to move piece ${selectedPiece.piece} in direction ${direction}`);
        socket.emit('move', { piece: selectedPiece.piece, direction });

        setSelectedPiece(null);
    };

    if (!gameState) {
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>Loading game state...</div>;
    }

    return (
        <div style={{ backgroundColor: '#000000', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: 'white', backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', width: 'max-content' }}>
                <h1 style={{ textAlign: 'center', color: '#8e44ad' }}>Advanced Chess-like Game</h1>
                {gameState.winner && (
                    <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#27ae60', color: 'white', borderRadius: '5px', marginBottom: '10px' }}>
                        {`Player ${gameState.winner} wins!`}
                    </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 50px)', gap: '5px', justifyContent: 'center' }}>
                    {gameState.grid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                style={{
                                    border: '2px solid #8e44ad',
                                    width: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: selectedPiece && selectedPiece.rowIndex === rowIndex && selectedPiece.colIndex === colIndex ? '#f39c12' : (cell ? '#2c3e50' : '#34495e'),
                                    color: '#ecf0f1',
                                    cursor: cell && cell.startsWith(currentPlayer) ? 'pointer' : 'default',
                                    borderRadius: '4px'
                                }}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                            >
                                {cell}
                            </div>
                        ))
                    )}
                </div>
                {selectedPiece && (
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <p>{`Selected: ${selectedPiece.piece}`}</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                            {selectedPiece.piece.includes('P') && (
                                <>
                                    <button style={buttonStyle} onClick={() => movePiece('L')}>Left</button>
                                    <button style={buttonStyle} onClick={() => movePiece('R')}>Right</button>
                                    <button style={buttonStyle} onClick={() => movePiece('F')}>Forward</button>
                                    <button style={buttonStyle} onClick={() => movePiece('B')}>Backward</button>
                                </>
                            )}
                            {selectedPiece.piece.includes('H1') && (
                                <>
                                    <button style={buttonStyle} onClick={() => movePiece('L')}>Left</button>
                                    <button style={buttonStyle} onClick={() => movePiece('R')}>Right</button>
                                    <button style={buttonStyle} onClick={() => movePiece('F')}>Forward</button>
                                    <button style={buttonStyle} onClick={() => movePiece('B')}>Backward</button>
                                </>
                            )}
                            {selectedPiece.piece.includes('H2') && (
                                <>
                                    <button style={buttonStyle} onClick={() => movePiece('FL')}>Fwd-Left</button>
                                    <button style={buttonStyle} onClick={() => movePiece('FR')}>Fwd-Right</button>
                                    <button style={buttonStyle} onClick={() => movePiece('BL')}>Back-Left</button>
                                    <button style={buttonStyle} onClick={() => movePiece('BR')}>Back-Right</button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                <div style={{ marginTop: '20px', textAlign: 'center', color: '#bdc3c7' }}>
                    <h3>Move History</h3>
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                        {gameState.moveHistory.map((move, index) => (
                            <li key={index} style={{ margin: '5px 0', color: move.includes('(Captured') ? '#e74c3c' : '#bdc3c7' }}>
                                {move}
                            </li>
                        ))}
                    </ul>
                </div>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button onClick={() => socket.emit('reset')} style={{ backgroundColor: '#8e44ad', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>
                        Reset Game
                    </button>
                </div>
            </div>
        </div>
    );
};

const buttonStyle = {
    backgroundColor: '#34495e',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    margin: '5px',
    fontSize: '14px'
};

export default GameComponent;
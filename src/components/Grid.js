import React from 'react';
import Cell from './Cell';

const Grid = ({ grid, handleCharacterSelect }) => {
    if (!grid || grid.length === 0) {
        console.log('Grid is empty or undefined');
        return <div>No grid available</div>;
    }

    return (
        <div>
            {grid.map((row, i) => (
                <div key={i} style={{ display: 'flex' }}>
                    {row.map((cell, j) => (
                        <Cell
                            key={j}
                            value={cell}
                            onClick={() => {
                                if (cell) {
                                    const [player, character] = cell.split('-');
                                    handleCharacterSelect(character, player);
                                }
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Grid;

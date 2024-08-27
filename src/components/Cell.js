import React from 'react';

const Cell = ({ value, onClick }) => {
    return (
        <div
            onClick={onClick}
            style={{
                border: '1px solid black',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: value ? '#808080' : '#FFF',
                cursor: value ? 'pointer' : 'default',
            }}
        >
            {value || '.'}
        </div>
    );
};

export default Cell;

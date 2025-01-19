import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Board, Position } from '../types/chess';

interface ChessboardProps {
  board: Board;
  onMove: (from: Position, to: Position) => void;
}

const Square: React.FC<{
  position: Position;
  piece: string | null;
  isBlack: boolean;
  onMove: (from: Position, to: Position) => void;
}> = ({ position, piece, isBlack, onMove }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'piece',
    item: { position },
    canDrag: () => piece !== null,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'piece',
    drop: (item: { position: Position }) => {
      onMove(item.position, position);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      className={`w-16 h-16 flex items-center justify-center
        ${isBlack ? 'bg-gray-600' : 'bg-gray-200'}
        ${isOver ? 'bg-yellow-200' : ''}
        ${isDragging ? 'opacity-50' : ''}`}
    >
      {piece && (
        <div className="text-4xl cursor-move select-none">
          {piece}
        </div>
      )}
    </div>
  );
};

export const Chessboard: React.FC<ChessboardProps> = ({ board, onMove }) => {
  return (
    <div className="grid grid-cols-8 border-2 border-gray-800">
      {board.map((row, i) =>
        row.map((piece, j) => (
          <Square
            key={`${i}-${j}`}
            position={{ row: i, col: j }}
            piece={piece ? getPieceSymbol(piece) : null}
            isBlack={(i + j) % 2 === 1}
            onMove={onMove}
          />
        ))
      )}
    </div>
  );
};

function getPieceSymbol(piece: { type: string; color: string }): string {
  const symbols: { [key: string]: { w: string; b: string } } = {
    k: { w: '♔', b: '♚' },
    q: { w: '♕', b: '♛' },
    r: { w: '♖', b: '♜' },
    b: { w: '♗', b: '♝' },
    n: { w: '♘', b: '♞' },
    p: { w: '♙', b: '♟' },
  };
  return symbols[piece.type][piece.color as 'w' | 'b'];
}
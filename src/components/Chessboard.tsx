import React, { useState } from 'react';

// Types
type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
type PieceColor = 'w' | 'b';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

interface Position {
  row: number;
  col: number;
}

type Board = (Piece | null)[][];

interface GameStats {
  whiteCaptures: string[];
  blackCaptures: string[];
  currentTurn: PieceColor;
  moveHistory: string[];
  timer: { white: number; black: number };
}

// Initial setup
const initialBoard: Board = [
  [
    { type: 'r', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'q', color: 'b' },
    { type: 'k', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'r', color: 'b' },
  ],
  Array(8).fill(null).map(() => ({ type: 'p', color: 'b' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'p', color: 'w' })),
  [
    { type: 'r', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'q', color: 'w' },
    { type: 'k', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'r', color: 'w' },
  ],
];

const initialGameStats: GameStats = {
  whiteCaptures: [],
  blackCaptures: [],
  currentTurn: 'w',
  moveHistory: [],
  timer: { white: 600, black: 600 },
};

const Square: React.FC<{
  position: Position;
  piece: string | null;
  isBlack: boolean;
  onMove: (from: Position, to: Position) => void;
}> = ({ position, piece, isBlack, onMove }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (piece) {
      e.dataTransfer.setData('text/plain', JSON.stringify(position));
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const fromPos = JSON.parse(e.dataTransfer.getData('text/plain'));
    onMove(fromPos, position);
  };

  return (
    <div
      className={`w-16 h-16 flex items-center justify-center relative
        ${isBlack ? 'bg-opacity-60 bg-gray-700' : 'bg-opacity-30 bg-gray-200'}
        ${isOver ? 'bg-yellow-200 bg-opacity-50' : ''}
        transition-all duration-200`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {piece && (
        <div
          draggable
          onDragStart={handleDragStart}
          className="text-4xl cursor-move select-none hover:scale-110 transition-transform"
        >
          {piece}
        </div>
      )}
    </div>
  );
};

const ChessDashboard: React.FC<{ stats: GameStats }> = ({ stats }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">White</h3>
          <div className="text-2xl font-mono">{formatTime(stats.timer.white)}</div>
          <div className="flex gap-1">
            {stats.whiteCaptures.map((piece, i) => (
              <div key={i} className="text-xl">{piece}</div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Black</h3>
          <div className="text-2xl font-mono">{formatTime(stats.timer.black)}</div>
          <div className="flex gap-1">
            {stats.blackCaptures.map((piece, i) => (
              <div key={i} className="text-xl">{piece}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="font-bold mb-2">Move History</h4>
        <div className="h-32 overflow-y-auto text-sm">
          {stats.moveHistory.map((move, i) => (
            <div key={i} className="py-1 border-b border-gray-700">
              {i + 1}. {move}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className={`text-lg font-bold ${stats.currentTurn === 'w' ? 'text-white' : 'text-gray-400'}`}>
          {stats.currentTurn === 'w' ? "White's Turn" : "Black's Turn"}
        </div>
      </div>
    </div>
  );
};

const EnhancedChessboard: React.FC<Partial<ChessboardProps>> = ({ 
  board = initialBoard, 
  onMove = () => {}, 
  gameStats = initialGameStats 
}) => {
  const [currentBoard] = useState<Board>(board);
  const [currentStats] = useState<GameStats>(gameStats);

  return (
    <div className="flex gap-8 p-8 bg-gradient-to-br from-gray-900 to-gray-700 min-h-screen items-center justify-center">
      <div className="relative">
        <div 
          className="absolute inset-0 bg-gray-800 rounded-lg shadow-2xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0V0z' fill='none' stroke='%23333' stroke-width='2'/%3E%3Cpath d='M15 0h30v60H15V0z' fill='none' stroke='%23333' stroke-width='2'/%3E%3Cpath d='M0 15h60v30H0V15z' fill='none' stroke='%23333' stroke-width='2'/%3E%3C/svg%3E")`,
            transform: 'scale(1.05)',
            zIndex: -1,
            filter: 'blur(2px)'
          }}
        />
        
        <div className="grid grid-cols-8 border-2 border-gray-800 rounded-lg overflow-hidden shadow-2xl">
          {currentBoard.map((row, i) =>
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
        
        <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around text-white">
          {[8,7,6,5,4,3,2,1].map(num => (
            <div key={num} className="text-sm">{num}</div>
          ))}
        </div>
        <div className="absolute -bottom-6 left-0 right-0 flex justify-around text-white">
          {['a','b','c','d','e','f','g','h'].map(letter => (
            <div key={letter} className="text-sm">{letter}</div>
          ))}
        </div>
      </div>
      
      <ChessDashboard stats={currentStats} />
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

export default EnhancedChessboard;
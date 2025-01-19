import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Brain, ChevronUp as ChevronUndo, Timer } from 'lucide-react';
import { Chessboard } from './components/Chessboard';
import { Board, Position, GameStatus, TimeControl } from './types/chess';
import { getBestMove, isLegalMove, getGameStatus, makeMove } from './utils/chessEngine';

const INITIAL_TIME = 10 * 60; // 10 minutes in seconds

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
  Array(8).fill({ type: 'p', color: 'b' }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: 'p', color: 'w' }),
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

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function App() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [thinking, setThinking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [time, setTime] = useState<TimeControl>({
    white: INITIAL_TIME,
    black: INITIAL_TIME
  });
  const [currentPlayer, setCurrentPlayer] = useState<'w' | 'b'>('w');
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!gameOver && gameStatus === 'playing') {
      timer = setInterval(() => {
        setTime(prev => ({
          ...prev,
          [currentPlayer === 'w' ? 'white' : 'black']: prev[currentPlayer === 'w' ? 'white' : 'black'] - 1
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentPlayer, gameOver, gameStatus]);

  useEffect(() => {
    if (time.white <= 0) {
      setGameOver(true);
      setMessage('Black wins on time!');
    } else if (time.black <= 0) {
      setGameOver(true);
      setMessage('White wins on time!');
    }
  }, [time]);

  const handleMove = (from: Position, to: Position) => {
    if (gameOver) {
      setMessage('Game is over! Start a new game.');
      return;
    }

    const piece = board[from.row][from.col];
    
    if (!piece || piece.color !== currentPlayer) {
      setMessage(`It's ${currentPlayer === 'w' ? 'white' : 'black'}'s turn!`);
      return;
    }

    if (!isLegalMove(board, from, to)) {
      setMessage('Invalid move!');
      return;
    }

    // Make the player's move
    const newBoard = makeMove(board, from, to);
    setBoard(newBoard);

    // Update game status
    const nextPlayer = currentPlayer === 'w' ? 'b' : 'w';
    const status = getGameStatus(newBoard, nextPlayer);
    setGameStatus(status);
    setCurrentPlayer(nextPlayer);

    // Clear previous messages and set new status message
    switch (status) {
      case 'check':
        setMessage(`${nextPlayer === 'w' ? 'White' : 'Black'} is in check!`);
        break;
      case 'checkmate':
        setMessage(`Checkmate! ${currentPlayer === 'w' ? 'White' : 'Black'} wins!`);
        setGameOver(true);
        return;
      case 'stalemate':
        setMessage('Stalemate! Game is drawn.');
        setGameOver(true);
        return;
      default:
        setMessage(null);
    }

    // AI move
    if (!gameOver && nextPlayer === 'b') {
      setThinking(true);
      setTimeout(() => {
        const aiMove = getBestMove(newBoard, 'b');
        const finalBoard = makeMove(newBoard, aiMove.from, aiMove.to);
        setBoard(finalBoard);
        
        // Check game status after AI move
        const afterAiStatus = getGameStatus(finalBoard, 'w');
        setGameStatus(afterAiStatus);
        setCurrentPlayer('w');

        switch (afterAiStatus) {
          case 'check':
            setMessage('White is in check!');
            break;
          case 'checkmate':
            setMessage('Checkmate! Black wins!');
            setGameOver(true);
            break;
          case 'stalemate':
            setMessage('Stalemate! Game is drawn.');
            setGameOver(true);
            break;
          default:
            setMessage(null);
        }

        setThinking(false);
      }, 500);
    }
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setMessage(null);
    setGameStatus('playing');
    setTime({ white: INITIAL_TIME, black: INITIAL_TIME });
    setCurrentPlayer('w');
    setGameOver(false);
    setThinking(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Brain className="w-8 h-8" />
              Chess AI
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <div className="text-sm font-mono">
                  <div>White: {formatTime(time.white)}</div>
                  <div>Black: {formatTime(time.black)}</div>
                </div>
              </div>
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
                onClick={resetGame}
              >
                <ChevronUndo className="w-4 h-4" />
                New Game
              </button>
            </div>
          </div>
          
          <div className="relative">
            <Chessboard board={board} onMove={handleMove} />
            {thinking && (
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                  Thinking...
                </div>
              </div>
            )}
          </div>
          
          {message && (
            <div className={`mt-4 p-2 rounded-lg text-center ${
              message.includes('wins') || message.includes('Checkmate')
                ? 'bg-green-100 text-green-800'
                : message.includes('check')
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {message}
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-600">
            <p>Drag and drop pieces to make your move. The AI will respond automatically.</p>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
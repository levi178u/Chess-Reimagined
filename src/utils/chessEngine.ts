import { Board, Position, PieceColor, Piece, GameStatus } from '../types/chess';

const PIECE_VALUES = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 100
};

export function evaluatePosition(board: Board): number {
  let score = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type] * (piece.color === 'w' ? 1 : -1);
        score += value;
      }
    }
  }
  
  return score;
}

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

export function isOwnPiece(board: Board, pos: Position, color: PieceColor): boolean {
  const piece = board[pos.row][pos.col];
  return piece !== null && piece.color === color;
}

export function isOpponentPiece(board: Board, pos: Position, color: PieceColor): boolean {
  const piece = board[pos.row][pos.col];
  return piece !== null && piece.color !== color;
}

function findKing(board: Board, color: PieceColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'k' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

export function isInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const opponentColor = color === 'w' ? 'b' : 'w';
  const opponentMoves = generateLegalMoves(board, opponentColor, false);

  return opponentMoves.some(move => 
    move.to.row === kingPos.row && move.to.col === kingPos.col
  );
}

export function isCheckmate(board: Board, color: PieceColor): boolean {
  if (!isInCheck(board, color)) return false;
  return generateLegalMoves(board, color, true).length === 0;
}

export function isStalemate(board: Board, color: PieceColor): boolean {
  if (isInCheck(board, color)) return false;
  return generateLegalMoves(board, color, true).length === 0;
}

function getPawnMoves(board: Board, pos: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const direction = piece.color === 'w' ? -1 : 1;
  const startRow = piece.color === 'w' ? 6 : 1;

  // Forward move
  const oneStep = { row: pos.row + direction, col: pos.col };
  if (isValidPosition(oneStep) && !board[oneStep.row][oneStep.col]) {
    moves.push(oneStep);
    
    // Two steps from starting position
    if (pos.row === startRow) {
      const twoStep = { row: pos.row + 2 * direction, col: pos.col };
      if (!board[twoStep.row][twoStep.col]) {
        moves.push(twoStep);
      }
    }
  }

  // Captures
  const captures = [
    { row: pos.row + direction, col: pos.col - 1 },
    { row: pos.row + direction, col: pos.col + 1 }
  ];

  for (const capture of captures) {
    if (isValidPosition(capture) && isOpponentPiece(board, capture, piece.color)) {
      moves.push(capture);
    }
  }

  return moves;
}

function getKnightMoves(board: Board, pos: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const patterns = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  for (const [rowOffset, colOffset] of patterns) {
    const newPos = {
      row: pos.row + rowOffset,
      col: pos.col + colOffset
    };

    if (isValidPosition(newPos) && !isOwnPiece(board, newPos, piece.color)) {
      moves.push(newPos);
    }
  }

  return moves;
}

function getBishopMoves(board: Board, pos: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  for (const [rowDir, colDir] of directions) {
    let currentPos = { row: pos.row + rowDir, col: pos.col + colDir };

    while (isValidPosition(currentPos)) {
      if (!board[currentPos.row][currentPos.col]) {
        moves.push({ ...currentPos });
      } else if (isOpponentPiece(board, currentPos, piece.color)) {
        moves.push({ ...currentPos });
        break;
      } else {
        break;
      }
      currentPos.row += rowDir;
      currentPos.col += colDir;
    }
  }

  return moves;
}

function getRookMoves(board: Board, pos: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [rowDir, colDir] of directions) {
    let currentPos = { row: pos.row + rowDir, col: pos.col + colDir };

    while (isValidPosition(currentPos)) {
      if (!board[currentPos.row][currentPos.col]) {
        moves.push({ ...currentPos });
      } else if (isOpponentPiece(board, currentPos, piece.color)) {
        moves.push({ ...currentPos });
        break;
      } else {
        break;
      }
      currentPos.row += rowDir;
      currentPos.col += colDir;
    }
  }

  return moves;
}

function getQueenMoves(board: Board, pos: Position, piece: Piece): Position[] {
  return [
    ...getBishopMoves(board, pos, piece),
    ...getRookMoves(board, pos, piece)
  ];
}

function getKingMoves(board: Board, pos: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (const [rowDir, colDir] of directions) {
    const newPos = {
      row: pos.row + rowDir,
      col: pos.col + colDir
    };

    if (isValidPosition(newPos) && !isOwnPiece(board, newPos, piece.color)) {
      moves.push(newPos);
    }
  }

  return moves;
}

export function getPieceMoves(board: Board, pos: Position, checkForCheck: boolean = true): { from: Position; to: Position }[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  let possibleMoves: Position[] = [];

  switch (piece.type) {
    case 'p':
      possibleMoves = getPawnMoves(board, pos, piece);
      break;
    case 'n':
      possibleMoves = getKnightMoves(board, pos, piece);
      break;
    case 'b':
      possibleMoves = getBishopMoves(board, pos, piece);
      break;
    case 'r':
      possibleMoves = getRookMoves(board, pos, piece);
      break;
    case 'q':
      possibleMoves = getQueenMoves(board, pos, piece);
      break;
    case 'k':
      possibleMoves = getKingMoves(board, pos, piece);
      break;
  }

  if (checkForCheck) {
    // Filter out moves that would leave or put the king in check
    possibleMoves = possibleMoves.filter(to => {
      const newBoard = makeMove(board, pos, to);
      return !isInCheck(newBoard, piece.color);
    });
  }

  return possibleMoves.map(to => ({ from: pos, to }));
}

export function isLegalMove(board: Board, from: Position, to: Position): boolean {
  const piece = board[from.row][from.col];
  if (!piece) return false;

  const legalMoves = getPieceMoves(board, from);
  return legalMoves.some(move => 
    move.to.row === to.row && move.to.col === to.col
  );
}

export function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0) {
    return evaluatePosition(board);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    const moves = generateLegalMoves(board, 'w');
    
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    
    return maxEval;
  } else {
    let minEval = Infinity;
    const moves = generateLegalMoves(board, 'b');
    
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    
    return minEval;
  }
}

function generateLegalMoves(board: Board, color: PieceColor, checkForCheck: boolean = true): { from: Position; to: Position }[] {
  const moves: { from: Position; to: Position }[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const pieceMoves = getPieceMoves(board, { row, col }, checkForCheck);
        moves.push(...pieceMoves);
      }
    }
  }
  
  return moves;
}

export function makeMove(board: Board, from: Position, to: Position): Board {
  const newBoard = board.map(row => [...row]);
  newBoard[to.row][to.col] = newBoard[from.row][from.col];
  newBoard[from.row][from.col] = null;
  return newBoard;
}

export function getBestMove(board: Board, color: PieceColor): { from: Position; to: Position } {
  const moves = generateLegalMoves(board, color);
  let bestMove = moves[0];
  let bestValue = -Infinity;
  
  for (const move of moves) {
    const newBoard = makeMove(board, move.from, move.to);
    const value = minimax(newBoard, 3, -Infinity, Infinity, false);
    
    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }
  
  return bestMove;
}

export function getGameStatus(board: Board, currentPlayer: PieceColor): GameStatus {
  if (isCheckmate(board, currentPlayer)) {
    return 'checkmate';
  }
  if (isStalemate(board, currentPlayer)) {
    return 'stalemate';
  }
  if (isInCheck(board, currentPlayer)) {
    return 'check';
  }
  return 'playing';
}
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';
export type Piece = {
  type: PieceType;
  color: PieceColor;
};
export type Square = Piece | null;
export type Board = Square[][];
export type Position = {
  row: number;
  col: number;
};
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate';
export type TimeControl = {
  white: number;
  black: number;
};
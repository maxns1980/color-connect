
import { BALL_COLORS } from './constants';

export type BallColor = typeof BALL_COLORS[number];
export type BallStyle = 'default' | 'heart' | 'gemstone' | 'square' | 'custom_png' | 'nintendo_png' | 'polityk_png';

export interface Ball {
  id: string;
  color: BallColor;
  powerUpType?: 'colorBomb'; // Added for Color Bomb
}

export type CellState = Ball | null;
export type BoardState = CellState[][];

export interface Position {
  row: number;
  col: number;
}

export interface SelectedBallEntity extends Position {
  id: string;
  color: BallColor;
}

export interface HighScoreEntry {
  name: string;
  score: number;
  date: string; // Added date field
}
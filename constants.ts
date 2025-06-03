

import { BallColor } from './types';

export const BOARD_ROWS = 8;
export const BOARD_COLS = 6;
export const MIN_MATCH_LENGTH = 2;
export const SMARTPHONE_CELL_SIZE_PX = 60; // Renamed from CELL_SIZE_PX, represents the base for 'smartphone' size
export const DISSOLVE_ANIMATION_DURATION_MS = 300;

// Power-up Constants
export const COLOR_BOMB_SPAWN_CHANCE = 0.05;
export const COLOR_BOMB_EFFECT_POINTS_PER_BALL = 10;

export const BALL_COLORS = ['yellow', 'red', 'blue', 'white', 'black', 'green'] as const;


export const TAILWIND_BG_COLORS: Record<BallColor, string> = {
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  white: 'bg-slate-100',
  black: 'bg-neutral-800',
  green: 'bg-green-500',
};

export const TAILWIND_TEXT_COLORS: Record<BallColor, string> = {
  yellow: 'text-yellow-400',
  red: 'text-red-500',
  blue: 'text-blue-500',
  white: 'text-slate-100',
  black: 'text-neutral-800', 
  green: 'text-green-500',
};

export const TAILWIND_STROKE_COLORS: Record<BallColor, string> = {
  yellow: 'stroke-yellow-600',
  red: 'stroke-red-700',
  blue: 'stroke-blue-700',
  white: 'stroke-slate-400',
  black: 'stroke-neutral-500',
  green: 'stroke-green-700',
};

export const TAILWIND_BORDER_COLORS: Record<BallColor, string> = {
    yellow: 'border-yellow-600',
    red: 'border-red-700',
    blue: 'border-blue-700',
    white: 'border-slate-400',
    black: 'border-neutral-500',
    green: 'border-green-700',
};

// High Score Constants
export const MAX_HIGH_SCORES = 20; 
export const TOP_SCORES_TO_DISPLAY = 3; 
export const LOCAL_STORAGE_KEY = 'colorConnectHighScores';

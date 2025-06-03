

import React from 'react';
import { BoardState, SelectedBallEntity, Ball, Position, BallStyle } from '../types';
import BallCell from './BallCell';
import { BOARD_ROWS, BOARD_COLS, TAILWIND_STROKE_COLORS, MIN_MATCH_LENGTH } from '../constants'; // CELL_SIZE_PX removed

interface GameBoardProps {
  board: BoardState;
  selectedBalls: SelectedBallEntity[];
  dissolvingBalls: Position[];
  onBallMouseDown: (row: number, col: number, ball: Ball) => void;
  onBallMouseEnter: (row: number, col: number, ball: Ball | null) => void;
  gridRef: React.Ref<HTMLDivElement>;
  backgroundImageUrl: string | null;
  ballStyle: BallStyle;
  effectiveCellSize: number; // New prop for dynamic cell size
  effectiveLineStrokeWidth: string; // New prop for dynamic line thickness
  // BallCell also needs its effective props, passed down
  effectiveHeartTextSizeClass: string;
  effectivePowerUpRingStyles: { inset: string; border: string };
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedBalls,
  dissolvingBalls,
  onBallMouseDown,
  onBallMouseEnter,
  gridRef,
  backgroundImageUrl,
  ballStyle,
  effectiveCellSize, // Destructure new prop
  effectiveLineStrokeWidth, // Destructure new prop
  effectiveHeartTextSizeClass,
  effectivePowerUpRingStyles
}) => {
  const svgWidth = BOARD_COLS * effectiveCellSize;
  const svgHeight = BOARD_ROWS * effectiveCellSize;

  const linePoints = selectedBalls
    .map(ball => `${ball.col * effectiveCellSize + effectiveCellSize / 2},${ball.row * effectiveCellSize + effectiveCellSize / 2}`)
    .join(' ');

  const currentLineColor = selectedBalls.length > 0 ? TAILWIND_STROKE_COLORS[selectedBalls[0].color] : 'stroke-transparent';

  return (
    <div
      className="relative p-2 rounded-lg shadow-2xl"
      style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
    >
      <div
        ref={gridRef}
        className="grid gap-0"
        style={{
          gridTemplateRows: `repeat(${BOARD_ROWS}, ${effectiveCellSize}px)`,
          gridTemplateColumns: `repeat(${BOARD_COLS}, ${effectiveCellSize}px)`,
          backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          overflow: 'hidden',
        }}
      >
        {board.map((rowState, rowIndex) =>
          rowState.map((cell, colIndex) => {
            const isCellDissolving = dissolvingBalls.some(dBall => dBall.row === rowIndex && dBall.col === colIndex);
            return (
              <BallCell
                key={`${rowIndex}-${colIndex}-${cell?.id || 'empty'}`}
                ball={cell}
                isSelected={selectedBalls.some(b => b.row === rowIndex && b.col === colIndex)}
                isDissolving={isCellDissolving}
                onMouseDown={() => {
                  if (cell) {
                    onBallMouseDown(rowIndex, colIndex, cell);
                  }
                }}
                onMouseEnter={() => {
                  onBallMouseEnter(rowIndex, colIndex, cell);
                }}
                ballStyle={ballStyle}
                effectiveCellSize={effectiveCellSize} // Pass down
                effectiveHeartTextSizeClass={effectiveHeartTextSizeClass} // Pass down
                effectivePowerUpRingStyles={effectivePowerUpRingStyles} // Pass down
                isPreview={false} // Game cells are never previews
              />
            );
          })
        )}
      </div>
      {selectedBalls.length >= MIN_MATCH_LENGTH && (
        <svg
          className="absolute top-2 left-2 pointer-events-none"
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          <polyline
            points={linePoints}
            className={`${currentLineColor} transition-all duration-50 ease-linear`}
            fill="none"
            strokeWidth={effectiveLineStrokeWidth} // Use dynamic stroke width
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};

export default GameBoard;

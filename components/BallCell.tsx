
import React from 'react';
import { Ball, BallStyle, BallColor } from '../types';
import { TAILWIND_BG_COLORS, TAILWIND_TEXT_COLORS, BALL_COLORS, SMARTPHONE_CELL_SIZE_PX } from '../constants'; // CELL_SIZE_PX renamed to SMARTPHONE_CELL_SIZE_PX

interface BallCellProps {
  ball: Ball | null;
  isSelected: boolean;
  isDissolving: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  ballStyle: BallStyle;
  isPreview?: boolean;
  // Effective size props, only used if !isPreview
  effectiveCellSize?: number;
  effectiveHeartTextSizeClass?: string;
  effectivePowerUpRingStyles?: { inset: string; border: string };
}

const BallCell: React.FC<BallCellProps> = ({
  ball,
  isSelected,
  isDissolving,
  onMouseDown,
  onMouseEnter,
  ballStyle,
  isPreview = false,
  effectiveCellSize = SMARTPHONE_CELL_SIZE_PX, // Default to smartphone size
  effectiveHeartTextSizeClass = 'text-4xl', // Default
  effectivePowerUpRingStyles = { inset: 'inset-[-5px]', border: 'border-[3px]' } // Default
}) => {
  
  const currentCellSize = isPreview ? 40 : effectiveCellSize;
  const cellSizeStyle = { width: `${currentCellSize}px`, height: `${currentCellSize}px` };
  
  const currentHeartTextSize = isPreview ? 'text-2xl' : effectiveHeartTextSizeClass;
  const currentPowerUpRingInset = isPreview ? 'inset-[-3px]' : effectivePowerUpRingStyles.inset;
  const currentPowerUpRingBorder = isPreview ? 'border-[2px]' : effectivePowerUpRingStyles.border;

  const ballDisplaySizeClass = isPreview 
    ? 'w-full h-full' 
    : (ballStyle === 'polityk_png' ? 'w-[85%] h-[85%]' : 'w-[75%] h-[75%]');


  return (
    <div
      className={`ball-cell ${isPreview ? 'p-0' : ''} flex items-center justify-center ${!isPreview ? 'border border-slate-600' : ''} transition-all duration-150 ease-in-out`}
      style={cellSizeStyle}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onTouchStart={onMouseDown}
    >
      {ball && (
        <div
          className={`
            relative
            ${ballDisplaySizeClass} flex items-center justify-center
            ${!isPreview ? 'shadow-md' : ''}
            ${isDissolving
              ? 'opacity-0 scale-75 transition-opacity transition-transform duration-300 ease-in-out'
              : `opacity-100 ${isSelected && !isPreview ? 'scale-110' : 'scale-100'} transition-transform duration-100 ease-in-out`
            }
          `}
        >
          {ballStyle === 'default' ? (
            <div className={`${TAILWIND_BG_COLORS[ball.color]} w-full h-full rounded-full`}>
            </div>
          ) : ballStyle === 'heart' ? (
            <span
              className={`
                ${TAILWIND_TEXT_COLORS[ball.color]}
                ${currentHeartTextSize} 
                font-bold
              `}
              aria-label={`${ball.color} heart`}
            >
              ❤
            </span>
          ) : ballStyle === 'gemstone' ? (
            <div className={`${TAILWIND_BG_COLORS[ball.color]} w-full h-full rounded-full relative shadow-inner`}>
              <div
                className="absolute top-[10%] left-[10%] w-[35%] h-[35%] rounded-full opacity-80"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 60%)'
                }}
                aria-hidden="true"
              />
            </div>
          ) : ballStyle === 'square' ? (
            <div className={`${TAILWIND_BG_COLORS[ball.color]} w-full h-full rounded-md`}>
            </div>
          ) : ballStyle === 'custom_png' ? (
            <img
              src={`/images/ball_styles/custom/${ball.color}.png`}
              alt={`${ball.color} custom image`}
              className="w-full h-full object-contain"
              draggable="false"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = `${TAILWIND_BG_COLORS[ball.color]} w-full h-full rounded-sm flex items-center justify-center text-xs text-white`;
                    fallbackDiv.innerText = "PNG?";
                    parent.appendChild(fallbackDiv);
                }
              }}
            />
           ) : ballStyle === 'nintendo_png' ? (
            <img
              src={`/images/ball_styles/nintendo/nintendo${BALL_COLORS.indexOf(ball.color) + 1}.png`}
              alt={`${ball.color} nintendo image`}
              className="w-full h-full object-contain"
              draggable="false"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = `${TAILWIND_BG_COLORS[ball.color]} w-full h-full rounded-sm flex items-center justify-center text-xs text-white`;
                    fallbackDiv.innerText = "NIN?"; 
                    parent.appendChild(fallbackDiv);
                }
              }}
            />
          ) : ballStyle === 'polityk_png' ? (
            <img
              src={`/images/ball_styles/polityk/polityk${BALL_COLORS.indexOf(ball.color) + 1}.png`}
              alt={`${ball.color} polityk image`}
              className="w-full h-full object-contain"
              draggable="false"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = `${TAILWIND_BG_COLORS[ball.color]} w-full h-full rounded-sm flex items-center justify-center text-xs text-white`;
                    fallbackDiv.innerText = "POL?"; 
                    parent.appendChild(fallbackDiv);
                }
              }}
            />
          ) : null}

          {ball.powerUpType === 'colorBomb' && !isDissolving && (
             <div
                className={`absolute ${currentPowerUpRingInset} ${currentPowerUpRingBorder} border-transparent rounded-full animate-borderColorPulse pointer-events-none`}
                aria-hidden="true"
            ></div>
          )}
        </div>
      )}
    </div>
  );
};

export default BallCell;

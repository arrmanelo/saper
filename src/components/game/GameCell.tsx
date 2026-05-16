import React, { useCallback } from 'react';
import { Flag, Bomb } from 'lucide-react';
import type { Cell } from '@/types';
import { useGameStore } from '@/hooks/useGameStore';

interface GameCellProps {
  cell: Cell;
  size: number;
  onReveal: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
  onChord: (x: number, y: number) => void;
  isGameOver: boolean;
}

const NUMBER_COLORS = [
  '',
  'text-blue-600 dark:text-blue-400',
  'text-green-600 dark:text-green-400',
  'text-red-600 dark:text-red-400',
  'text-purple-600 dark:text-purple-400',
  'text-yellow-600 dark:text-yellow-400',
  'text-pink-600 dark:text-pink-400',
  'text-gray-900 dark:text-gray-100',
  'text-gray-700 dark:text-gray-300',
];

export const GameCell = React.memo(function GameCell({
  cell,
  size,
  onReveal,
  onFlag,
  onChord,
  isGameOver,
}: GameCellProps) {
  const { settings } = useGameStore();
  const { showProbability } = settings;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (isGameOver) return;
      onReveal(cell.x, cell.y);
    },
    [cell.x, cell.y, onReveal, isGameOver]
  );

  const handleRightClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (isGameOver) return;
      onFlag(cell.x, cell.y);
    },
    [cell.x, cell.y, onFlag, isGameOver]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (isGameOver) return;
      onChord(cell.x, cell.y);
    },
    [cell.x, cell.y, onChord, isGameOver]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Long press for flag on mobile
      const timer = setTimeout(() => {
        e.preventDefault();
        if (!isGameOver) onFlag(cell.x, cell.y);
      }, 500);
      (e.currentTarget as any)._longPressTimer = timer;
    },
    [cell.x, cell.y, onFlag, isGameOver]
  );

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const timer = (e.currentTarget as any)._longPressTimer;
    if (timer) clearTimeout(timer);
  }, []);

  const getCellContent = () => {
    if (cell.isFlagged) {
      return (
        <div className="flag-wave flex items-center justify-center">
          <Flag className="w-[60%] h-[60%] text-mine-flag" fill="currentColor" />
        </div>
      );
    }

    if (!cell.isRevealed) {
      return null;
    }

    if (cell.isMine) {
      return (
        <div className="mine-explode flex items-center justify-center">
          <Bomb className="w-[60%] h-[60%] text-mine-danger" />
        </div>
      );
    }

    if (cell.neighborMines > 0) {
      return (
        <span className={`font-bold text-lg select-none ${NUMBER_COLORS[cell.neighborMines]}`}>
          {cell.neighborMines}
        </span>
      );
    }

    return null;
  };

  const getCellStyle = () => {
    if (cell.isRevealed) {
      if (cell.isMine) {
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
      }
      return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }

    if (cell.isFlagged) {
      return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30';
    }

    // Hidden cell
    return 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95';
  };

  const getProbabilityStyle = () => {
    if (!showProbability || cell.isRevealed || cell.isFlagged || cell.probability === undefined) return '';

    const prob = cell.probability;
    if (prob === 0) return 'ring-2 ring-green-500 ring-offset-1';
    if (prob === 1) return 'ring-2 ring-red-500 ring-offset-1';
    if (prob < 0.2) return 'ring-1 ring-green-400';
    if (prob < 0.5) return 'ring-1 ring-yellow-400';
    if (prob < 0.8) return 'ring-1 ring-orange-400';
    return 'ring-1 ring-red-400';
  };

  return (
    <div
      className={`
        relative flex items-center justify-center
        border rounded-sm cursor-pointer
        transition-all duration-75
        ${getCellStyle()}
        ${getProbabilityStyle()}
        cell-reveal
      `}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
      }}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {getCellContent()}

      {/* Probability indicator */}
      {showProbability && !cell.isRevealed && !cell.isFlagged && cell.probability !== undefined && (
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full text-[8px] flex items-center justify-center font-bold
          ${cell.probability === 0 ? 'bg-green-500 text-slate-900 dark:text-white' : 
            cell.probability === 1 ? 'bg-red-500 text-slate-900 dark:text-white' :
            cell.probability < 0.3 ? 'bg-green-400 text-slate-900 dark:text-white' :
            cell.probability < 0.6 ? 'bg-yellow-400 text-black' :
            'bg-red-400 text-slate-900 dark:text-white'}`}
        >
          {Math.round(cell.probability * 100)}
        </div>
      )}
    </div>
  );
});

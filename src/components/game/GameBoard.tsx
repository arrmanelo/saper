import React, { useCallback, useMemo } from 'react';
import { GameCell } from './GameCell';
import { useGameStore } from '@/hooks/useGameStore';
import type { Difficulty } from '@/types';

const CELL_SIZES: Record<string, number> = {
  small: 28,
  medium: 36,
  large: 44,
};

const BOARD_MAX_WIDTH: Record<Difficulty, number> = {
  beginner: 320,
  intermediate: 480,
  expert: 600,
  custom: 600,
};

export function GameBoard() {
  const { game, reveal, flag, chord, settings } = useGameStore();
  const { board, status, config, difficulty } = game;
  const { cellSize } = settings;

  const size = CELL_SIZES[cellSize] || 36;
  const isGameOver = status === 'won' || status === 'lost';

  const handleReveal = useCallback((x: number, y: number) => reveal(x, y), [reveal]);
  const handleFlag = useCallback((x: number, y: number) => flag(x, y), [flag]);
  const handleChord = useCallback((x: number, y: number) => chord(x, y), [chord]);

  const boardWidth = useMemo(() => config.width * size, [config.width, size]);
  const boardHeight = useMemo(() => config.height * size, [config.height, size]);
  const maxWidth = BOARD_MAX_WIDTH[difficulty] || 600;

  const scale = useMemo(() => {
    if (boardWidth <= maxWidth) return 1;
    return maxWidth / boardWidth;
  }, [boardWidth, maxWidth]);

  return (
    <div className="flex flex-col items-center">
      <div 
        className="game-board relative overflow-hidden rounded-lg shadow-2xl"
        style={{
          width: boardWidth * scale,
          height: boardHeight * scale,
        }}
      >
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${config.width}, ${size}px)`,
            gridTemplateRows: `repeat(${config.height}, ${size}px)`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: boardWidth,
            height: boardHeight,
          }}
        >
          {board.map((row, y) =>
            row.map((cell, x) => (
              <GameCell
                key={`${x}-${y}`}
                cell={cell}
                size={size}
                onReveal={handleReveal}
                onFlag={handleFlag}
                onChord={handleChord}
                isGameOver={isGameOver}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

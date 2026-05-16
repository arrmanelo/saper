import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Difficulty, GameConfig, Cell, UserSettings } from '@/types';
import { DIFFICULTY_CONFIG } from '@/types';
import {
  createBoard,
  generateSeed,
  getDailySeed,
  revealCell,
  toggleFlag,
  chordClick,
  checkWin,
  checkLoss,
  revealAllMines,
  getFlagCount,
  calculateProbabilities,
} from '@/utils/game-logic';

interface GameStore {
  game: GameState;
  settings: UserSettings;
  highScores: Record<string, number>;

  // Actions
  newGame: (difficulty?: Difficulty, customConfig?: GameConfig, daily?: boolean) => void;
  reveal: (x: number, y: number) => void;
  flag: (x: number, y: number) => void;
  chord: (x: number, y: number) => void;
  pause: () => void;
  resume: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetStats: () => void;
}

const createInitialState = (difficulty: Difficulty = 'beginner', customConfig?: GameConfig, daily?: boolean): GameState => {
  const config = customConfig || DIFFICULTY_CONFIG[difficulty];
  const seed = daily ? getDailySeed(new Date().toISOString().split('T')[0]) : generateSeed();

  return {
    board: createBoard(config, seed),
    status: 'idle',
    difficulty,
    config,
    time: 0,
    flags: 0,
    moves: 0,
    startTime: null,
    endTime: null,
    seed,
    dailyChallenge: daily,
  };
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: createInitialState(),
      settings: {
        theme: 'system',
        soundEnabled: true,
        vibrationEnabled: true,
        showProbability: false,
        autoFlag: false,
        cellSize: 'medium',
        skin: 'classic',
      },
      highScores: {},

      newGame: (difficulty = 'beginner', customConfig, daily) => {
        const state = createInitialState(difficulty, customConfig, daily);
        set({ game: state });
      },

      reveal: (x, y) => {
        const { game, settings } = get();
        if (game.status === 'won' || game.status === 'lost') return;

        let newBoard = game.board.map(row => row.map(cell => ({ ...cell })));

        // First click - ensure it's not a mine
        if (game.status === 'idle') {
          const cell = newBoard[y][x];
          if (cell.isMine) {
            // Regenerate board without mine at this position
            const positions: [number, number][] = [];
            for (let yy = 0; yy < game.config.height; yy++) {
              for (let xx = 0; xx < game.config.width; xx++) {
                if (xx !== x || yy !== y) positions.push([xx, yy]);
              }
            }

            // Simple reshuffle: swap mine with random non-mine
            let swapped = false;
            for (let yy = 0; yy < game.config.height && !swapped; yy++) {
              for (let xx = 0; xx < game.config.width && !swapped; xx++) {
                if (!newBoard[yy][xx].isMine && (xx !== x || yy !== y)) {
                  newBoard[y][x].isMine = false;
                  newBoard[yy][xx].isMine = true;
                  swapped = true;
                }
              }
            }

            // Recalculate neighbors
            for (let yy = 0; yy < game.config.height; yy++) {
              for (let xx = 0; xx < game.config.width; xx++) {
                if (!newBoard[yy][xx].isMine) {
                  let count = 0;
                  for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                      const ny = yy + dy;
                      const nx = xx + dx;
                      if (ny >= 0 && ny < game.config.height && nx >= 0 && nx < game.config.width) {
                        if (newBoard[ny][nx].isMine) count++;
                      }
                    }
                  }
                  newBoard[yy][xx].neighborMines = count;
                }
              }
            }
          }

          newBoard = revealCell(newBoard, x, y);

          if (settings.showProbability) {
            newBoard = calculateProbabilities(newBoard);
          }

          set({
            game: {
              ...game,
              board: newBoard,
              status: 'playing',
              startTime: Date.now(),
              moves: 1,
            },
          });
          return;
        }

        if (game.status === 'paused') return;

        const cell = newBoard[y][x];
        if (cell.isFlagged || cell.isRevealed) return;

        newBoard = revealCell(newBoard, x, y);

        if (checkLoss(newBoard)) {
          newBoard = revealAllMines(newBoard);
          set({
            game: {
              ...game,
              board: newBoard,
              status: 'lost',
              endTime: Date.now(),
              moves: game.moves + 1,
            },
          });
          return;
        }

        if (checkWin(newBoard)) {
          set({
            game: {
              ...game,
              board: newBoard,
              status: 'won',
              endTime: Date.now(),
              moves: game.moves + 1,
              flags: getFlagCount(newBoard),
            },
            highScores: {
              ...get().highScores,
              [game.difficulty]: Math.min(
                get().highScores[game.difficulty] || Infinity,
                game.time
              ),
            },
          });
          return;
        }

        if (settings.showProbability) {
          newBoard = calculateProbabilities(newBoard);
        }

        set({
          game: {
            ...game,
            board: newBoard,
            moves: game.moves + 1,
          },
        });
      },

      flag: (x, y) => {
        const { game, settings } = get();
        if (game.status !== 'playing' && game.status !== 'idle') return;

        const newBoard = toggleFlag(game.board, x, y);
        const flags = getFlagCount(newBoard);

        if (settings.showProbability) {
          const boardWithProbs = calculateProbabilities(newBoard);
          set({
            game: {
              ...game,
              board: boardWithProbs,
              flags,
            },
          });
        } else {
          set({
            game: {
              ...game,
              board: newBoard,
              flags,
            },
          });
        }
      },

      chord: (x, y) => {
        const { game, settings } = get();
        if (game.status !== 'playing') return;

        let newBoard = chordClick(game.board, x, y);

        if (checkLoss(newBoard)) {
          newBoard = revealAllMines(newBoard);
          set({
            game: {
              ...game,
              board: newBoard,
              status: 'lost',
              endTime: Date.now(),
            },
          });
          return;
        }

        if (checkWin(newBoard)) {
          set({
            game: {
              ...game,
              board: newBoard,
              status: 'won',
              endTime: Date.now(),
              flags: getFlagCount(newBoard),
            },
          });
          return;
        }

        if (settings.showProbability) {
          newBoard = calculateProbabilities(newBoard);
        }

        set({
          game: {
            ...game,
            board: newBoard,
            moves: game.moves + 1,
          },
        });
      },

      pause: () => {
        const { game } = get();
        if (game.status === 'playing') {
          set({ game: { ...game, status: 'paused' } });
        }
      },

      resume: () => {
        const { game } = get();
        if (game.status === 'paused') {
          set({ game: { ...game, status: 'playing' } });
        }
      },

      updateSettings: (newSettings) => {
        const { settings, game } = get();
        const updated = { ...settings, ...newSettings };

        let newBoard = game.board;
        if (newSettings.showProbability !== undefined && game.status === 'playing') {
          newBoard = newSettings.showProbability 
            ? calculateProbabilities(game.board)
            : game.board.map(row => row.map(cell => ({ ...cell, probability: undefined, isSafe: undefined, isMineCertain: undefined })));
        }

        set({ 
          settings: updated,
          game: { ...game, board: newBoard },
        });
      },

      resetStats: () => {
        set({ highScores: {} });
      },
    }),
    {
      name: 'minesweeper-pro-storage',
      partialize: (state) => ({ settings: state.settings, highScores: state.highScores }),
    }
  )
);

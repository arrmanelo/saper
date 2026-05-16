export type Difficulty = 'beginner' | 'intermediate' | 'expert' | 'custom';

export interface GameConfig {
  width: number;
  height: number;
  mines: number;
  name: string;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, GameConfig> = {
  beginner: { width: 8, height: 8, mines: 10, name: 'Новичок' },
  intermediate: { width: 16, height: 16, mines: 40, name: 'Любитель' },
  expert: { width: 30, height: 16, mines: 99, name: 'Эксперт' },
  custom: { width: 20, height: 20, mines: 50, name: 'Пользовательский' },
};

export type CellState = 'hidden' | 'revealed' | 'flagged' | 'questioned';

export interface Cell {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  probability?: number; // AI Coach: вероятность мины (0-1)
  isSafe?: boolean; // AI Coach: точно безопасно
  isMineCertain?: boolean; // AI Coach: точно мина
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost' | 'paused';

export interface GameState {
  board: Cell[][];
  status: GameStatus;
  difficulty: Difficulty;
  config: GameConfig;
  time: number;
  flags: number;
  moves: number;
  startTime: number | null;
  endTime: number | null;
  seed: string;
  dailyChallenge?: boolean;
}

export interface GameHistory {
  id: string;
  userId: string;
  difficulty: Difficulty;
  result: 'won' | 'lost';
  time: number;
  moves: number;
  flags: number;
  date: string;
  seed: string;
  city?: string;
  country?: string;
  dailyChallenge?: boolean;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  difficulty: Difficulty;
  time: number;
  moves: number;
  date: string;
  city?: string;
  country?: string;
  dailyChallenge?: boolean;
  dailyDate?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  city?: string;
  country?: string;
  createdAt: string;
  isPro: boolean;
  proExpiresAt?: string;
  stats: UserStats;
  settings: UserSettings;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  bestTimeBeginner: number | null;
  bestTimeIntermediate: number | null;
  bestTimeExpert: number | null;
  totalTime: number;
  avgTime: number;
  currentStreak: number;
  bestStreak: number;
  flagsPlaced: number;
  minesFound: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showProbability: boolean;
  autoFlag: boolean;
  cellSize: 'small' | 'medium' | 'large';
  skin: string;
}

export interface DailyChallenge {
  date: string;
  seed: string;
  difficulty: Difficulty;
  config: GameConfig;
  participants: number;
  bestTime: number | null;
}

export interface AICoachSuggestion {
  type: 'safe' | 'mine' | 'guess' | 'flag' | 'open';
  cells: { x: number; y: number }[];
  message: string;
  confidence: number;
  explanation: string;
}

export interface Skin {
  id: string;
  name: string;
  description: string;
  price: number;
  colors: {
    hidden: string;
    revealed: string;
    mine: string;
    flag: string;
    numbers: string[];
  };
  isPremium: boolean;
}

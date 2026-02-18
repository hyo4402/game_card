export type GameMode = 'HOME' | 'TIENLEN' | 'XIDACH';

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface RoundHistory {
  id: string;
  timestamp: number;
  description: string;
  scoreChanges: Record<string, number>;
}

export interface GameState {
  players: Player[];
  history: RoundHistory[];
  dealerId?: string; // Cho Xì Dách
  defaultBets?: Record<string, number>; // Lưu mức cược gần nhất
  tienLenRules?: {
    FIRST: number;
    SECOND: number;
    THIRD: number;
    LAST: number;
    PIG_BLACK: number;
    PIG_RED: number;
  };
}

export const DEFAULT_RULES = {
  FIRST: 5,
  SECOND: 3,
  THIRD: -3,
  LAST: -5,
  PIG_BLACK: 3,
  PIG_RED: 5,
};
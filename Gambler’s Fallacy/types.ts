
export type GameMode = 'coin' | 'dice';

export interface GameRound {
  id: string;
  timestamp: number;
  mode: GameMode;
  prediction: string;
  confidence: number;
  betAmount: number;
  outcome: string;
  isWin: boolean;
  streakBefore: number;
  streakType: string;
}

export interface UserStats {
  points: number;
  wins: number;
  losses: number;
  totalBets: number;
}

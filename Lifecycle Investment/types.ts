
export enum CareerType {
  STABLE = 'STABLE',
  CYCLICAL = 'CYCLICAL'
}

export interface YearRecord {
  age: number;
  wealth: number;
  income: number;
  consumption: number;
  savings: number;
  portfolioReturn: number;
  inflation: number;
  event?: string;
  utility: number;
}

export interface SimulationRecord {
  id: string;
  timestamp: number;
  careerType: CareerType;
  finalWealth: number;
  score: number;
  ageReached: number;
  wasRuin: boolean;
}

export interface GameState {
  age: number;
  wealth: number;
  income: number;
  careerType: CareerType;
  history: YearRecord[];
  isGameOver: boolean;
  totalUtility: number;
}

export interface SimulationParams {
  stockReturn: number;
  bondReturn: number;
  cashReturn: number;
  inflation: number;
  shockOccurred: boolean;
  shockType?: 'HEALTH' | 'EMPLOYMENT' | 'NONE';
  shockCost: number;
}

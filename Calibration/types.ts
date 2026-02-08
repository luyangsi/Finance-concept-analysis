
export enum AppState {
  START = 'START',
  MODULE_A = 'MODULE_A',
  REFLECTION = 'REFLECTION',
  MODULE_B = 'MODULE_B',
  RESULTS = 'RESULTS'
}

export interface Question {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  correctOption: 'A' | 'B';
  category: string;
}

export interface UserResponse {
  questionId: string;
  selectedOption: 'A' | 'B';
  probability: number; // 0.5 to 1.0
  isCorrect: boolean;
  timeSpent: number;
  rationale: string;
}

export interface CalibrationBin {
  binLabel: string;
  meanProbability: number;
  observedAccuracy: number;
  count: number;
}

export interface ModuleResults {
  brierScore: number;
  rawAccuracy: number;
  calibrationError: number;
  responses: UserResponse[];
  bins: CalibrationBin[];
}

export interface SessionResults {
  moduleA: ModuleResults;
  moduleB: ModuleResults;
  feedback: string;
  adaptiveShift: string;
}

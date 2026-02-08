
import { Question } from './types';

export const MODULE_A_COUNT = 15;
export const MODULE_B_COUNT = 10;

export const PROBABILITY_BUCKETS = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

export const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 'f1',
    text: "Which is taller?",
    optionA: "Eiffel Tower",
    optionB: "Statue of Liberty",
    correctOption: 'A',
    category: 'Estimation'
  },
  {
    id: 'f2',
    text: "Which city is further South?",
    optionA: "Rome, Italy",
    optionB: "Chicago, USA",
    correctOption: 'B',
    category: 'Geography'
  }
];

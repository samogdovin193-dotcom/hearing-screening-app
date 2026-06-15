export interface Answer {
  level: number;
  correct: string;
  user: string;
}

export interface TestState {
  currentRound: number;
  scoreCorrect: number;
  scoreWrong: number;
  wrongInRow: number;
  answerHistory: Answer[];
  isPlaying: boolean;
  randomSequence: string[];
}

export type TestMode = "reproduktor" | "sluchadla";
export type EarSide = "lave" | "prave" | null;
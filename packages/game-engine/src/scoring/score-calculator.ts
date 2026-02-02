export type ScoreInput = {
  correct: boolean;
  hintsUsed: number;
  basePoints?: number;
  hintPenalty?: number;
};

export function calculateScore({ correct, hintsUsed, basePoints = 10, hintPenalty = 2 }: ScoreInput) {
  if (!correct) return 0;
  const penalty = Math.max(0, hintsUsed) * hintPenalty;
  return Math.max(0, basePoints - penalty);
}

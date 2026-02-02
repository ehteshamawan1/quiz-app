export const TemplateTypes = {
  MCQ: "mcq",
  HINT_DISCOVERY: "hint_discovery",
  DRAG_DROP: "drag_drop",
  WORD_CROSS: "word_cross",
  FLASHCARDS: "flashcards",
  TIMED_QUIZ: "timed_quiz"
} as const;

export type TemplateType = (typeof TemplateTypes)[keyof typeof TemplateTypes];

// Template configuration interfaces
export interface HintDiscoveryConfig {
  maxHints: number;
  hintPenalty: number;
  hintRevealMethod: "manual" | "timed";
  basePoints: number;
  allowSkip: boolean;
}

export interface DragDropConfig {
  dragDropType: "match" | "sequence" | "label";
  allowMultipleAttempts: boolean;
  autoValidate: boolean;
}

export interface WordCrossConfig {
  gridSize: number;
  allowHintLetters: boolean;
  letterPenalty: number;
}

export interface FlashcardsConfig {
  includeImages: boolean;
  shuffleCards: boolean;
  selfRating: boolean;
}

export interface TimedQuizConfig {
  timePerQuestion: number;
  showTimer: boolean;
  autoAdvance: boolean;
  streakBonus: boolean;
}

export type TemplateConfig =
  | HintDiscoveryConfig
  | DragDropConfig
  | WordCrossConfig
  | FlashcardsConfig
  | TimedQuizConfig;

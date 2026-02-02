-- Migration: 012_flashcard_fields
-- Description: Add fields for flashcard template
-- Date: 2026-01-21

-- Add image_url column to game_questions for optional images
ALTER TABLE game_questions
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Add card_front column for flashcard front content
ALTER TABLE game_questions
ADD COLUMN IF NOT EXISTS card_front TEXT;

-- Add card_back column for flashcard back content
ALTER TABLE game_questions
ADD COLUMN IF NOT EXISTS card_back TEXT;

-- For flashcards template:
-- - card_front: The term or question (can also use existing 'prompt' field)
-- - card_back: The definition or answer (can also use existing 'explanation' field)
-- - image_url: Optional image for visual learning

-- Update existing questions to use prompt as card_front if needed
UPDATE game_questions
SET card_front = prompt
WHERE card_front IS NULL AND prompt IS NOT NULL;

UPDATE game_questions
SET card_back = explanation
WHERE card_back IS NULL AND explanation IS NOT NULL;

COMMENT ON COLUMN game_questions.image_url IS 'Optional image URL for questions (especially flashcards)';
COMMENT ON COLUMN game_questions.card_front IS 'Front of flashcard (term/question)';
COMMENT ON COLUMN game_questions.card_back IS 'Back of flashcard (definition/answer)';

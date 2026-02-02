-- Migration: 009_template_types_data
-- Description: Seed template types and update templates table with type field
-- Date: 2026-01-21

-- Add type column to templates table if it doesn't exist
ALTER TABLE templates
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'mcq';

-- Add config column to templates table for template-specific settings
ALTER TABLE templates
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';

-- Update existing MCQ template with type
UPDATE templates
SET type = 'mcq',
    config = '{"allowMultipleAnswers": false, "shuffleAnswers": true}'
WHERE type IS NULL OR type = 'mcq';

-- Insert new template types safely
DO $$
BEGIN
    -- Hint-Based Discovery
    IF NOT EXISTS (SELECT 1 FROM templates WHERE type = 'hint_discovery') THEN
        INSERT INTO templates (id, name, type, description, is_published, is_featured, config, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Hint-Based Discovery', 'hint_discovery', 'Progressive hint reveal game where students can unlock hints to help answer questions', true, true, '{"maxHints": 5, "hintPenalty": 2, "hintRevealMethod": "manual", "basePoints": 10, "allowSkip": false}', NOW(), NOW());
    END IF;

    -- Drag and Drop
    IF NOT EXISTS (SELECT 1 FROM templates WHERE type = 'drag_drop') THEN
        INSERT INTO templates (id, name, type, description, is_published, is_featured, config, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Drag and Drop', 'drag_drop', 'Match items to categories or arrange in correct order', true, true, '{"dragDropType": "match", "allowMultipleAttempts": false, "autoValidate": true}', NOW(), NOW());
    END IF;

    -- Word Cross
    IF NOT EXISTS (SELECT 1 FROM templates WHERE type = 'word_cross') THEN
        INSERT INTO templates (id, name, type, description, is_published, is_featured, config, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Word Cross', 'word_cross', 'Crossword puzzle game with clues and hints', true, true, '{"gridSize": 15, "allowHintLetters": true, "letterPenalty": 1}', NOW(), NOW());
    END IF;

    -- Flashcards
    IF NOT EXISTS (SELECT 1 FROM templates WHERE type = 'flashcards') THEN
        INSERT INTO templates (id, name, type, description, is_published, is_featured, config, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Flashcards', 'flashcards', 'Study cards with self-rating and mastery tracking', true, true, '{"includeImages": true, "shuffleCards": true, "selfRating": true}', NOW(), NOW());
    END IF;

    -- Timed Rapid-Fire Quiz
    IF NOT EXISTS (SELECT 1 FROM templates WHERE type = 'timed_quiz') THEN
        INSERT INTO templates (id, name, type, description, is_published, is_featured, config, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Timed Rapid-Fire Quiz', 'timed_quiz', 'Fast-paced MCQ with strict time limits per question', true, true, '{"timePerQuestion": 15, "showTimer": true, "autoAdvance": true, "streakBonus": false}', NOW(), NOW());
    END IF;
END $$;

-- Add type column to games table to store selected template type
ALTER TABLE games
ADD COLUMN IF NOT EXISTS template_type VARCHAR(50) DEFAULT 'mcq';

-- Update existing games to have mcq template type
UPDATE games
SET template_type = 'mcq'
WHERE template_type IS NULL OR template_type = '';

-- Add settings column to games table for game-specific overrides
ALTER TABLE games
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

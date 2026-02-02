-- Migration: 011_word_cross_fields
-- Description: Add fields for word cross (crossword) template
-- Date: 2026-01-21

-- Add crossword_grid column to game_questions for word cross template
ALTER TABLE game_questions
ADD COLUMN IF NOT EXISTS crossword_grid JSONB DEFAULT '{}';

-- Add clues column to game_questions for word cross template
ALTER TABLE game_questions
ADD COLUMN IF NOT EXISTS clues JSONB DEFAULT '{"across": [], "down": []}';

-- Example structure for crossword_grid:
-- {
--   "size": 15,
--   "cells": [
--     {"row": 0, "col": 0, "letter": "H", "number": 1, "isBlack": false},
--     {"row": 0, "col": 1, "letter": "E", "number": null, "isBlack": false}
--   ],
--   "words": [
--     {"id": "1-across", "startRow": 0, "startCol": 0, "direction": "across", "length": 5, "answer": "HEART"}
--   ]
-- }

-- Example structure for clues:
-- {
--   "across": [
--     {"number": 1, "clue": "Organ that pumps blood", "answer": "HEART"}
--   ],
--   "down": [
--     {"number": 2, "clue": "Red fluid in body", "answer": "BLOOD"}
--   ]
-- }

COMMENT ON COLUMN game_questions.crossword_grid IS 'Crossword grid layout and structure for word_cross template';
COMMENT ON COLUMN game_questions.clues IS 'Crossword clues (across and down) for word_cross template';

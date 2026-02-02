-- Add background_image_url column to games table
ALTER TABLE games ADD COLUMN background_image_url VARCHAR(500);

-- Add background_image_url column to game_questions table
ALTER TABLE game_questions ADD COLUMN background_image_url VARCHAR(500);

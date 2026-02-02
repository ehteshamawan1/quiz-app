-- Migration: 010_drag_drop_fields
-- Description: Add fields for drag and drop template
-- Date: 2026-01-21

-- Add drag_items column to game_questions for drag and drop template
ALTER TABLE game_questions
ADD COLUMN IF NOT EXISTS drag_items JSONB DEFAULT '[]';

-- Add drop_zones column to game_questions for drag and drop template
ALTER TABLE game_questions
ADD COLUMN IF NOT EXISTS drop_zones JSONB DEFAULT '[]';

-- Example structure for drag_items:
-- [
--   {"id": "item1", "content": "Heart", "imageUrl": null},
--   {"id": "item2", "content": "Lungs", "imageUrl": null}
-- ]

-- Example structure for drop_zones:
-- [
--   {"id": "zone1", "label": "Cardiovascular System", "correctItemIds": ["item1"]},
--   {"id": "zone2", "label": "Respiratory System", "correctItemIds": ["item2"]}
-- ]

COMMENT ON COLUMN game_questions.drag_items IS 'Array of draggable items for drag_drop template';
COMMENT ON COLUMN game_questions.drop_zones IS 'Array of drop zones with correct mappings for drag_drop template';

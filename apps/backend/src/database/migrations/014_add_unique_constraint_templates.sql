-- Migration: 014_add_unique_constraint_templates
-- Description: Add unique constraint to templates.type to prevent duplicates
-- Date: 2026-01-29

-- Add unique constraint to type column
ALTER TABLE templates
ADD CONSTRAINT templates_type_key UNIQUE (type);

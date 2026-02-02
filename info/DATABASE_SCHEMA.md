# Database Schema - NurseQuest (Phases 1-4 Complete)

## Overview
Complete database schema including authentication, institutions, templates, 6 game templates, gameplay engine, and analytics.

## Tables

### users
- id (uuid, PK)
- username (varchar, unique, not null)
- email (varchar, nullable)
- password_hash (varchar, not null)
- college_id (uuid, nullable)
- role (varchar, not null)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)

### colleges
- id (uuid, PK)
- name (varchar, unique, not null)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)

### groups
- id (uuid, PK)
- college_id (uuid, not null)
- name (varchar, not null)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)

### templates
- id (uuid, PK)
- name (varchar, not null)
- description (text)
- type (varchar, not null)
- category (varchar, nullable)
- difficulty (varchar, nullable)
- is_published (boolean, default false)
- is_featured (boolean, default false)
- config (jsonb)
- created_at (timestamp)
- updated_at (timestamp)

### games
- id (uuid, PK)
- template_id (uuid, not null)
- owner_id (uuid, not null)
- title (varchar, not null)
- description (text)
- template_type (varchar) **[Phase 4]** - One of: mcq, flashcards, hint_discovery, timed_quiz, drag_drop, word_cross
- settings (jsonb) - Includes template-specific configuration
- is_published (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)

### game_questions
- id (uuid, PK)
- game_id (uuid, FK games.id)
- prompt (text)
- explanation (text)
- points (int)
- allow_multiple (boolean)
- **[Phase 4 - Flashcards]:**
  - image_url (varchar, nullable)
  - card_front (text, nullable)
  - card_back (text, nullable)
- **[Phase 4 - Drag & Drop]:**
  - drag_items (jsonb, default '[]')
  - drop_zones (jsonb, default '[]')
- **[Phase 4 - Word Cross]:**
  - crossword_grid (jsonb, default '{}')
  - clues (jsonb, default '{"across": [], "down": []}')

### game_answers
- id (uuid, PK)
- question_id (uuid, FK game_questions.id)
- text (text)
- is_correct (boolean)

### game_hints
- id (uuid, PK)
- question_id (uuid, FK game_questions.id)
- text (text)
- penalty (int)

### game_assignments
- id (uuid, PK)
- game_id (uuid, FK games.id)
- group_id (uuid, FK groups.id)
- starts_at (timestamp)
- due_at (timestamp)
- created_at (timestamp)

### question_bank
- id (uuid, PK)
- owner_id (uuid, not null)
- prompt (text)
- topic (varchar)
- tags (jsonb)
- answers (jsonb)
- hints (jsonb)
- explanation (text)
- created_at (timestamp)
- updated_at (timestamp)

### system_settings
- id (uuid, PK)
- key (varchar, unique)
- value (jsonb)
- created_at (timestamp)
- updated_at (timestamp)

### password_resets
- id (uuid, PK)
- user_id (uuid, FK users.id)
- token (varchar, unique, not null)
- expires_at (timestamp)
- used (boolean, default false)
- created_at (timestamp)

## Phase 3 Tables - Gameplay Engine

### game_sessions
- id (uuid, PK)
- game_id (uuid, FK games.id)
- student_id (uuid, FK users.id)
- status (varchar) - Values: in_progress, completed, abandoned
- started_at (timestamp)
- completed_at (timestamp, nullable)
- time_spent_seconds (int)
- total_score (int)
- percentage_score (decimal)
- passed (boolean)
- created_at (timestamp)
- updated_at (timestamp)

### question_attempts
- id (uuid, PK)
- session_id (uuid, FK game_sessions.id)
- question_id (uuid, FK game_questions.id)
- selected_answer_ids (jsonb) - Array of selected answer IDs
- is_correct (boolean)
- points_earned (int)
- time_spent_seconds (int)
- attempted_at (timestamp)

### hint_usage
- id (uuid, PK)
- session_id (uuid, FK game_sessions.id)
- question_id (uuid, FK game_questions.id)
- hint_id (uuid, FK game_hints.id)
- revealed_at (timestamp)

### user_group_memberships
- id (uuid, PK)
- user_id (uuid, FK users.id)
- group_id (uuid, FK groups.id)
- joined_at (timestamp, default NOW())

## Notes
- Role values: admin, educator, student
- Email delivery is deferred; password reset tokens are issued via API for now
- **Supported Template Types (6 total):**
  - mcq - Multiple Choice Questions (default)
  - flashcards - Flip cards with self-rating
  - hint_discovery - Progressive hints with point penalties
  - timed_quiz - Rapid-fire quiz with countdown timer
  - drag_drop - Interactive drag and drop matching
  - word_cross - Crossword puzzle game
- Template-specific fields in game_questions table use JSONB for flexibility
- Game sessions track student progress and scoring
- Best attempt tracking: System automatically identifies highest-scoring session per student per game
- Maximum 3 attempts per student per game enforced by gameplay service

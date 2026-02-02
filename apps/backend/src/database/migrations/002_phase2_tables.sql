-- Phase 2 schema additions

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY,
  college_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY,
  template_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_questions (
  id UUID PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id),
  prompt TEXT NOT NULL,
  explanation TEXT,
  points INT DEFAULT 10
);

CREATE TABLE IF NOT EXISTS game_answers (
  id UUID PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES game_questions(id),
  text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS game_hints (
  id UUID PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES game_questions(id),
  text TEXT NOT NULL,
  penalty INT DEFAULT 2
);

CREATE TABLE IF NOT EXISTS game_assignments (
  id UUID PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id),
  group_id UUID NOT NULL REFERENCES groups(id),
  starts_at TIMESTAMP,
  due_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

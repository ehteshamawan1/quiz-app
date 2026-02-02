-- Phase 3: Student Portal & Gameplay Engine

-- User Group Memberships: Links students to groups
CREATE TABLE IF NOT EXISTS user_group_memberships (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, group_id)
);

CREATE INDEX idx_user_group_student ON user_group_memberships(student_id);
CREATE INDEX idx_user_group_group ON user_group_memberships(group_id);

-- Game Sessions: Tracks student gameplay sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES game_assignments(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'in_progress',
  current_question_index INT DEFAULT 0,
  total_score INT DEFAULT 0,
  percentage_score DECIMAL(5,2) DEFAULT 0,
  attempt_number INT DEFAULT 1,
  is_best_attempt BOOLEAN DEFAULT FALSE,
  time_spent_seconds INT DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  CHECK (percentage_score >= 0 AND percentage_score <= 100),
  CHECK (attempt_number >= 1 AND attempt_number <= 3)
);

CREATE INDEX idx_game_session_student ON game_sessions(student_id);
CREATE INDEX idx_game_session_game ON game_sessions(game_id);
CREATE INDEX idx_game_session_status ON game_sessions(status);
CREATE INDEX idx_game_session_assignment ON game_sessions(assignment_id);
CREATE INDEX idx_game_session_best ON game_sessions(student_id, game_id, is_best_attempt);

-- Question Attempts: Individual question responses
CREATE TABLE IF NOT EXISTS question_attempts (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES game_questions(id) ON DELETE CASCADE,
  selected_answer_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_correct BOOLEAN DEFAULT FALSE,
  points_earned INT DEFAULT 0,
  hints_used INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  answered_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

CREATE INDEX idx_question_attempt_session ON question_attempts(session_id);
CREATE INDEX idx_question_attempt_question ON question_attempts(question_id);
CREATE INDEX idx_question_attempt_correct ON question_attempts(is_correct);

-- Hint Usage: Tracks which hints were revealed
CREATE TABLE IF NOT EXISTS hint_usage (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES game_questions(id) ON DELETE CASCADE,
  hint_id UUID NOT NULL REFERENCES game_hints(id) ON DELETE CASCADE,
  revealed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, question_id, hint_id)
);

CREATE INDEX idx_hint_usage_session ON hint_usage(session_id);
CREATE INDEX idx_hint_usage_question ON hint_usage(question_id);
CREATE INDEX idx_hint_usage_hint ON hint_usage(hint_id);

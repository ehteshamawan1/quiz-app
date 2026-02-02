CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  answers JSONB DEFAULT '[]'::jsonb,
  hints JSONB DEFAULT '[]'::jsonb,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

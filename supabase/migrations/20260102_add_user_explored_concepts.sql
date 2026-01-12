-- Migration: Add user_explored_concepts table
-- This table tracks which concepts each user has explored to prevent duplicate counting

CREATE TABLE IF NOT EXISTS user_explored_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  explored_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure each user can only explore a concept once
  UNIQUE(user_id, concept_id)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_user_explored_concepts_user_id
ON user_explored_concepts(user_id);

-- Index for fast lookups by concept
CREATE INDEX IF NOT EXISTS idx_user_explored_concepts_concept_id
ON user_explored_concepts(concept_id);

-- Enable RLS
ALTER TABLE user_explored_concepts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own explorations
CREATE POLICY "Users can view own explorations"
ON user_explored_concepts FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own explorations
CREATE POLICY "Users can insert own explorations"
ON user_explored_concepts FOR INSERT
WITH CHECK (auth.uid() = user_id);

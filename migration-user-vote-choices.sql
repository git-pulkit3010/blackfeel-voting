-- Migration: Add user_vote_choices table to track individual vote choices
-- This allows us to know WHAT each user voted for (not just IF they voted)

-- 1. Create new table to track individual vote choices
CREATE TABLE IF NOT EXISTS user_vote_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL,
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  choice TEXT NOT NULL CHECK (choice IN ('a', 'b')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_identifier, trend_id)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_vote_choices_identifier ON user_vote_choices(user_identifier);
CREATE INDEX IF NOT EXISTS idx_user_vote_choices_trend ON user_vote_choices(trend_id);
CREATE INDEX IF NOT EXISTS idx_user_vote_choices_user_trend ON user_vote_choices(user_identifier, trend_id);

-- 3. Add comment to explain the table's purpose
COMMENT ON TABLE user_vote_choices IS 'Tracks individual vote choices per user per trend. Works with user_votes table which tracks global vote status.';

-- 4. Verify the table was created
-- SELECT * FROM user_vote_choices LIMIT 10;

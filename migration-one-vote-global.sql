-- Migration: One Vote Per User (Global) with Option Change Detection
-- Run these SQL commands in your NeonDB SQL Editor

-- 1. Add options_hash column to trends table (if not exists)
-- Note: This column is kept for reference but the global hash is computed at runtime
ALTER TABLE trends ADD COLUMN IF NOT EXISTS options_hash TEXT NOT NULL DEFAULT '';

-- Update existing rows with options_hash = MD5(option_a || '|' || option_b)
UPDATE trends SET options_hash = MD5(option_a || '|' || option_b) WHERE options_hash = '';

-- 2. Create new user_votes table for global vote tracking (if not exists)
CREATE TABLE IF NOT EXISTS user_votes_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL,
  options_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_identifier)
);

-- 3. Migrate existing data from old user_votes table (if it exists with trend_id)
-- This will take the first vote per user_identifier
INSERT INTO user_votes_new (user_identifier, options_hash, created_at)
SELECT DISTINCT ON (user_identifier) 
  user_identifier,
  '' as options_hash,  -- Will be updated on first vote with global hash
  created_at
FROM user_votes uv
ON CONFLICT (user_identifier) DO NOTHING;

-- 4. Drop old table and rename new one
DROP TABLE IF EXISTS user_votes;
ALTER TABLE user_votes_new RENAME TO user_votes;

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_votes_identifier ON user_votes(user_identifier);

-- 6. Verify the migration
-- SELECT COUNT(*) FROM user_votes;

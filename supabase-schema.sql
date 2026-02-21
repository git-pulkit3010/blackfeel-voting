-- NeonDB Database Schema
-- Run these SQL commands in your NeonDB SQL Editor

-- 1. Create trends table
CREATE TABLE IF NOT EXISTS trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_a_image_url TEXT,
  option_b_image_url TEXT,
  votes_a INTEGER DEFAULT 0,
  votes_b INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create design_history table
CREATE TABLE IF NOT EXISTS design_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  design_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create user_votes table to track one vote per user per trend
CREATE TABLE IF NOT EXISTS user_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trend_id, user_identifier)
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trends_active ON trends(active);
CREATE INDEX IF NOT EXISTS idx_trends_category ON trends(category);
CREATE INDEX IF NOT EXISTS idx_history_category ON design_history(category);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON design_history(created_at);
CREATE INDEX IF NOT EXISTS idx_user_votes_identifier ON user_votes(user_identifier);
CREATE INDEX IF NOT EXISTS idx_user_votes_trend_id ON user_votes(trend_id);

-- 5. Insert some sample data (optional - for testing)
INSERT INTO trends (category, option_a, option_b, active, option_a_image_url, option_b_image_url) VALUES
  ('tv-shows', 'Stranger Things', 'The Last of Us', true, NULL, '/the_last_of_us.jpg'),
  ('movies', 'Oppenheimer', 'Barbie', true, NULL, NULL),
  ('cricket', 'IPL 2025', 'World Cup Legends', true, NULL, NULL),
  ('anime', 'Jujutsu Kaisen', 'Demon Slayer', true, NULL, NULL),
  ('music', 'Taylor Swift Era', 'Drake Vibes', true, NULL, NULL)
ON CONFLICT DO NOTHING;
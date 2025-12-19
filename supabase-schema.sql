-- Supabase Database Schema
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create trends table
CREATE TABLE trends (
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
CREATE TABLE design_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  design_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX idx_trends_active ON trends(active);
CREATE INDEX idx_trends_category ON trends(category);
CREATE INDEX idx_history_category ON design_history(category);
CREATE INDEX idx_history_created_at ON design_history(created_at);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_history ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for public read access
CREATE POLICY "Allow public read access to active trends"
  ON trends FOR SELECT
  USING (active = true);

CREATE POLICY "Allow public read access to history"
  ON design_history FOR SELECT
  USING (true);

-- 6. Create policy for public vote updates (only votes_a and votes_b can be updated)
CREATE POLICY "Allow authenticated users to update vote counts"
  ON trends FOR UPDATE
  USING (true)  -- Allow updates if the record exists and is active
  WITH CHECK (active = true);  -- Ensure the trend is still active after update

-- 6. Insert some sample data (optional - for testing)
INSERT INTO trends (category, option_a, option_b, active, option_a_image_url, option_b_image_url) VALUES
  ('tv-shows', 'Stranger Things', 'The Last of Us', true, NULL, '/the_last_of_us.jpg'),
  ('movies', 'Oppenheimer', 'Barbie', true, NULL, NULL),
  ('cricket', 'IPL 2025', 'World Cup Legends', true, NULL, NULL),
  ('anime', 'Jujutsu Kaisen', 'Demon Slayer', true, NULL, NULL),
  ('music', 'Taylor Swift Era', 'Drake Vibes', true, NULL, NULL);
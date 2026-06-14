-- Avatar customization table
CREATE TABLE IF NOT EXISTS user_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  hair_style TEXT DEFAULT 'short',
  hair_color TEXT DEFAULT '#4a3728',
  eye_style TEXT DEFAULT 'normal',
  eye_color TEXT DEFAULT '#3d5a80',
  skin_tone TEXT DEFAULT '#e8d5c4',
  outfit TEXT DEFAULT 'casual',
  outfit_color TEXT DEFAULT '#5e7a6b',
  accessory TEXT DEFAULT 'none',
  background TEXT DEFAULT 'none',
  title TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cosmetic items catalog
CREATE TABLE IF NOT EXISTS cosmetic_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rarity TEXT DEFAULT 'common',
  price INTEGER DEFAULT 0,
  premium_only BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User owned cosmetics
CREATE TABLE IF NOT EXISTS user_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id TEXT REFERENCES cosmetic_items(id) ON DELETE CASCADE,
  owned BOOLEAN DEFAULT TRUE,
  equipped BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- User coin balance (for persistent tracking)
CREATE TABLE IF NOT EXISTS user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  coins INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE cosmetic_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_avatars
CREATE POLICY "select_own_avatar" ON user_avatars FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_avatar" ON user_avatars FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_avatar" ON user_avatars FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for cosmetic_items (read-only for users)
CREATE POLICY "select_cosmetic_items" ON cosmetic_items FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "select_cosmetic_items_anon" ON cosmetic_items FOR SELECT
  TO anon USING (true);

-- RLS Policies for user_cosmetics
CREATE POLICY "select_own_cosmetics" ON user_cosmetics FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_cosmetics" ON user_cosmetics FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_cosmetics" ON user_cosmetics FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_cosmetics" ON user_cosmetics FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for user_balances
CREATE POLICY "select_own_balance" ON user_balances FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_balance" ON user_balances FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_balance" ON user_balances FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
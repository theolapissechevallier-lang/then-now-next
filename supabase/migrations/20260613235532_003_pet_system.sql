-- Update pets table with enhanced stats
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS energy REAL DEFAULT 60;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Pet species table (predefined species users can choose from)
CREATE TABLE public.pet_species (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  rarity TEXT DEFAULT 'common',
  base_happiness INTEGER DEFAULT 60,
  base_hunger INTEGER DEFAULT 50,
  base_energy INTEGER DEFAULT 60,
  unlocked_by_default BOOLEAN DEFAULT FALSE
);

-- Insert default pet species
INSERT INTO public.pet_species (id, name, emoji, description, rarity, unlocked_by_default) VALUES
  ('blob', 'Lumi', '🫧', 'A friendly blob companion. Perfect for beginners.', 'common', TRUE),
  ('cat', 'Mochi', '🐱', 'A playful feline friend.', 'common', TRUE),
  ('dog', 'Buddy', '🐕', 'A loyal canine companion.', 'common', TRUE),
  ('dragon', 'Ember', '🐉', 'A fierce but friendly dragon.', 'rare', FALSE),
  ('phoenix', 'Blaze', '🔥', 'Born from flames, rises again.', 'legendary', FALSE),
  ('crystal', 'Prism', '💎', 'A mystical crystal entity.', 'rare', FALSE);

-- Foods table
CREATE TABLE public.foods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  hunger_value INTEGER DEFAULT 0,
  happiness_value INTEGER DEFAULT 0,
  energy_value INTEGER DEFAULT 0,
  xp_value INTEGER DEFAULT 0,
  category TEXT DEFAULT 'basic',
  premium_only BOOLEAN DEFAULT FALSE
);

-- Insert default foods
INSERT INTO public.foods (id, name, emoji, description, price, hunger_value, happiness_value, energy_value, xp_value, category, premium_only) VALUES
  -- Basic foods
  ('apple', 'Apple', '🍎', 'A fresh apple. Simple and healthy.', 5, 10, 5, 5, 2, 'basic', FALSE),
  ('bread', 'Bread', '🍞', 'Soft and filling.', 8, 15, 3, 0, 1, 'basic', FALSE),
  ('carrot', 'Carrot', '🥕', 'Crunchy and nutritious.', 6, 8, 4, 8, 2, 'basic', FALSE),
  
  -- Healthy foods
  ('salad', 'Fresh Salad', '🥗', 'Packed with vitamins.', 20, 25, 15, 20, 8, 'healthy', FALSE),
  ('berries', 'Mixed Berries', '🫐', 'Antioxidant-rich treats.', 25, 20, 25, 15, 10, 'healthy', FALSE),
  ('smoothie', 'Power Smoothie', '🥤', 'Bursting with energy!', 35, 30, 20, 35, 15, 'healthy', FALSE),
  
  -- Energy foods
  ('coffee', 'Coffee', '☕', 'A quick energy boost!', 15, 0, 5, 40, 3, 'energy', FALSE),
  ('energy_bar', 'Energy Bar', '🍫', 'Sustained energy release.', 30, 10, 10, 50, 8, 'energy', FALSE),
  ('potion', 'Energy Potion', '🧪', 'Maximum energy restoration!', 50, 5, 15, 80, 20, 'energy', FALSE),
  
  -- Premium foods
  ('golden_apple', 'Golden Apple', '🌟', 'Legendary fruit of happiness.', 0, 50, 50, 50, 50, 'premium', TRUE),
  ('feast', 'Royal Feast', '🍽️', 'A meal fit for royalty.', 0, 80, 60, 40, 100, 'premium', TRUE),
  ('star_candy', 'Star Candy', '⭐', 'Magical candy that grants XP.', 0, 20, 80, 20, 200, 'premium', TRUE);

-- User's owned foods (inventory)
CREATE TABLE public.user_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id TEXT NOT NULL REFERENCES public.foods(id),
  quantity INTEGER DEFAULT 1,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, food_id)
);

-- Feeding history (for analytics/achievements)
CREATE TABLE public.feeding_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  food_id TEXT NOT NULL REFERENCES public.foods(id),
  fed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.pet_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for pet_species (read-only for all authenticated)
CREATE POLICY "species_select_all" ON public.pet_species FOR SELECT
  TO authenticated USING (true);

-- RLS policies for foods (read-only for all authenticated)
CREATE POLICY "foods_select_all" ON public.foods FOR SELECT
  TO authenticated USING (true);

-- RLS policies for user_foods
CREATE POLICY "user_foods_select_own" ON public.user_foods FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_foods_insert_own" ON public.user_foods FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_foods_update_own" ON public.user_foods FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_foods_delete_own" ON public.user_foods FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS policies for feeding_history
CREATE POLICY "feeding_history_select_own" ON public.feeding_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "feeding_history_insert_own" ON public.feeding_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_foods_user ON public.user_foods(user_id);
CREATE INDEX idx_feeding_history_user ON public.feeding_history(user_id);
CREATE INDEX idx_feeding_history_pet ON public.feeding_history(pet_id);
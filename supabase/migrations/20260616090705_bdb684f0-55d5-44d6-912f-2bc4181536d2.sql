
CREATE TABLE IF NOT EXISTS public.foods (
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
GRANT SELECT ON public.foods TO authenticated, anon;
GRANT ALL ON public.foods TO service_role;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "foods_select_all" ON public.foods FOR SELECT TO authenticated, anon USING (true);

INSERT INTO public.foods (id, name, emoji, description, price, hunger_value, happiness_value, energy_value, xp_value, category, premium_only) VALUES
  ('apple', 'Apple', '🍎', 'A fresh apple. Simple and healthy.', 5, 10, 5, 5, 2, 'basic', FALSE),
  ('bread', 'Bread', '🍞', 'Soft and filling.', 8, 15, 3, 0, 1, 'basic', FALSE),
  ('carrot', 'Carrot', '🥕', 'Crunchy and nutritious.', 6, 8, 4, 8, 2, 'basic', FALSE),
  ('salad', 'Fresh Salad', '🥗', 'Packed with vitamins.', 20, 25, 15, 20, 8, 'healthy', FALSE),
  ('berries', 'Mixed Berries', '🫐', 'Antioxidant-rich treats.', 25, 20, 25, 15, 10, 'healthy', FALSE),
  ('smoothie', 'Power Smoothie', '🥤', 'Bursting with energy!', 35, 30, 20, 35, 15, 'healthy', FALSE),
  ('coffee', 'Coffee', '☕', 'A quick energy boost!', 15, 0, 5, 40, 3, 'energy', FALSE),
  ('energy_bar', 'Energy Bar', '🍫', 'Sustained energy release.', 30, 10, 10, 50, 8, 'energy', FALSE),
  ('potion', 'Energy Potion', '🧪', 'Maximum energy restoration!', 50, 5, 15, 80, 20, 'energy', FALSE),
  ('golden_apple', 'Golden Apple', '🌟', 'Legendary fruit of happiness.', 0, 50, 50, 50, 50, 'premium', TRUE),
  ('feast', 'Royal Feast', '🍽️', 'A meal fit for royalty.', 0, 80, 60, 40, 100, 'premium', TRUE),
  ('star_candy', 'Star Candy', '⭐', 'Magical candy that grants XP.', 0, 20, 80, 20, 200, 'premium', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id TEXT NOT NULL REFERENCES public.foods(id),
  quantity INTEGER DEFAULT 1,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, food_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_foods TO authenticated;
GRANT ALL ON public.user_foods TO service_role;
ALTER TABLE public.user_foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uf_all_own" ON public.user_foods FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.feeding_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  food_id TEXT NOT NULL REFERENCES public.foods(id),
  fed_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT ON public.feeding_history TO authenticated;
GRANT ALL ON public.feeding_history TO service_role;
ALTER TABLE public.feeding_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fh_select_own" ON public.feeding_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "fh_insert_own" ON public.feeding_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS stored_energy REAL DEFAULT 60;

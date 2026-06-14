-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  age INTEGER,
  goals TEXT[] DEFAULT '{}',
  onboarded BOOLEAN DEFAULT FALSE,
  streak INTEGER DEFAULT 0,
  last_check_in DATE,
  coins INTEGER DEFAULT 50,
  premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily entries table
CREATE TABLE public.daily_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  screen_hours REAL DEFAULT 0,
  workout_minutes INTEGER DEFAULT 0,
  reading_minutes INTEGER DEFAULT 0,
  study_minutes INTEGER DEFAULT 0,
  deep_work_minutes INTEGER DEFAULT 0,
  sleep_hours REAL DEFAULT 0,
  journal_good TEXT,
  journal_improve TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Avatars table
CREATE TABLE public.avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  skin TEXT DEFAULT 'skin-warm',
  hair TEXT DEFAULT 'hair-short',
  outfit TEXT DEFAULT 'outfit-hoodie',
  accessory TEXT DEFAULT 'acc-none',
  background TEXT DEFAULT 'bg-aurora',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT DEFAULT 'Nova',
  species TEXT DEFAULT 'pet-blob',
  skin TEXT DEFAULT 'pet-blob',
  accessory TEXT DEFAULT 'pet-acc-none',
  xp INTEGER DEFAULT 0,
  stored_happiness REAL DEFAULT 60,
  stored_hunger REAL DEFAULT 50,
  last_fed TIMESTAMPTZ,
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User items (inventory) table
CREATE TABLE public.user_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Rewarded dates (tracks coins earned per day to prevent double-counting)
CREATE TABLE public.rewarded_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewarded_dates ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Daily entries RLS policies
CREATE POLICY "entries_select_own" ON public.daily_entries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "entries_insert_own" ON public.daily_entries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "entries_update_own" ON public.daily_entries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "entries_delete_own" ON public.daily_entries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Avatars RLS policies
CREATE POLICY "avatars_select_own" ON public.avatars FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "avatars_insert_own" ON public.avatars FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "avatars_update_own" ON public.avatars FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Pets RLS policies
CREATE POLICY "pets_select_own" ON public.pets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pets_insert_own" ON public.pets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pets_update_own" ON public.pets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User items RLS policies
CREATE POLICY "items_select_own" ON public.user_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "items_insert_own" ON public.user_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "items_update_own" ON public.user_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "items_delete_own" ON public.user_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Rewarded dates RLS policies
CREATE POLICY "rewarded_select_own" ON public.rewarded_dates FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "rewarded_insert_own" ON public.rewarded_dates FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rewarded_update_own" ON public.rewarded_dates FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER daily_entries_updated_at
  BEFORE UPDATE ON public.daily_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER avatars_updated_at
  BEFORE UPDATE ON public.avatars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for faster queries
CREATE INDEX idx_daily_entries_user_date ON public.daily_entries(user_id, date DESC);
CREATE INDEX idx_user_items_user ON public.user_items(user_id);
CREATE INDEX idx_rewarded_dates_user_date ON public.rewarded_dates(user_id, date DESC);
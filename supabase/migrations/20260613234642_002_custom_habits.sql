-- User habits table (custom habits)
CREATE TABLE public.user_habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Activity',
  category TEXT NOT NULL DEFAULT 'general',
  color TEXT NOT NULL DEFAULT 'primary',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  reward_per_unit INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'minutes',
  target_per_day REAL DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit logs table (tracks daily habit entries)
CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES public.user_habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value REAL NOT NULL DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, habit_id, date)
);

-- Enable RLS
ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_habits
CREATE POLICY "habits_select_own" ON public.user_habits FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "habits_insert_own" ON public.user_habits FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_update_own" ON public.user_habits FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_delete_own" ON public.user_habits FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS policies for habit_logs
CREATE POLICY "logs_select_own" ON public.habit_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "logs_insert_own" ON public.habit_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "logs_update_own" ON public.habit_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "logs_delete_own" ON public.habit_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Updated at triggers
CREATE TRIGGER user_habits_updated_at
  BEFORE UPDATE ON public.user_habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER habit_logs_updated_at
  BEFORE UPDATE ON public.habit_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX idx_user_habits_user ON public.user_habits(user_id);
CREATE INDEX idx_habit_logs_user_date ON public.habit_logs(user_id, date DESC);
CREATE INDEX idx_habit_logs_habit_date ON public.habit_logs(habit_id, date DESC);
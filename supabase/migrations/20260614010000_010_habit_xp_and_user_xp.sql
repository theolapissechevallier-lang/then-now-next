-- Per-habit XP rewards + lifetime user XP.
ALTER TABLE public.user_habits
  ADD COLUMN IF NOT EXISTS xp_per_unit INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.habit_logs
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0;

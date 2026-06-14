-- Extend goals system with XP rewards, goal types (simple vs quantitative) and difficulty preset.
ALTER TABLE public.user_goals
  ADD COLUMN IF NOT EXISTS xp_reward INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS goal_type TEXT NOT NULL DEFAULT 'quantitative',
  ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'custom';

-- Validate enum-like values without breaking existing rows.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_goals_goal_type_check'
  ) THEN
    ALTER TABLE public.user_goals
      ADD CONSTRAINT user_goals_goal_type_check
      CHECK (goal_type IN ('simple', 'quantitative'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_goals_difficulty_check'
  ) THEN
    ALTER TABLE public.user_goals
      ADD CONSTRAINT user_goals_difficulty_check
      CHECK (difficulty IN ('easy', 'medium', 'hard', 'custom'));
  END IF;
END$$;

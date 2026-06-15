-- Journal System Migration
-- Daily journal entries, mood tracking, highlights, and life timeline

-- Journal entries table
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  important_event TEXT,
  proud_of TEXT,
  learned TEXT,
  free_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Mood tracking
CREATE TYPE mood_type AS ENUM ('amazing', 'happy', 'good', 'neutral', 'tired', 'bad');

CREATE TABLE journal_moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood mood_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Journal highlights (highlight of the day - stored permanently)
CREATE TABLE journal_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Life events timeline (combines journal highlights, goals, trophies, pet evolutions)
CREATE TYPE life_event_type AS ENUM ('journal_highlight', 'goal_completed', 'trophy_unlocked', 'pet_evolved', 'milestone', 'streak');

CREATE TABLE life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type life_event_type NOT NULL,
  event_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Monthly summaries cache
CREATE TABLE monthly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL,
  summary TEXT NOT NULL,
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, year, month)
);

-- Indexes for performance
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, date DESC);
CREATE INDEX idx_journal_moods_user_date ON journal_moods(user_id, date DESC);
CREATE INDEX idx_journal_highlights_user_date ON journal_highlights(user_id, date DESC);
CREATE INDEX idx_life_events_user_date ON life_events(user_id, event_date DESC);
CREATE INDEX idx_life_events_user_type ON life_events(user_id, event_type);
CREATE INDEX idx_monthly_summaries_user ON monthly_summaries(user_id, year, month);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;

-- RLS policies for journal_entries
CREATE POLICY "select_own_journal_entries" ON journal_entries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_journal_entries" ON journal_entries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_journal_entries" ON journal_entries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_journal_entries" ON journal_entries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS policies for journal_moods
CREATE POLICY "select_own_journal_moods" ON journal_moods FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_journal_moods" ON journal_moods FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_journal_moods" ON journal_moods FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_journal_moods" ON journal_moods FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS policies for journal_highlights
CREATE POLICY "select_own_journal_highlights" ON journal_highlights FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_journal_highlights" ON journal_highlights FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_journal_highlights" ON journal_highlights FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_journal_highlights" ON journal_highlights FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS policies for life_events
CREATE POLICY "select_own_life_events" ON life_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_life_events" ON life_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_life_events" ON life_events FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS policies for monthly_summaries
CREATE POLICY "select_own_monthly_summaries" ON monthly_summaries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_monthly_summaries" ON monthly_summaries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_monthly_summaries" ON monthly_summaries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_monthly_summaries" ON monthly_summaries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
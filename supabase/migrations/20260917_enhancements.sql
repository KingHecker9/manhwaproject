-- Migration: Add enhanced metadata fields to series and reading_history
-- Description: Adds description, alternative_title, author_name, genres, status, rating, and release_day to series table,
-- and adds scroll_position, progress_percentage, and last_read_at to reading_history.

ALTER TABLE IF EXISTS series 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS alternative_title TEXT,
  ADD COLUMN IF NOT EXISTS author_name TEXT,
  ADD COLUMN IF NOT EXISTS genres TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ongoing',
  ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 4.8,
  ADD COLUMN IF NOT EXISTS release_day TEXT DEFAULT 'Monday';

ALTER TABLE IF EXISTS reading_history 
  ADD COLUMN IF NOT EXISTS scroll_position NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS progress_percentage NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for faster schedule queries if release_day exists
CREATE INDEX IF NOT EXISTS idx_series_release_day ON series(release_day);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_series ON reading_history(user_id, series_id);

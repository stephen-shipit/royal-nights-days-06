-- Add recurring event fields to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern VARCHAR(20) CHECK (recurrence_pattern IN ('weekly', 'biweekly', 'monthly') OR recurrence_pattern IS NULL),
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;

-- Note: After running this migration, you should also run the update-recurring-events.sql function
-- and set up a scheduled job (cron) to run it daily to automatically update recurring events
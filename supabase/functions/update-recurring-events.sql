-- Function to update recurring events after their date has passed
CREATE OR REPLACE FUNCTION update_recurring_events()
RETURNS void AS $$
DECLARE
  event_record RECORD;
  new_date DATE;
BEGIN
  -- Loop through all recurring events that have passed
  FOR event_record IN 
    SELECT * FROM events 
    WHERE is_recurring = true 
    AND date < CURRENT_DATE
    AND (recurrence_end_date IS NULL OR recurrence_end_date > CURRENT_DATE)
  LOOP
    -- Calculate the next date based on recurrence pattern
    CASE event_record.recurrence_pattern
      WHEN 'weekly' THEN
        new_date := event_record.date + INTERVAL '7 days';
      WHEN 'biweekly' THEN
        new_date := event_record.date + INTERVAL '14 days';
      WHEN 'monthly' THEN
        new_date := event_record.date + INTERVAL '1 month';
    END CASE;
    
    -- Keep adding intervals until we get a future date
    WHILE new_date < CURRENT_DATE LOOP
      CASE event_record.recurrence_pattern
        WHEN 'weekly' THEN
          new_date := new_date + INTERVAL '7 days';
        WHEN 'biweekly' THEN
          new_date := new_date + INTERVAL '14 days';
        WHEN 'monthly' THEN
          new_date := new_date + INTERVAL '1 month';
      END CASE;
    END LOOP;
    
    -- Update the event with the new date if it's before the end date
    IF event_record.recurrence_end_date IS NULL OR new_date <= event_record.recurrence_end_date THEN
      UPDATE events 
      SET date = new_date::DATE
      WHERE id = event_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run this function daily (requires pg_cron extension)
-- This would typically be set up in your Supabase dashboard or via SQL if pg_cron is available
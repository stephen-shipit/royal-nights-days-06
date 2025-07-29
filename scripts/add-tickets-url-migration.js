import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://twbqokjjdopxcgiiuluz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YnFva2pqZG9weGNnaWl1bHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTUzMTYsImV4cCI6MjA2ODc3MTMxNn0.r98rEFBnbJaJg4Qesmxfht8zPNsm3keFvnDBp5z4DxY";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function addTicketsUrlColumn() {
  console.log('Adding tickets_url column to events table...');
  
  // Add the tickets_url column
  const { data, error } = await supabase.rpc('exec_sql', {
    query: 'ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tickets_url text;'
  });
  
  if (error) {
    console.error('Error adding column:', error);
    return;
  }
  
  console.log('✅ Successfully added tickets_url column');
  
  // Update a sample event to test the functionality
  const { data: events, error: fetchError } = await supabase
    .from('events')
    .select('id, title')
    .limit(1);
    
  if (fetchError) {
    console.error('Error fetching events:', fetchError);
    return;
  }
  
  if (events && events.length > 0) {
    const eventId = events[0].id;
    const { error: updateError } = await supabase
      .from('events')
      .update({ tickets_url: 'https://eventbrite.com/sample-tickets' })
      .eq('id', eventId);
      
    if (updateError) {
      console.error('Error updating event:', updateError);
      return;
    }
    
    console.log(`✅ Successfully added sample tickets URL to event: ${events[0].title}`);
  }
}

addTicketsUrlColumn().catch(console.error);
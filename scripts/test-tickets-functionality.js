import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://twbqokjjdopxcgiiuluz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YnFva2pqZG9weGNnaWl1bHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTUzMTYsImV4cCI6MjA2ODc3MTMxNn0.r98rEFBnbJaJg4Qesmxfht8zPNsm3keFvnDBp5z4DxY";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testTicketsFunctionality() {
  console.log('Testing tickets functionality...');
  
  // First, let's check if we can fetch events
  const { data: events, error: fetchError } = await supabase
    .from('events')
    .select('*')
    .limit(3);
    
  if (fetchError) {
    console.error('Error fetching events:', fetchError);
    return;
  }
  
  console.log('✅ Successfully connected to Supabase');
  console.log(`Found ${events.length} events`);
  
  // Check if tickets_url column exists
  if (events.length > 0) {
    const firstEvent = events[0];
    console.log('Sample event structure:', Object.keys(firstEvent));
    
    // Check if tickets_url is in the event structure
    if ('tickets_url' in firstEvent) {
      console.log('✅ tickets_url column already exists!');
      console.log('Current tickets_url values:');
      events.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.title}: ${event.tickets_url || 'null'}`);
      });
    } else {
      console.log('❌ tickets_url column does not exist yet');
      console.log('You need to add this column via the Supabase dashboard SQL editor:');
      console.log('ALTER TABLE public.events ADD COLUMN tickets_url text;');
    }
  }
}

testTicketsFunctionality().catch(console.error);
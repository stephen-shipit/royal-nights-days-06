// Since we can't directly import TypeScript modules in Node.js, 
// we'll recreate the client using the same configuration
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the client configuration from the TypeScript file
const clientFile = readFileSync(join(__dirname, '../src/integrations/supabase/client.ts'), 'utf8');
const urlMatch = clientFile.match(/SUPABASE_URL = "([^"]+)"/);
const keyMatch = clientFile.match(/SUPABASE_PUBLISHABLE_KEY = "([^"]+)"/);

if (!urlMatch || !keyMatch) {
  throw new Error('Could not extract Supabase configuration from client.ts');
}

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function applyMigration() {
  console.log('🚀 Applying database migration for tickets_url column...');
  
  try {
    // First, check if the column already exists
    const { data: events, error: checkError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
      
    if (checkError) {
      console.error('❌ Error checking current table structure:', checkError);
      return;
    }
    
    if (events && events.length > 0) {
      const eventKeys = Object.keys(events[0]);
      if (eventKeys.includes('tickets_url')) {
        console.log('✅ tickets_url column already exists!');
        console.log('📝 Current event structure:', eventKeys.join(', '));
        return;
      }
    }
    
    console.log('📝 tickets_url column not found. Manual migration required.');
    console.log('');
    console.log('Please follow these steps:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Navigate to your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Run this SQL command:');
    console.log('');
    console.log('   ALTER TABLE public.events ADD COLUMN tickets_url text;');
    console.log('');
    console.log('5. After running the SQL, test by adding a sample tickets URL:');
    console.log('');
    console.log('   UPDATE public.events');
    console.log('   SET tickets_url = \'https://eventbrite.com/sample-event\'');
    console.log('   WHERE id = (SELECT id FROM public.events LIMIT 1);');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error during migration check:', error);
  }
}

// Test the connection and apply migration
async function main() {
  console.log('🔗 Testing Supabase connection...');
  
  const { error } = await supabase
    .from('events')
    .select('id')
    .limit(1);
    
  if (error) {
    console.error('❌ Failed to connect to Supabase:', error);
    return;
  }
  
  console.log('✅ Successfully connected to Supabase');
  await applyMigration();
}

main().catch(console.error);
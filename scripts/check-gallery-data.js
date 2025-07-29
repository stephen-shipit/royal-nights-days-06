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

async function checkGalleryData() {
  console.log('🔍 Checking gallery data...');
  
  try {
    // Check if gallery_items table exists and has data
    const { data, error, count } = await supabase
      .from('gallery_items')
      .select('*', { count: 'exact' });
      
    if (error) {
      console.error('❌ Error fetching gallery items:', error);
      return;
    }
    
    console.log(`✅ Found ${count} gallery items in database`);
    
    if (data && data.length > 0) {
      console.log('\n📋 Gallery items structure:');
      data.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}`);
        console.log(`   Alt: ${item.alt}`);
        console.log(`   Category: ${item.category}`);
        console.log(`   Gallery Type: ${item.gallery_type}`);
        console.log(`   Source: ${item.src}`);
        console.log('   ---');
      });
      
      // Check gallery_type distribution
      const typeDistribution = data.reduce((acc, item) => {
        acc[item.gallery_type] = (acc[item.gallery_type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Gallery type distribution:');
      Object.entries(typeDistribution).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} items`);
      });
      
      // Check if any images have accessibility issues
      const imageIssues = data.filter(item => !item.src || !item.alt);
      if (imageIssues.length > 0) {
        console.log(`\n⚠️  Found ${imageIssues.length} items with missing src or alt text`);
      }
      
    } else {
      console.log('\n📝 Database is empty. You need to add gallery items through the admin panel.');
      console.log('   1. Go to /admin');
      console.log('   2. Click on Gallery tab');
      console.log('   3. Click "Add Image" to add new gallery items');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

checkGalleryData().catch(console.error);
import { supabaseService } from '../src/config/supabase';
import { config } from '../src/config';

require('dotenv').config();

async function getRecentCases() {
  console.log('=== Recent Cases ===\n');
  
  const { data: cases, error } = await supabaseService
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (cases && cases.length > 0) {
    cases.forEach((c, i) => {
      console.log(`${i + 1}. Case ID: ${c.id}`);
      console.log(`   Title: ${c.case_title}`);
      console.log(`   Category: ${c.category}`);
      console.log(`   Country: ${c.location_country}`);
      console.log(`   State: ${c.location_state}`);
      console.log(`   City: ${c.location_city}`);
      console.log(`   Created: ${c.created_at}`);
      console.log('');
    });
  } else {
    console.log('No cases found');
  }
}

getRecentCases().catch(console.error);

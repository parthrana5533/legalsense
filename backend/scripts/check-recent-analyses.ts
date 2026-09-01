import { supabaseService } from '../src/config/supabase';
import { config } from '../src/config';

require('dotenv').config();

async function checkRecentAnalyses() {
  console.log('=== Recent Analyses ===\n');
  
  const { data: analyses, error } = await supabaseService
    .from('case_analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (analyses && analyses.length > 0) {
    analyses.forEach((a, i) => {
      console.log(`${i + 1}. Analysis ID: ${a.id}`);
      console.log(`   Case ID: ${a.case_id}`);
      console.log(`   Confidence Score: ${a.confidence_score}`);
      console.log(`   Created: ${a.created_at}`);
      
      const rawResponse = a.raw_response as any;
      if (rawResponse) {
        console.log(`   Retrieved Sources: ${rawResponse.retrieved_sources?.length || 0}`);
        if (rawResponse.retrieved_sources && rawResponse.retrieved_sources.length > 0) {
          console.log(`   Sample Source: ${rawResponse.retrieved_sources[0].title}`);
        }
      }
      console.log('');
    });
  } else {
    console.log('No analyses found');
  }
}

checkRecentAnalyses().catch(console.error);

import { supabaseService } from '../src/config/supabase';
import { config } from '../src/config';

require('dotenv').config();

async function inspectAll() {
  console.log('=== All Legal Documents Database Inspection ===\n');
  
  // Query all documents
  const { data: docs, error } = await supabaseService
    .from('legal_documents')
    .select('*');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Total records found:', docs?.length || 0);
  
  if (docs && docs.length > 0) {
    // Group by act_name
    const byAct: Record<string, any[]> = {};
    docs.forEach(d => {
      const actName = d.metadata?.act_name || 'Unknown';
      if (!byAct[actName]) byAct[actName] = [];
      byAct[actName].push(d);
    });
    
    console.log('\n--- Documents by Act ---');
    for (const actName of Object.keys(byAct)) {
      const records = byAct[actName];
      const withEmbeddings = records.filter(d => d.embedding && d.embedding.length > 0);
      console.log(`\n${actName}:`);
      console.log(`  Total records: ${records.length}`);
      console.log(`  With embeddings: ${withEmbeddings.length}`);
      console.log(`  Sample title: ${records[0].title}`);
      console.log(`  Sample source_url: ${records[0].source_url}`);
    }
  }
}

inspectAll().catch(console.error);

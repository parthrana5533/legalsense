import { supabaseService } from '../src/config/supabase';
import { config } from '../src/config';

require('dotenv').config();

async function verifyPgvectorSchema() {
  console.log('=== pgvector Schema Verification ===\n');
  
  // Try to get column information from information_schema
  const { data: columns, error: columnError } = await supabaseService
    .from('information_schema.columns')
    .select('column_name, data_type, character_maximum_length')
    .eq('table_name', 'legal_documents')
    .eq('column_name', 'embedding');
  
  if (columnError) {
    console.error('Error querying information_schema:', columnError);
  } else {
    console.log('Column definition from information_schema:');
    if (columns && columns.length > 0) {
      columns.forEach(col => {
        console.log(`  Column: ${col.column_name}`);
        console.log(`  Data type: ${col.data_type}`);
        console.log(`  Max length: ${col.character_maximum_length}`);
      });
    } else {
      console.log('  No column information found');
    }
  }
  
  // Check sample embeddings more carefully
  console.log('\n--- Sample Embedding Analysis ---');
  const { data: samples } = await supabaseService
    .from('legal_documents')
    .select('embedding')
    .not('embedding', 'is', null)
    .limit(5);
  
  if (samples && samples.length > 0) {
    samples.forEach((sample, i) => {
      console.log(`\nSample ${i + 1}:`);
      console.log(`  Type: ${typeof sample.embedding}`);
      console.log(`  JS .length: ${sample.embedding?.length}`);
      console.log(`  First 100 chars: ${sample.embedding?.substring(0, 100)}`);
      console.log(`  Last 100 chars: ${sample.embedding?.substring(sample.embedding.length - 100)}`);
      
      // Try to parse if it's a JSON array
      try {
        const parsed = JSON.parse(sample.embedding);
        console.log(`  Parsed as JSON: YES`);
        console.log(`  Parsed type: ${typeof parsed}`);
        console.log(`  Is array: ${Array.isArray(parsed)}`);
        console.log(`  Parsed length: ${parsed.length}`);
      } catch (e) {
        console.log(`  Parsed as JSON: NO (${e.message})`);
      }
    });
  }
}

verifyPgvectorSchema().catch(console.error);

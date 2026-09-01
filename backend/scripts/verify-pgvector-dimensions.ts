import { supabaseService } from '../src/config/supabase';
import { config } from '../src/config';

require('dotenv').config();

async function verifyPgvectorDimensions() {
  console.log('=== pgvector Dimensions Verification ===\n');
  
  // Count total, with/without embeddings
  const { data: countResult, error: countError } = await supabaseService.rpc('exec_sql', {
    sql: `
      SELECT
        COUNT(*) AS total,
        COUNT(embedding) AS with_embedding,
        COUNT(*) - COUNT(embedding) AS without_embedding
      FROM legal_documents
    `
  });
  
  if (countError) {
    console.error('Error counting:', countError);
    // Try alternative approach using direct query
    const { data: altResult, error: altError } = await supabaseService
      .from('legal_documents')
      .select('id, embedding');
    
    if (altError) {
      console.error('Alternative query also failed:', altError);
      return;
    }
    
    const total = altResult?.length || 0;
    const withEmbedding = altResult?.filter(d => d.embedding).length || 0;
    const withoutEmbedding = total - withEmbedding;
    
    console.log('Total records:', total);
    console.log('Records with embeddings:', withEmbedding);
    console.log('Records without embeddings:', withoutEmbedding);
  } else {
    console.log('Total records:', countResult?.[0]?.total);
    console.log('Records with embeddings:', countResult?.[0]?.with_embedding);
    console.log('Records without embeddings:', countResult?.[0]?.without_embedding);
  }
  
  // Get breakdown by act_name
  console.log('\n--- Breakdown by Act ---');
  const { data: docs } = await supabaseService
    .from('legal_documents')
    .select('metadata, embedding');
  
  if (docs) {
    const byAct: Record<string, { total: number; withEmbedding: number; withoutEmbedding: number }> = {};
    
    docs.forEach(doc => {
      const actName = doc.metadata?.act_name || 'Unknown';
      if (!byAct[actName]) {
        byAct[actName] = { total: 0, withEmbedding: 0, withoutEmbedding: 0 };
      }
      byAct[actName].total++;
      if (doc.embedding && doc.embedding.length > 0) {
        byAct[actName].withEmbedding++;
      } else {
        byAct[actName].withoutEmbedding++;
      }
    });
    
    for (const [actName, stats] of Object.entries(byAct)) {
      console.log(`\n${actName}:`);
      console.log(`  Total: ${stats.total}`);
      console.log(`  Embedded: ${stats.withEmbedding}`);
      console.log(`  Missing: ${stats.withoutEmbedding}`);
    }
  }
  
  // Check embedding dimensions using a sample
  console.log('\n--- Embedding Dimension Check (Sample) ---');
  const { data: sampleWithEmbedding } = await supabaseService
    .from('legal_documents')
    .select('embedding')
    .not('embedding', 'is', null)
    .limit(1);
  
  if (sampleWithEmbedding && sampleWithEmbedding.length > 0) {
    const embedding = sampleWithEmbedding[0].embedding;
    console.log('Sample embedding length (JavaScript):', embedding?.length);
    console.log('Sample embedding type:', typeof embedding);
    console.log('Sample embedding is array:', Array.isArray(embedding));
  }
}

verifyPgvectorDimensions().catch(console.error);

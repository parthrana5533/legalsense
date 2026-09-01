import { supabaseService } from '../src/config/supabase';
import { config } from '../src/config';

require('dotenv').config();

async function verifyEmbeddingsState() {
  console.log('=== Legal Documents Embeddings State Verification ===\n');
  
  // Query all documents
  const { data: allDocs, error } = await supabaseService
    .from('legal_documents')
    .select('*');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Total records:', allDocs?.length || 0);
  
  const withEmbeddings = allDocs?.filter(d => d.embedding && d.embedding.length > 0) || [];
  const withoutEmbeddings = allDocs?.filter(d => !d.embedding || d.embedding.length === 0) || [];
  
  console.log('Records with non-null embeddings:', withEmbeddings.length);
  console.log('Records with null embeddings:', withoutEmbeddings.length);
  
  // Group by act_name
  const byAct: Record<string, { total: number; withEmbeddings: number; withoutEmbeddings: number }> = {};
  
  allDocs?.forEach(doc => {
    const actName = doc.metadata?.act_name || 'Unknown';
    if (!byAct[actName]) {
      byAct[actName] = { total: 0, withEmbeddings: 0, withoutEmbeddings: 0 };
    }
    byAct[actName].total++;
    if (doc.embedding && doc.embedding.length > 0) {
      byAct[actName].withEmbeddings++;
    } else {
      byAct[actName].withoutEmbeddings++;
    }
  });
  
  console.log('\n--- Breakdown by Act ---');
  for (const [actName, stats] of Object.entries(byAct)) {
    console.log(`\n${actName}:`);
    console.log(`  Total chunks: ${stats.total}`);
    console.log(`  Chunks with embeddings: ${stats.withEmbeddings}`);
    console.log(`  Chunks without embeddings: ${stats.withoutEmbeddings}`);
  }
  
  // Show sample embedding dimensions
  if (withEmbeddings.length > 0) {
    console.log('\n--- Embedding Dimension Check ---');
    const dimensions = new Set(withEmbeddings.map(d => d.embedding?.length));
    console.log('Embedding dimensions found:', Array.from(dimensions).join(', '));
  }
}

verifyEmbeddingsState().catch(console.error);

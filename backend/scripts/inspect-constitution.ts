import { supabaseService } from '../src/config/supabase';
import { config } from '../src/config';

require('dotenv').config();

async function inspectConstitution() {
  console.log('=== Constitution of India Database Inspection ===\n');
  
  // Query for Constitution of India documents
  const { data: docs, error } = await supabaseService
    .from('legal_documents')
    .select('*')
    .ilike('metadata->>act_name', '%Constitution%');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Total Constitution records found:', docs?.length || 0);
  
  if (docs && docs.length > 0) {
    // Count with embeddings
    const withEmbeddings = docs.filter(d => d.embedding && d.embedding.length > 0);
    console.log('Records with embeddings:', withEmbeddings.length);
    console.log('Records without embeddings:', docs.length - withEmbeddings.length);
    
    // Show sample data
    console.log('\n--- Sample Record ---');
    const sample = docs[0];
    console.log('Title:', sample.title);
    console.log('Act Name (metadata):', sample.metadata?.act_name);
    console.log('Source URL:', sample.source_url);
    console.log('Section Number:', sample.section_number);
    console.log('Content Length:', sample.content?.length || 0);
    console.log('Content Preview:', sample.content?.substring(0, 200) || 'N/A');
    
    // Check for duplicates (same title and section)
    const titles = docs.map(d => d.title);
    const uniqueTitles = new Set(titles);
    console.log('\nUnique titles:', uniqueTitles.size);
    console.log('Potential duplicates:', titles.length - uniqueTitles.size);
    
    // Check language of content
    const sampleContent = docs[0].content || '';
    const hasNonEnglish = /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0E00-\u0E7F]/.test(sampleContent);
    console.log('\nContent language check:');
    console.log('Contains non-English characters:', hasNonEnglish);
  }
}

inspectConstitution().catch(console.error);

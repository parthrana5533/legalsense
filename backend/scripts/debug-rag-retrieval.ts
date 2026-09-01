import { supabaseService } from '../src/config/supabase';
import { embeddingService } from '../src/services/ai/embeddingService';
import { vectorSearchService } from '../src/services/rag/vectorSearchService';
import { caseRepository } from '../src/repositories/caseRepository';
import { legalDocumentRepository } from '../src/repositories/legalDocumentRepository';
import { config } from '../src/config';

require('dotenv').config();

async function debugRAGRetrieval(caseId: string) {
  console.log('=== RAG Retrieval Debug ===\n');
  
  // 1. Load case details
  console.log('1. Loading case details...');
  const caseData = await caseRepository.findById(caseId);
  
  if (!caseData) {
    console.error('Case not found');
    return;
  }
  
  console.log('Case ID:', caseData.id);
  console.log('Case Title:', caseData.case_title);
  console.log('Case Description:', caseData.case_description);
  console.log('Category:', caseData.category);
  console.log('Location Country:', caseData.location_country);
  console.log('Location State:', caseData.location_state);
  console.log('Location City:', caseData.location_city);
  
  // 2. Generate query embedding
  console.log('\n2. Generating query embedding...');
  const queryText = `${caseData.case_description} ${caseData.category}`;
  console.log('Query Text:', queryText);
  
  try {
    const queryEmbedding = await embeddingService.generateEmbedding(queryText);
    console.log('✓ Query embedding generated');
    console.log('Embedding dimension:', queryEmbedding.length);
    
    if (queryEmbedding.length !== 768) {
      console.error('ERROR: Invalid embedding dimension, expected 768');
    }
  } catch (error) {
    console.error('ERROR: Failed to generate embedding:', error);
    return;
  }
  
  // 3. Check database state
  console.log('\n3. Checking database state...');
  const allDocs = await legalDocumentRepository.findAll(1000, 0);
  const withEmbeddings = allDocs.filter(d => d.embedding && d.embedding.length > 0);
  const consumerProtectionDocs = allDocs.filter(d => 
    d.metadata?.act_name === 'Consumer Protection Act, 2019'
  );
  const consumerProtectionWithEmbeddings = consumerProtectionDocs.filter(d => 
    d.embedding && d.embedding.length > 0
  );
  
  console.log('Total documents:', allDocs.length);
  console.log('Documents with embeddings:', withEmbeddings.length);
  console.log('Consumer Protection Act documents:', consumerProtectionDocs.length);
  console.log('Consumer Protection Act with embeddings:', consumerProtectionWithEmbeddings.length);
  
  if (consumerProtectionWithEmbeddings.length > 0) {
    console.log('Sample Consumer Protection document:');
    const sample = consumerProtectionWithEmbeddings[0];
    console.log('  Title:', sample.title);
    console.log('  Category:', sample.category);
    console.log('  Jurisdiction Country:', sample.jurisdiction_country);
    console.log('  Jurisdiction State:', sample.jurisdiction_state);
    console.log('  Has embedding:', !!sample.embedding);
    console.log('  Embedding dimension:', sample.embedding?.length);
  }
  
  // 4. Call vector search
  console.log('\n4. Calling vector search...');
  console.log('Parameters:');
  console.log('  queryText:', queryText);
  console.log('  jurisdictionCountry:', caseData.location_country || 'India');
  console.log('  jurisdictionState:', caseData.location_state || null);
  console.log('  category:', caseData.category);
  console.log('  limit:', 10);
  
  try {
    const searchResults = await vectorSearchService.searchWithJurisdictionPriority({
      queryText: queryText,
      jurisdictionCountry: caseData.location_country || 'India',
      jurisdictionState: caseData.location_state || null,
      category: caseData.category,
      limit: 10,
    });
    
    console.log('\n✓ Vector search completed');
    console.log('State-specific results:', searchResults.stateSpecific.length);
    console.log('Central results:', searchResults.central.length);
    console.log('Other results:', searchResults.other.length);
    console.log('Total results:', searchResults.stateSpecific.length + searchResults.central.length + searchResults.other.length);
    
    if (searchResults.stateSpecific.length > 0) {
      console.log('\nSample state-specific result:');
      const sample = searchResults.stateSpecific[0];
      console.log('  Title:', sample.document.title);
      console.log('  Similarity:', sample.similarity);
      console.log('  Jurisdiction Country:', sample.document.jurisdiction_country);
      console.log('  Jurisdiction State:', sample.document.jurisdiction_state);
      console.log('  Category:', sample.document.category);
    }
    
    if (searchResults.central.length > 0) {
      console.log('\nSample central result:');
      const sample = searchResults.central[0];
      console.log('  Title:', sample.document.title);
      console.log('  Similarity:', sample.similarity);
      console.log('  Jurisdiction Country:', sample.document.jurisdiction_country);
      console.log('  Jurisdiction State:', sample.document.jurisdiction_state);
      console.log('  Category:', sample.document.category);
    }
    
  } catch (error) {
    console.error('ERROR: Vector search failed:', error);
  }
  
  // 5. Direct repository call for comparison
  console.log('\n5. Direct repository vector search (no category filter)...');
  try {
    const queryEmbedding = await embeddingService.generateEmbedding(queryText);
    const directResults = await legalDocumentRepository.vectorSearch(
      queryEmbedding,
      caseData.location_country || 'India',
      null, // No state filter
      null, // No category filter
      10
    );
    
    console.log('Direct results (no category filter):', directResults.length);
    if (directResults.length > 0) {
      console.log('Sample direct result:');
      const sample = directResults[0];
      console.log('  Title:', sample.document.title);
      console.log('  Similarity:', sample.similarity);
      console.log('  Category:', sample.document.category);
      console.log('  Jurisdiction Country:', sample.document.jurisdiction_country);
      console.log('  Jurisdiction State:', sample.document.jurisdiction_state);
    }
  } catch (error) {
    console.error('ERROR: Direct repository search failed:', error);
  }
}

// Get case ID from command line
const caseId = process.argv[2];
if (!caseId) {
  console.error('Usage: npx tsx scripts/debug-rag-retrieval.ts <case_id>');
  process.exit(1);
}

debugRAGRetrieval(caseId).catch(console.error);

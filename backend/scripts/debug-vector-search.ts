/**
 * Debug vector search with different parameters
 */

import { embeddingService } from '../src/services/ai/embeddingService';
import { legalDocumentRepository } from '../src/repositories/legalDocumentRepository';
import { config } from '../src/config';

require('dotenv').config();

async function main() {
  console.log('Debugging vector search...\n');
  
  if (!config.ai.geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  const queryText = 'Landlord Refusing to Return Security Deposit';
  const queryEmbedding = await embeddingService.generateEmbedding(queryText);
  
  console.log(`Query embedding dimension: ${queryEmbedding.length}\n`);
  
  // Test 1: No state filter, no category filter
  console.log('Test 1: Country only (India, no state, no category)');
  const results1 = await legalDocumentRepository.vectorSearch(
    queryEmbedding,
    'India',
    null,
    null,
    10
  );
  console.log(`  Results: ${results1.length}`);
  if (results1.length > 0) {
    console.log(`  Best similarity: ${results1[0].similarity.toFixed(4)}`);
    console.log(`  Best match: ${results1[0].document.title}`);
  }
  console.log();
  
  // Test 2: With state filter (Gujarat)
  console.log('Test 2: Country + State (India, Gujarat, no category)');
  const results2 = await legalDocumentRepository.vectorSearch(
    queryEmbedding,
    'India',
    'Gujarat',
    null,
    10
  );
  console.log(`  Results: ${results2.length}`);
  if (results2.length > 0) {
    console.log(`  Best similarity: ${results2[0].similarity.toFixed(4)}`);
    console.log(`  Best match: ${results2[0].document.title}`);
  }
  console.log();
  
  // Test 3: With category filter (Consumer)
  console.log('Test 3: Country + Category (India, no state, Consumer)');
  const results3 = await legalDocumentRepository.vectorSearch(
    queryEmbedding,
    'India',
    null,
    'Consumer',
    10
  );
  console.log(`  Results: ${results3.length}`);
  if (results3.length > 0) {
    console.log(`  Best similarity: ${results3[0].similarity.toFixed(4)}`);
    console.log(`  Best match: ${results3[0].document.title}`);
  }
  console.log();
  
  // Test 4: All filters
  console.log('Test 4: Country + State + Category (India, Gujarat, Consumer)');
  const results4 = await legalDocumentRepository.vectorSearch(
    queryEmbedding,
    'India',
    'Gujarat',
    'Consumer',
    10
  );
  console.log(`  Results: ${results4.length}`);
  if (results4.length > 0) {
    console.log(`  Best similarity: ${results4[0].similarity.toFixed(4)}`);
    console.log(`  Best match: ${results4[0].document.title}`);
  }
  console.log();
  
  // Check document metadata
  console.log('Checking Consumer Protection Act documents...');
  const allDocs = await legalDocumentRepository.findAll(5, 0);
  console.log(`Sample documents:`);
  allDocs.forEach(doc => {
    console.log(`  - ${doc.title}`);
    console.log(`    Country: ${doc.jurisdiction_country}, State: ${doc.jurisdiction_state}, Category: ${doc.category}`);
    console.log(`    Has embedding: ${doc.embedding ? 'YES' : 'NO'}`);
  });
}

main().catch(error => {
  console.error('Debug failed:', error);
  process.exit(1);
});

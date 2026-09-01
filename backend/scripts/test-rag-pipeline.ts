/**
 * Test RAG pipeline with landlord security deposit case
 */

import { embeddingService } from '../src/services/ai/embeddingService';
import { legalDocumentRepository } from '../src/repositories/legalDocumentRepository';
import { config } from '../src/config';

require('dotenv').config();

async function main() {
  console.log('Testing RAG pipeline with landlord security deposit case...\n');
  
  if (!config.ai.geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  // Test case details
  const testCase = {
    country: 'India',
    state: 'Gujarat',
    city: 'Bharuch',
    category: 'Consumer',
    title: 'Landlord Refusing to Return Security Deposit',
    description: `I rented a flat for 11 months and paid a security deposit of ₹30,000. After the agreement ended, I vacated the flat and handed over the keys. The landlord checked the flat and did not mention any major damage at that time.

It has now been around three weeks, but the landlord has not returned my security deposit. When I contacted him, he said that he would deduct ₹15,000 for painting and repairs. I asked him to provide the bills or details of the repairs, but he has not provided any documents.

I have the rental agreement, payment receipts and WhatsApp messages with the landlord. I want to know whether the landlord can deduct this amount from my deposit and what steps I can take to recover the remaining amount.`
  };
  
  console.log('Test Case:');
  console.log(`  Country: ${testCase.country}`);
  console.log(`  State: ${testCase.state}`);
  console.log(`  City: ${testCase.city}`);
  console.log(`  Category: ${testCase.category}`);
  console.log(`  Title: ${testCase.title}`);
  console.log(`  Description: ${testCase.description.substring(0, 100)}...\n`);
  
  // Step 1: Generate query embedding
  console.log('Step 1: Generating query embedding...');
  const queryText = `${testCase.title} ${testCase.description}`;
  const queryEmbedding = await embeddingService.generateEmbedding(queryText);
  console.log(`  ✓ Query embedding generated successfully`);
  console.log(`  ✓ Query embedding dimension: ${queryEmbedding.length}\n`);
  
  // Step 2: Vector search
  console.log('Step 2: Performing vector search...');
  const searchResults = await legalDocumentRepository.vectorSearch(
    queryEmbedding,
    testCase.country,
    testCase.state,
    testCase.category,
    10
  );
  
  console.log(`  ✓ Retrieved ${searchResults.length} chunks`);
  console.log(`  ✓ Best similarity: ${searchResults.length > 0 ? searchResults[0].similarity.toFixed(4) : 'N/A'}\n`);
  
  // Step 3: Display retrieved sources
  console.log('Step 3: Retrieved sources:');
  if (searchResults.length === 0) {
    console.log('  ✗ No sources retrieved');
  } else {
    searchResults.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.document.title}`);
      console.log(`     Section: ${result.document.section_number || 'N/A'}`);
      console.log(`     Similarity: ${result.similarity.toFixed(4)}`);
      console.log(`     Source URL: ${result.document.source_url || 'N/A'}`);
      console.log();
    });
  }
  
  // Step 4: Check if Consumer Protection Act was retrieved
  console.log('Step 4: Verification');
  const consumerProtectionActRetrieved = searchResults.some(result => 
    result.document.title.includes('Consumer Protection Act')
  );
  console.log(`  Consumer Protection Act retrieved: ${consumerProtectionActRetrieved ? 'YES' : 'NO'}`);
  
  // Step 5: Summary
  console.log('\n=== RAG Pipeline Test Summary ===');
  console.log(`Query embedding generated: YES`);
  console.log(`Query embedding dimension: ${queryEmbedding.length}`);
  console.log(`Chunks retrieved: ${searchResults.length}`);
  console.log(`Best similarity: ${searchResults.length > 0 ? searchResults[0].similarity.toFixed(4) : 'N/A'}`);
  console.log(`Consumer Protection Act retrieved: ${consumerProtectionActRetrieved ? 'YES' : 'NO'}`);
  console.log(`Location filtering working: ${searchResults.length > 0 ? 'YES' : 'NO'}`);
}

main().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});

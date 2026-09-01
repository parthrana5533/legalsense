/**
 * Update existing legal documents with embeddings
 * 
 * This script:
 * 1. Finds legal documents where embedding IS NULL
 * 2. Generates embeddings using Gemini
 * 3. Updates each record with the embedding
 * 4. Stops immediately on quota exhaustion (429 errors)
 */

import { embeddingService } from '../src/services/ai/embeddingService';
import { legalDocumentRepository } from '../src/repositories/legalDocumentRepository';
import { config } from '../src/config';

// Load environment variables
require('dotenv').config();

/**
 * Check if error is a quota exhaustion error (429)
 */
function isQuotaExhaustedError(error: any): boolean {
  const errorMessage = error?.message || '';
  return errorMessage.includes('429') || 
         errorMessage.includes('RESOURCE_EXHAUSTED') ||
         errorMessage.includes('quota') ||
         errorMessage.includes('rate limit');
}

/**
 * Check if error is a temporary error that can be retried
 */
function isTemporaryError(error: any): boolean {
  const errorMessage = error?.message || '';
  return errorMessage.includes('500') ||
         errorMessage.includes('502') ||
         errorMessage.includes('503') ||
         errorMessage.includes('504') ||
         errorMessage.includes('timeout') ||
         errorMessage.includes('ECONNRESET');
}

/**
 * Main update function
 */
async function main() {
  console.log('Starting embedding update for existing legal documents...\n');
  
  // Check environment variables
  if (!config.ai.geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured in environment variables');
  }
  
  // Count existing embeddings before starting
  console.log('Counting existing embeddings...');
  const allDocuments = await legalDocumentRepository.findAll(1000, 0);
  const existingWithEmbeddings = allDocuments.filter(doc => doc.embedding && doc.embedding.length > 0).length;
  console.log(`Existing embeddings: ${existingWithEmbeddings}\n`);
  
  // Fetch documents without embeddings
  console.log('Fetching documents without embeddings...');
  const documentsWithoutEmbeddings = allDocuments.filter(doc => !doc.embedding || doc.embedding.length === 0);
  
  console.log(`Found ${documentsWithoutEmbeddings.length} documents without embeddings\n`);
  
  if (documentsWithoutEmbeddings.length === 0) {
    console.log('All documents already have embeddings. Nothing to do.');
    return;
  }
  
  // Update each document with embedding
  console.log('Generating embeddings and updating documents...\n');
  let successCount = 0;
  let failCount = 0;
  let quotaExhausted = false;
  
  for (let i = 0; i < documentsWithoutEmbeddings.length; i++) {
    const doc = documentsWithoutEmbeddings[i];
    console.log(`[${i + 1}/${documentsWithoutEmbeddings.length}] Processing: ${doc.title}`);
    
    try {
      // Generate embedding for the content
      const embedding = await embeddingService.generateEmbedding(doc.content);
      
      // Update the document with embedding
      await legalDocumentRepository.update(doc.id, { embedding });
      
      console.log(`  ✓ Updated with embedding (${embedding.length} dimensions)`);
      successCount++;
      
      // Add a small delay between successful requests to avoid rate limiting
      if (i < documentsWithoutEmbeddings.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check for quota exhaustion - stop immediately
      if (isQuotaExhaustedError(error)) {
        console.error(`  ✗ QUOTA EXHAUSTED: ${errorMessage}`);
        console.error('\n=== Gemini API Quota Exhausted ===');
        console.error('Embedding generation stopped due to quota limits.');
        console.error(`Successfully embedded: ${successCount} documents`);
        console.error(`Remaining without embeddings: ${documentsWithoutEmbeddings.length - successCount}`);
        console.error(`\nPlease wait for the quota to reset (typically 24 hours for free tier)`);
        console.error('Then run this script again to continue from the remaining documents.');
        quotaExhausted = true;
        break; // Stop processing immediately
      }
      
      // Retry temporary errors (up to 2 retries)
      if (isTemporaryError(error)) {
        console.error(`  ✗ Temporary error: ${errorMessage}`);
        console.error(`  Retrying after 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const embedding = await embeddingService.generateEmbedding(doc.content);
          await legalDocumentRepository.update(doc.id, { embedding });
          console.log(`  ✓ Updated with embedding after retry (${embedding.length} dimensions)`);
          successCount++;
          continue;
        } catch (retryError) {
          console.error(`  ✗ Retry failed: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`);
          failCount++;
        }
      } else {
        // Non-retryable error
        console.error(`  ✗ Failed: ${errorMessage}`);
        failCount++;
      }
    }
  }
  
  // Verify final state
  console.log('\n=== Final State Verification ===');
  const finalDocuments = await legalDocumentRepository.findAll(1000, 0);
  const finalWithEmbeddings = finalDocuments.filter(doc => doc.embedding && doc.embedding.length > 0).length;
  const finalWithoutEmbeddings = finalDocuments.length - finalWithEmbeddings;
  
  console.log(`Total documents in database: ${finalDocuments.length}`);
  console.log(`Documents with embeddings: ${finalWithEmbeddings}`);
  console.log(`Documents without embeddings: ${finalWithoutEmbeddings}`);
  
  // Print summary
  console.log('\n=== Summary ===');
  if (quotaExhausted) {
    console.log('Embedding update PAUSED (quota exhausted)');
  } else if (failCount > 0) {
    console.log('Embedding update COMPLETE (with errors)');
  } else {
    console.log('Embedding update COMPLETE');
  }
  
  console.log(`Successfully embedded: ${successCount}`);
  console.log(`Remaining without embeddings: ${finalWithoutEmbeddings}`);
  console.log(`Existing embeddings untouched: ${existingWithEmbeddings}`);
  
  if (quotaExhausted) {
    console.log('\n⚠ Quota exhausted - run again after quota resets to continue.');
    process.exit(1);
  }
  
  if (failCount > 0) {
    console.log('\n⚠ Some documents failed to update. Please check the errors above.');
    process.exit(1);
  }
  
  console.log('\n✓ Embedding update completed successfully');
}

main().catch(error => {
  console.error('Embedding update failed:', error);
  process.exit(1);
});

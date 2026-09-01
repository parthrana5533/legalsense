/**
 * Test single embedding generation
 */

import { embeddingService } from '../src/services/ai/embeddingService';
import { config } from '../src/config';

require('dotenv').config();

async function main() {
  if (!config.ai.geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log('Testing single embedding generation...');
  
  const testText = 'Consumer Protection Act, 2019';
  
  try {
    const embedding = await embeddingService.generateEmbedding(testText);
    
    console.log('embedding generated successfully');
    console.log(`embedding dimension: ${embedding.length}`);
  } catch (error) {
    console.error('Test failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main();

/**
 * List available Gemini models
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../src/config';

require('dotenv').config();

async function main() {
  if (!config.ai.geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);
  
  console.log('Fetching available models...');
  const models = await genAI.listModels();
  
  console.log(`\nFound ${models.length} models:\n`);
  
  models.forEach(model => {
    console.log(`- ${model.name}`);
    console.log(`  Display name: ${model.displayName}`);
    console.log(`  Description: ${model.description}`);
    console.log(`  Supported generation methods: ${model.supportedGenerationMethods?.join(', ')}`);
    console.log();
  });
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

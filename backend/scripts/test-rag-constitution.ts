import { embeddingService } from '../src/services/ai/embeddingService';
import { legalDocumentRepository } from '../src/repositories/legalDocumentRepository';
import { vectorSearchService } from '../src/services/rag/vectorSearchService';
import { config } from '../src/config';

require('dotenv').config();

async function testRAGConstitution() {
  console.log('=== RAG Retrieval Test for Constitution ===\n');
  
  const query = 'What fundamental right may be relevant if a person faces discrimination?';
  
  console.log('Query:', query);
  console.log('Location: India → Gujarat → Bharuch\n');
  
  try {
    // Generate embedding for the query
    console.log('Generating embedding for query...');
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    console.log(`✓ Embedding generated (dimension: ${queryEmbedding.length})\n`);
    
    // Perform vector search
    console.log('Performing vector search...');
    const results = await legalDocumentRepository.vectorSearch(
      queryEmbedding,
      'India',
      'Gujarat',
      null, // No category filter
      10
    );
    
    console.log(`✓ Retrieved ${results.length} chunks\n`);
    
    if (results.length > 0) {
      console.log('--- Retrieved Chunks ---');
      results.forEach((result, i) => {
        console.log(`\n${i + 1}. ${result.document.title}`);
        console.log(`   Similarity: ${result.similarity.toFixed(4)}`);
        console.log(`   Section/Article: ${result.document.section_number}`);
        console.log(`   Content preview: ${result.document.content?.substring(0, 150)}...`);
        console.log(`   Act name: ${result.document.metadata?.act_name}`);
      });
      
      // Check if Constitution chunks were retrieved
      const constitutionChunks = results.filter(r => 
        r.document.metadata?.act_name === 'Constitution of India'
      );
      
      console.log('\n--- Constitution Chunks Retrieved ---');
      console.log(`Count: ${constitutionChunks.length}`);
      
      if (constitutionChunks.length > 0) {
        console.log('Article numbers:', constitutionChunks.map(c => c.document.section_number).join(', '));
        console.log('Best similarity:', Math.max(...constitutionChunks.map(c => c.similarity)).toFixed(4));
      }
    } else {
      console.log('No chunks retrieved');
    }
    
    console.log('\n--- Test Summary ---');
    console.log('Number of chunks retrieved:', results.length);
    console.log('Location filtering applied:', 'YES (India, Gujarat)');
    console.log('Constitution chunks retrieved:', results.filter(r => r.document.metadata?.act_name === 'Constitution of India').length);
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

testRAGConstitution().catch(console.error);

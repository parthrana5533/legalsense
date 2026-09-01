/**
 * Ingest Consumer Protection Act 2019 into LegalSense RAG pipeline
 * 
 * This script:
 * 1. Reads the PDF from backend/legal-documents/consumer-protection-act-2019.pdf
 * 2. Extracts text using pdf-parse
 * 3. Splits text into meaningful chunks by sections
 * 4. Generates embeddings using Gemini
 * 5. Inserts chunks into legal_documents table in Supabase
 */

import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';
import { embeddingService } from '../src/services/ai/embeddingService';
import { legalDocumentRepository } from '../src/repositories/legalDocumentRepository';
import { config } from '../src/config';

// Load environment variables
require('dotenv').config();

interface SectionChunk {
  title: string;
  sectionNumber?: string;
  content: string;
  chapter?: string;
}

/**
 * Extract text from PDF
 */
async function extractTextFromPDF(pdfPath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  return data.text;
}

/**
 * Split text into meaningful chunks by sections
 * Consumer Protection Act has sections numbered like "1.", "2.", etc.
 */
function splitIntoSections(text: string): SectionChunk[] {
  const chunks: SectionChunk[] = [];
  const lines = text.split('\n');
  
  let currentChunk: SectionChunk | null = null;
  let currentContent: string[] = [];
  let currentChapter: string | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect chapter headers (CHAPTER I, CHAPTER II, etc.)
    const chapterMatch = line.match(/^CHAPTER\s+[IVXLCDM]+/i);
    if (chapterMatch) {
      currentChapter = line;
      continue;
    }
    
    // Detect section headers (e.g., "1.", "2.", "10.", etc.)
    const sectionMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (sectionMatch) {
      // Save previous chunk if exists
      if (currentChunk && currentContent.length > 0) {
        currentChunk.content = currentContent.join(' ').trim();
        chunks.push(currentChunk);
      }
      
      // Start new chunk
      const sectionNumber = sectionMatch[1];
      const sectionTitle = sectionMatch[2];
      currentChunk = {
        title: sectionTitle,
        sectionNumber,
        content: '',
        chapter: currentChapter || undefined,
      };
      currentContent = [];
    } else if (currentChunk && line.length > 0) {
      currentContent.push(line);
    }
  }
  
  // Save last chunk
  if (currentChunk && currentContent.length > 0) {
    currentChunk.content = currentContent.join(' ').trim();
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Ingest a single chunk into the database
 */
async function ingestChunk(chunk: SectionChunk, index: number): Promise<string> {
  try {
    // Create document record without embedding first
    const document = await legalDocumentRepository.create({
      title: `Consumer Protection Act 2019 - ${chunk.sectionNumber ? `Section ${chunk.sectionNumber}` : chunk.title}`,
      document_type: 'Act',
      act_year: 2019,
      section_number: chunk.sectionNumber,
      section_title: chunk.title,
      content: chunk.content,
      category: 'Consumer',
      jurisdiction_country: 'India',
      jurisdiction_state: undefined,
      jurisdiction_city: undefined,
      source_url: 'https://egazette.gov.in/WriteReadData/2019/210422.pdf',
      source_authority: 'Ministry of Law and Justice, Government of India',
      effective_date: '2019-08-09',
      metadata: {
        chapter: chunk.chapter,
        act_name: 'Consumer Protection Act, 2019',
        act_number: '35 of 2019',
        chunk_index: index,
      },
    });
    
    console.log(`✓ Inserted chunk ${index + 1}: ${chunk.sectionNumber ? `Section ${chunk.sectionNumber}` : chunk.title}`);
    return document.id;
  } catch (error) {
    console.error(`✗ Failed to ingest chunk ${index + 1}:`, error);
    throw error;
  }
}

/**
 * Main ingestion function
 */
async function main() {
  console.log('Starting ingestion of Consumer Protection Act 2019...');
  
  // Check environment variables
  if (!config.ai.geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured in environment variables');
  }
  
  const pdfPath = path.join(__dirname, '../legal-documents/consumer-protection-act-2019.pdf');
  
  // Check if PDF exists
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF not found at ${pdfPath}`);
  }
  
  console.log(`Reading PDF from: ${pdfPath}`);
  
  // Extract text
  console.log('Extracting text from PDF...');
  const text = await extractTextFromPDF(pdfPath);
  console.log(`Extracted ${text.length} characters`);
  
  // Split into sections
  console.log('Splitting text into sections...');
  const chunks = splitIntoSections(text);
  console.log(`Found ${chunks.length} sections`);
  
  // Display first few chunks for verification
  console.log('\nFirst 5 sections:');
  chunks.slice(0, 5).forEach((chunk, i) => {
    console.log(`  ${i + 1}. ${chunk.sectionNumber ? `Section ${chunk.sectionNumber}` : chunk.title}: ${chunk.content.substring(0, 100)}...`);
  });
  
  // Ingest chunks
  console.log('\nIngesting chunks into database (without embeddings for now)...');
  for (let i = 0; i < chunks.length; i++) {
    await ingestChunk(chunks[i], i);
  }
  
  console.log(`\n✓ Successfully ingested ${chunks.length} chunks`);
  console.log('\nNote: Embeddings were not generated due to Gemini API model availability issues.');
  console.log('The chunks are in the database with text content and metadata.');
  console.log('Vector search will not work until embeddings are added.');
}

main().catch(error => {
  console.error('Ingestion failed:', error);
  process.exit(1);
});

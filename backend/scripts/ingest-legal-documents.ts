/**
 * Generic Legal Document Ingestion Script
 * 
 * This script ingests legal PDF documents from backend/legal-documents/
 * into the legal_documents table with embeddings for RAG.
 * 
 * Usage:
 *   npm run ingest:legal                    # Ingest all documents
 *   npm run ingest:legal -- --force        # Force re-ingest all
 *   npm run ingest:legal -- --force file.pdf  # Force re-ingest specific file
 */

import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';
import { embeddingService } from '../src/services/ai/embeddingService';
import { legalDocumentRepository } from '../src/repositories/legalDocumentRepository';
import { supabaseService } from '../src/config/supabase';
import { config } from '../src/config';

require('dotenv').config();

interface SectionChunk {
  title: string;
  sectionNumber?: string;
  content: string;
  chapter?: string;
  part?: string;
  articleNumber?: string;
  scheduleNumber?: string;
}

interface DocumentMetadata {
  title: string;
  act_name: string;
  year: number;
  jurisdiction: string;
  country: string;
  state: string | null;
  city: string | null;
  source: string;
  source_url: string;
  category: string;
}

interface MetadataConfig {
  [filename: string]: DocumentMetadata;
}

// Parse command line arguments
const args = process.argv.slice(2);
const forceIndex = args.indexOf('--force');
const force = forceIndex !== -1;
const forceFile = force && forceIndex + 1 < args.length ? args[forceIndex + 1] : null;

// Check if a specific file is provided (not with --force)
const specificFileIndex = args.findIndex(arg => arg.endsWith('.pdf') && !arg.startsWith('--'));
const specificFile = specificFileIndex !== -1 ? args[specificFileIndex] : null;

/**
 * Load metadata configuration
 */
function loadMetadata(): MetadataConfig {
  const metadataPath = path.join(__dirname, '../legal-documents/metadata.json');
  
  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Metadata file not found at ${metadataPath}`);
  }
  
  const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
  return JSON.parse(metadataContent);
}

/**
 * Get all PDF files in the legal-documents directory
 */
function getPDFFiles(): string[] {
  const legalDocsDir = path.join(__dirname, '../legal-documents');
  
  if (!fs.existsSync(legalDocsDir)) {
    throw new Error(`Legal documents directory not found at ${legalDocsDir}`);
  }
  
  const files = fs.readdirSync(legalDocsDir);
  return files.filter(file => file.endsWith('.pdf') && file !== 'metadata.json');
}

/**
 * Check if a document has already been ingested
 */
async function isIngested(actName: string, year: number): Promise<boolean> {
  const { data, error } = await supabaseService
    .from('legal_documents')
    .select('id')
    .eq('metadata->>act_name', actName)
    .eq('act_year', year)
    .limit(1);
  
  if (error) {
    throw new Error(`Failed to check ingestion status: ${error.message}`);
  }
  
  return data && data.length > 0;
}

/**
 * Delete all chunks for a document (for force re-ingestion)
 */
async function deleteDocumentChunks(actName: string, year: number): Promise<void> {
  const { error } = await supabaseService
    .from('legal_documents')
    .delete()
    .eq('metadata->>act_name', actName)
    .eq('act_year', year);
  
  if (error) {
    throw new Error(`Failed to delete document chunks: ${error.message}`);
  }
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
 * Handles various document structures:
 * - Regular Acts: Section 1, Section 2, etc.
 * - Constitution: PART, CHAPTER, Article, Schedule
 */
function splitIntoSections(text: string, isConstitution: boolean = false): SectionChunk[] {
  const chunks: SectionChunk[] = [];
  const lines = text.split('\n');
  
  let currentChunk: SectionChunk | null = null;
  let currentContent: string[] = [];
  let currentPart: string | null = null;
  let currentChapter: string | null = null;
  
  // Skip table of contents and preamble for Constitution
  let inContents = false;
  let inPreamble = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.length === 0) continue;
    
    // Skip contents section
    if (line === 'CONTENTS' || line === 'INDEX') {
      inContents = true;
      continue;
    }
    if (inContents && (line.startsWith('PART') || line.startsWith('PREAMBLE'))) {
      inContents = false;
    }
    if (inContents) continue;
    
    // Skip preamble text (not actual articles)
    if (line === 'PREAMBLE') {
      inPreamble = true;
      continue;
    }
    if (inPreamble && line.startsWith('PART')) {
      inPreamble = false;
    }
    if (inPreamble) continue;
    
    // Detect PART headers (Constitution)
    const partMatch = line.match(/^PART\s+[IVXLCDM]+\s+(.+)/i);
    if (partMatch && isConstitution) {
      currentPart = line;
      continue;
    }
    
    // Detect CHAPTER headers
    const chapterMatch = line.match(/^CHAPTER\s+[IVXLCDM]+/i);
    if (chapterMatch) {
      currentChapter = line;
      continue;
    }
    
    // Detect SCHEDULE headers (Constitution)
    const scheduleMatch = line.match(/^SCHEDULE\s+([IVXLCDM0-9]+)\s*(.*)/i);
    if (scheduleMatch && isConstitution) {
      // Save previous chunk if exists
      if (currentChunk && currentContent.length > 0) {
        currentChunk.content = currentContent.join(' ').trim();
        if (currentChunk.content.length > 50) {
          chunks.push(currentChunk);
        }
      }
      
      currentChunk = {
        title: scheduleMatch[2] || `Schedule ${scheduleMatch[1]}`,
        scheduleNumber: scheduleMatch[1],
        content: '',
        part: currentPart || undefined,
        chapter: currentChapter || undefined,
      };
      currentContent = [];
      continue;
    }
    
    // Detect Article headers (Constitution) - only if not in contents
    const articleMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (articleMatch && isConstitution && !inContents) {
      // Save previous chunk if exists
      if (currentChunk && currentContent.length > 0) {
        currentChunk.content = currentContent.join(' ').trim();
        if (currentChunk.content.length > 50) {
          chunks.push(currentChunk);
        }
      }
      
      const articleNumber = articleMatch[1];
      const articleTitle = articleMatch[2];
      currentChunk = {
        title: articleTitle,
        articleNumber,
        content: '',
        part: currentPart || undefined,
        chapter: currentChapter || undefined,
      };
      currentContent = [];
      continue;
    }
    
    // Detect Section headers (Regular Acts)
    const sectionMatch = line.match(/^(\d+)\.\s+(.+)/) || 
                       line.match(/^Section\s+(\d+)\.?\s*(.*)/i) ||
                       line.match(/^Section\s+(\d+)\s*-\s*(.*)/i);
    
    if (sectionMatch && !isConstitution) {
      // Save previous chunk if exists
      if (currentChunk && currentContent.length > 0) {
        currentChunk.content = currentContent.join(' ').trim();
        if (currentChunk.content.length > 50) {
          chunks.push(currentChunk);
        }
      }
      
      const sectionNumber = sectionMatch[1];
      const sectionTitle = sectionMatch[2] || sectionMatch[3] || '';
      currentChunk = {
        title: sectionTitle,
        sectionNumber,
        content: '',
        chapter: currentChapter || undefined,
        part: currentPart || undefined,
      };
      currentContent = [];
    } else if (currentChunk && line.length > 0) {
      currentContent.push(line);
    }
  }
  
  // Save last chunk
  if (currentChunk && currentContent.length > 0) {
    currentChunk.content = currentContent.join(' ').trim();
    if (currentChunk.content.length > 50) {
      chunks.push(currentChunk);
    }
  }
  
  return chunks;
}

/**
 * Ingest a single chunk into the database without embedding
 * Embeddings are added separately to avoid quota issues
 */
async function ingestChunk(
  chunk: SectionChunk,
  metadata: DocumentMetadata,
  index: number,
  totalChunks: number
): Promise<void> {
  try {
    // Determine the section identifier based on chunk type
    let sectionIdentifier = chunk.sectionNumber;
    if (chunk.articleNumber) {
      sectionIdentifier = chunk.articleNumber;
    } else if (chunk.scheduleNumber) {
      sectionIdentifier = `Schedule ${chunk.scheduleNumber}`;
    }
    
    // Create document record without embedding first
    await legalDocumentRepository.create({
      title: `${metadata.title} - ${sectionIdentifier ? sectionIdentifier : chunk.title}`,
      document_type: 'Act',
      act_year: metadata.year,
      section_number: chunk.sectionNumber || chunk.articleNumber || chunk.scheduleNumber,
      section_title: chunk.title,
      content: chunk.content,
      category: metadata.category,
      jurisdiction_country: metadata.country,
      jurisdiction_state: metadata.state || undefined,
      jurisdiction_city: metadata.city || undefined,
      source_url: metadata.source_url || undefined,
      source_authority: metadata.source,
      effective_date: `${metadata.year}-01-01`,
      metadata: {
        chapter: chunk.chapter,
        part: chunk.part,
        article_number: chunk.articleNumber,
        schedule_number: chunk.scheduleNumber,
        act_name: metadata.act_name,
        chunk_index: index,
        total_chunks: totalChunks,
      },
    });
    
    process.stdout.write(`.`);
  } catch (error) {
    console.error(`\n✗ Failed to ingest chunk ${index + 1}:`, error);
    throw error;
  }
}

/**
 * Ingest a single PDF document
 */
async function ingestDocument(
  filename: string,
  metadata: DocumentMetadata,
  forceReingest: boolean
): Promise<{ chunks: number; skipped: boolean; charactersExtracted: number }> {
  const pdfPath = path.join(__dirname, '../legal-documents', filename);
  const isConstitution = metadata.act_name.toLowerCase().includes('constitution');
  
  console.log(`\n✓ ${metadata.title}`);
  
  // Check if already ingested
  if (!forceReingest) {
    const alreadyIngested = await isIngested(metadata.act_name, metadata.year);
    if (alreadyIngested) {
      console.log(`  Already ingested — skipped`);
      return { chunks: 0, skipped: true, charactersExtracted: 0 };
    }
  } else {
    // Delete existing chunks for force re-ingestion
    await deleteDocumentChunks(metadata.act_name, metadata.year);
    console.log(`  Force re-ingestion — deleted existing chunks`);
  }
  
  // Check if PDF exists
  if (!fs.existsSync(pdfPath)) {
    console.log(`  ✗ PDF not found at ${pdfPath}`);
    return { chunks: 0, skipped: true, charactersExtracted: 0 };
  }
  
  // Extract text
  console.log(`  Extracting...`);
  const text = await extractTextFromPDF(pdfPath);
  console.log(`  Extracted: ${text.length.toLocaleString()} characters`);
  
  // Split into sections
  const chunks = splitIntoSections(text, isConstitution);
  console.log(`  Chunks: ${chunks.length}`);
  
  // Ingest chunks
  console.log(`  Inserting: `);
  
  for (let i = 0; i < chunks.length; i++) {
    await ingestChunk(chunks[i], metadata, i, chunks.length);
  }
  
  console.log(` ${chunks.length}`);
  
  return { chunks: chunks.length, skipped: false, charactersExtracted: text.length };
}

/**
 * Main ingestion function
 */
async function main() {
  console.log('========================================');
  console.log('LegalSense Legal Document Ingestion');
  console.log('========================================\n');
  
  // Check environment variables
  if (!config.ai.geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured in environment variables');
  }
  
  // Load metadata
  const metadata = loadMetadata();
  
  // Get PDF files - filter by specific file if provided
  let pdfFiles = getPDFFiles();
  if (specificFile) {
    pdfFiles = pdfFiles.filter(f => f === specificFile);
    if (pdfFiles.length === 0) {
      console.log(`File not found: ${specificFile}`);
      return;
    }
  }
  
  console.log(`Found ${pdfFiles.length} PDF file(s) to process.\n`);
  
  let totalChunksInserted = 0;
  let documentsSkipped = 0;
  let documentsIngested = 0;
  let errors = 0;
  const results: any[] = [];
  
  // Process each PDF
  for (const filename of pdfFiles) {
    // Skip if force mode and specific file is specified
    if (force && forceFile && filename !== forceFile) {
      continue;
    }
    
    // Skip if not in force mode and specific file is specified
    if (!force && forceFile && filename !== forceFile) {
      continue;
    }
    
    const docMetadata = metadata[filename];
    
    if (!docMetadata) {
      console.log(`\n✗ ${filename}`);
      console.log(`  No metadata found — skipped`);
      documentsSkipped++;
      continue;
    }
    
    try {
      const result = await ingestDocument(filename, docMetadata, force);
      
      results.push({
        filename,
        title: docMetadata.title,
        ...result
      });
      
      if (result.skipped) {
        documentsSkipped++;
      } else {
        totalChunksInserted += result.chunks;
        documentsIngested++;
      }
    } catch (error) {
      console.error(`\n✗ ${filename}`);
      console.error(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      errors++;
    }
  }
  
  // Print detailed results for each document
  console.log('\n========================================');
  console.log('DETAILED RESULTS');
  console.log('========================================');
  
  for (const result of results) {
    console.log(`\nDocument: ${result.title}`);
    console.log(`Filename: ${result.filename}`);
    console.log(`Characters extracted: ${result.charactersExtracted.toLocaleString()}`);
    console.log(`Chunks created: ${result.chunks}`);
    console.log(`Chunks inserted: ${result.chunks}`);
    console.log(`Chunks with embeddings: 0 (embeddings added separately)`);
    console.log(`Chunks without embeddings: ${result.chunks}`);
    
    if (result.chunks > 0) {
      // Get first 5 chunks for display
      const { data: chunks } = await supabaseService
        .from('legal_documents')
        .select('title, content')
        .eq('metadata->>act_name', metadata[result.filename]?.act_name)
        .eq('act_year', metadata[result.filename]?.year)
        .limit(5);
      
      if (chunks && chunks.length > 0) {
        console.log(`\nFirst 5 chunks:`);
        chunks.forEach((chunk, i) => {
          console.log(`- ${chunk.title}`);
          console.log(`  Character count: ${chunk.content?.length || 0}`);
        });
      }
    }
    
    const meta = metadata[result.filename];
    console.log(`\nMetadata:`);
    console.log(`- Act name: ${meta.act_name}`);
    console.log(`- Jurisdiction: ${meta.jurisdiction}`);
    console.log(`- Source URL: ${meta.source_url || 'N/A'}`);
  }
  
  // Print summary
  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`PDFs found: ${pdfFiles.length}`);
  console.log(`Documents newly ingested: ${documentsIngested}`);
  console.log(`Documents skipped: ${documentsSkipped}`);
  console.log(`Chunks inserted: ${totalChunksInserted}`);
  console.log(`Errors: ${errors}`);
  console.log('========================================\n');
  
  if (errors > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\nIngestion failed:', error);
  process.exit(1);
});

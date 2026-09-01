/**
 * Inspect PDF structure to understand formatting
 */

import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';

require('dotenv').config();

async function inspectPDF(filename: string) {
  const pdfPath = path.join(__dirname, '../legal-documents', filename);
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found: ${pdfPath}`);
    return;
  }
  
  console.log(`=== Inspecting: ${filename} ===\n`);
  
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  
  console.log(`Total characters: ${data.text.length}`);
  console.log(`Total pages: ${data.numpages}`);
  
  // Show first 2000 characters
  console.log('\n--- First 2000 characters ---');
  console.log(data.text.substring(0, 2000));
  
  // Show lines
  const lines = data.text.split('\n').slice(0, 100);
  console.log('\n--- First 100 lines ---');
  lines.forEach((line, i) => {
    console.log(`${i + 1}: ${line}`);
  });
  
  // Look for patterns
  console.log('\n--- Pattern Detection ---');
  const partMatches = data.text.match(/^PART\s+[IVXLCDM]+/gm);
  console.log(`PART matches: ${partMatches?.length || 0}`);
  if (partMatches) partMatches.slice(0, 5).forEach(m => console.log(`  ${m}`));
  
  const chapterMatches = data.text.match(/^CHAPTER\s+[IVXLCDM]+/gm);
  console.log(`CHAPTER matches: ${chapterMatches?.length || 0}`);
  if (chapterMatches) chapterMatches.slice(0, 5).forEach(m => console.log(`  ${m}`));
  
  const articleMatches = data.text.match(/^Article\s+\d+/gm);
  console.log(`Article matches: ${articleMatches?.length || 0}`);
  if (articleMatches) articleMatches.slice(0, 5).forEach(m => console.log(`  ${m}`));
  
  const sectionMatches = data.text.match(/^\d+\.\s+/gm);
  console.log(`Section matches: ${sectionMatches?.length || 0}`);
  if (sectionMatches) sectionMatches.slice(0, 5).forEach(m => console.log(`  ${m}`));
}

const filename = process.argv[2] || 'constitution-of-india-2024.pdf';
inspectPDF(filename).catch(console.error);

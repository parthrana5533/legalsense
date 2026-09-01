import { ocrService } from '../src/services/ocr/ocrService';
import { readFileSync } from 'fs';
import { join } from 'path';

require('dotenv').config();

async function testOCR() {
  console.log('=== OCR Testing ===\n');

  // Test 1: Image OCR
  console.log('Test 1: Image OCR');
  console.log('Note: This test requires a sample image file.');
  console.log('Create a test image with readable text and update the path below.\n');
  
  // Uncomment and update path to test actual image
  // const imagePath = join(__dirname, '../test-image.png');
  // const imageBuffer = readFileSync(imagePath);
  // try {
  //   const result = await ocrService.extractTextFromImage(imageBuffer);
  //   console.log('✓ Image OCR successful');
  //   console.log('Extracted text:', result.text.substring(0, 200));
  //   console.log('Confidence:', result.confidence);
  //   console.log('Language:', result.language);
  // } catch (error) {
  //   console.error('✗ Image OCR failed:', error);
  // }

  // Test 2: PDF text extraction
  console.log('\nTest 2: PDF text extraction');
  console.log('Note: This test requires a sample PDF file.');
  console.log('Create a test PDF with text and update the path below.\n');
  
  // Uncomment and update path to test actual PDF
  // const pdfPath = join(__dirname, '../test-document.pdf');
  // const pdfBuffer = readFileSync(pdfPath);
  // try {
  //   const text = await ocrService.extractTextFromPDF(pdfBuffer);
  //   console.log('✓ PDF text extraction successful');
  //   console.log('Extracted text:', text.substring(0, 200));
  //   console.log('Total characters:', text.length);
  // } catch (error) {
  //   console.error('✗ PDF text extraction failed:', error);
  // }

  console.log('\n=== OCR Service Ready ===');
  console.log('To test with actual files:');
  console.log('1. Place a test image in backend/scripts/');
  console.log('2. Place a test PDF in backend/scripts/');
  console.log('3. Uncomment the test sections above');
  console.log('4. Run: npx tsx scripts/test-ocr.ts');
}

testOCR().catch(console.error);

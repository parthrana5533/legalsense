/**
 * OCR Service
 * Handles text extraction from images and PDFs using Tesseract.js and pdf-parse
 */

import { OCRResult } from '../../types';
import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';

export class OCRService {
  /**
   * Extract text from an image using Tesseract.js
   */
  async extractTextFromImage(imageBuffer: Buffer): Promise<OCRResult> {
    try {
      const { data } = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: (m: any) => {
          // Optional: log progress for debugging
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${(m.progress * 100).toFixed(0)}%`);
          }
        },
      });

      return {
        text: data.text.trim(),
        confidence: data.confidence,
        language: 'eng',
      };
    } catch (error) {
      console.error('OCR failed for image:', error);
      throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from a PDF using pdf-parse
   * Works for text-based PDFs, not scanned PDFs
   */
  async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(pdfBuffer);
      const text = data.text.trim();
      
      if (!text || text.length === 0) {
        throw new Error('No text found in PDF - it may be a scanned PDF requiring OCR');
      }
      
      return text;
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect language of text (placeholder - returns English)
   * TODO: Implement actual language detection if needed
   */
  async detectLanguage(text: string): Promise<string> {
    // Placeholder implementation
    // For now, assume English as this is for Indian legal documents
    return 'en';
  }
}

export const ocrService = new OCRService();

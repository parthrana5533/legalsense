/**
 * File Service
 * Handles file upload and storage operations using Supabase Storage
 */

import { supabaseService } from '../config/supabase';
import { caseFileRepository } from '../repositories/caseFileRepository';
import { ocrService } from '../services/ocr/ocrService';
import { CreateCaseFileInput, CaseFile, FileType } from '../types';

export class FileService {
  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string
  ): Promise<{ path: string; publicUrl: string }> {
    const { data, error } = await supabaseService.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseService.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl,
    };
  }

  /**
   * Delete file from Supabase Storage
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabaseService.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Determine file type from MIME type
   */
  getFileTypeFromMimeType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'other';
  }

  /**
   * Generate storage path for a case file
   */
  generateStoragePath(caseId: string, filename: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${caseId}/${timestamp}-${sanitizedFilename}`;
  }

  /**
   * Upload case file and create database record
   */
  async uploadCaseFile(
    caseId: string,
    file: Buffer,
    filename: string,
    mimeType: string,
    fileSize: number
  ): Promise<CaseFile> {
    const fileType = this.getFileTypeFromMimeType(mimeType);
    
    // Determine bucket based on file type
    let bucket = 'case-documents';
    if (fileType === 'image') {
      bucket = 'case-images';
    }

    // Generate storage path
    const storagePath = this.generateStoragePath(caseId, filename);

    // Upload to Supabase Storage
    const { path, publicUrl } = await this.uploadFile(bucket, storagePath, file, mimeType);

    // Extract text from file if supported
    let extractedText: string | null = null;
    try {
      if (fileType === 'image') {
        const ocrResult = await ocrService.extractTextFromImage(file);
        extractedText = ocrResult.text;
        console.log(`OCR extracted ${extractedText.length} characters from image`);
      } else if (fileType === 'pdf') {
        extractedText = await ocrService.extractTextFromPDF(file);
        console.log(`PDF text extraction extracted ${extractedText.length} characters`);
      }
    } catch (error) {
      console.error(`Text extraction failed for ${filename}:`, error);
      // Continue with upload even if extraction fails
    }

    // Create database record with extracted text
    const fileRecord = await caseFileRepository.create({
      case_id: caseId,
      filename,
      file_type: fileType,
      storage_path: path,
      public_url: publicUrl,
      file_size: fileSize,
      extracted_text: extractedText,
    });

    return fileRecord;
  }

  /**
   * Delete case file from storage and database
   */
  async deleteCaseFile(fileId: string, userId: string): Promise<void> {
    const file = await caseFileRepository.findById(fileId);
    
    if (!file) {
      throw new Error('File not found');
    }

    // Verify ownership by checking the case belongs to the user
    const { data: caseData } = await supabaseService
      .from('cases')
      .select('user_id')
      .eq('id', file.case_id)
      .single();

    if (!caseData || caseData.user_id !== userId) {
      throw new Error('Access denied');
    }

    // Determine bucket
    let bucket = 'case-documents';
    if (file.file_type === 'image') {
      bucket = 'case-images';
    }

    // Delete from storage
    await this.deleteFile(bucket, file.storage_path);

    // Delete from database
    await caseFileRepository.delete(fileId);
  }

  /**
   * Get all files for a case
   */
  async getCaseFiles(caseId: string, userId: string): Promise<CaseFile[]> {
    // Note: Ownership check should be done at controller level
    return caseFileRepository.findByCaseId(caseId);
  }
}

export const fileService = new FileService();

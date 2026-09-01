-- Migration: Add extracted_text column to case_files
-- This migration adds support for storing OCR-extracted text from uploaded files

-- Add extracted_text column to case_files table
ALTER TABLE case_files ADD COLUMN IF NOT EXISTS extracted_text TEXT;

-- Add index on extracted_text for faster searches (optional, for future use)
CREATE INDEX IF NOT EXISTS idx_case_files_extracted_text ON case_files USING gin(to_tsvector('english', extracted_text)) WHERE extracted_text IS NOT NULL;

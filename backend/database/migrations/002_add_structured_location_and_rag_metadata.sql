-- Migration: Add structured location and RAG metadata
-- This migration extends the cases and legal_documents tables for location-aware RAG

-- Step 1: Add new location columns to cases table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS location_country TEXT DEFAULT 'India';
ALTER TABLE cases ADD COLUMN IF NOT EXISTS location_state TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS location_city TEXT;

-- Step 2: Migrate existing location data to structured fields
UPDATE cases SET location_country = 'India' WHERE location_country IS NULL;
-- Note: Existing single location field data cannot be reliably parsed into state/city
-- Users will need to update their cases with proper location data

-- Step 3: Drop old location column (after data migration is complete)
-- ALTER TABLE cases DROP COLUMN IF EXISTS location;

-- Step 4: Recreate legal_documents table with new structure
-- Note: Since we're changing the structure significantly, we need to recreate
-- This will delete existing legal documents if any exist

DROP TABLE IF EXISTS legal_documents CASCADE;

CREATE TABLE legal_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  act_year INTEGER,
  section_number TEXT,
  section_title TEXT,
  content TEXT NOT NULL,
  category TEXT,
  jurisdiction_country TEXT DEFAULT 'India',
  jurisdiction_state TEXT,
  jurisdiction_city TEXT,
  source_url TEXT,
  source_authority TEXT,
  effective_date DATE,
  embedding vector(768),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for legal_documents
CREATE INDEX idx_legal_documents_source ON legal_documents(source_url);
CREATE INDEX idx_legal_documents_embedding ON legal_documents USING ivfflat(embedding vector_cosine_ops);
CREATE INDEX idx_legal_documents_jurisdiction_country ON legal_documents(jurisdiction_country);
CREATE INDEX idx_legal_documents_jurisdiction_state ON legal_documents(jurisdiction_state);
CREATE INDEX idx_legal_documents_category ON legal_documents(category);
CREATE INDEX idx_legal_documents_document_type ON legal_documents(document_type);

-- Step 5: Enable RLS on legal_documents
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for legal_documents (public read access for authenticated users)
CREATE POLICY "Authenticated users can view legal documents" ON legal_documents
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only service role can insert legal documents" ON legal_documents
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role can update legal documents" ON legal_documents
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Only service role can delete legal documents" ON legal_documents
  FOR DELETE USING (auth.role() = 'service_role');

-- Step 6: Add updated_at trigger for legal_documents
CREATE OR REPLACE FUNCTION update_legal_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_legal_documents_updated_at_trigger
  BEFORE UPDATE ON legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_documents_updated_at();

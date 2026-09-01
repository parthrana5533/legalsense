-- Migration: Fix embedding column dimension from 1536 to 768
-- This alters the embedding column without dropping the table or losing data

-- Drop the old index first
DROP INDEX IF EXISTS idx_legal_documents_embedding;

-- Alter the embedding column to use 768 dimensions
ALTER TABLE legal_documents ALTER COLUMN embedding TYPE vector(768);

-- Recreate the index with the correct dimension
CREATE INDEX idx_legal_documents_embedding ON legal_documents USING ivfflat(embedding vector_cosine_ops);

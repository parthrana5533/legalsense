-- Migration: Add vector search function for legal documents
-- This creates a PostgreSQL function for similarity search with jurisdiction filtering

-- Create or replace the match function for legal documents
CREATE OR REPLACE FUNCTION match_legal_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  p_jurisdiction_country text DEFAULT 'India',
  p_jurisdiction_state text DEFAULT NULL,
  p_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  document_type text,
  act_year integer,
  section_number text,
  section_title text,
  content text,
  category text,
  jurisdiction_country text,
  jurisdiction_state text,
  jurisdiction_city text,
  source_url text,
  source_authority text,
  effective_date date,
  embedding vector(768),
  metadata jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ld.id,
    ld.title,
    ld.document_type,
    ld.act_year,
    ld.section_number,
    ld.section_title,
    ld.content,
    ld.category,
    ld.jurisdiction_country,
    ld.jurisdiction_state,
    ld.jurisdiction_city,
    ld.source_url,
    ld.source_authority,
    ld.effective_date,
    ld.embedding,
    ld.metadata,
    ld.created_at,
    ld.updated_at,
    1 - (ld.embedding <=> query_embedding) as similarity
  FROM legal_documents ld
  WHERE 
    ld.jurisdiction_country = p_jurisdiction_country
    AND (p_jurisdiction_state IS NULL OR ld.jurisdiction_state IS NULL OR ld.jurisdiction_state = p_jurisdiction_state)
    AND (p_category IS NULL OR ld.category IS NULL OR ld.category = p_category)
    AND (ld.embedding <=> query_embedding) < (1 - match_threshold)
    AND ld.embedding IS NOT NULL
  ORDER BY ld.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_legal_documents TO authenticated;
GRANT EXECUTE ON FUNCTION match_legal_documents TO anon;

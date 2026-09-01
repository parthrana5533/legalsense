-- ============================================================================
-- LegalSense Database Schema for Supabase PostgreSQL
-- ============================================================================

-- Enable pgvector extension for future RAG implementation
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on auth_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- Cases Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_title TEXT NOT NULL,
  case_description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Property', 'Family', 'Employment', 'Cyber Crime', 'Consumer', 'Traffic', 'Criminal', 'Civil')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'analyzing', 'completed', 'archived')),
  severity_score INTEGER CHECK (severity_score >= 0 AND severity_score <= 10),
  ai_summary TEXT,
  location_country TEXT DEFAULT 'India',
  location_state TEXT,
  location_city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);

-- Add full-text search index for case_title and case_description
CREATE INDEX IF NOT EXISTS idx_cases_search ON cases USING gin(to_tsvector('english', case_title || ' ' || case_description));

-- ============================================================================
-- Case Files Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf', 'word', 'audio', 'video', 'other')),
  storage_path TEXT NOT NULL,
  public_url TEXT,
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_case_files_case_id ON case_files(case_id);
CREATE INDEX IF NOT EXISTS idx_case_files_file_type ON case_files(file_type);

-- ============================================================================
-- AI Conversations Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  model_used TEXT NOT NULL,
  token_usage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_case_id ON ai_conversations(case_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);

-- ============================================================================
-- Case Analyses Table (Groq AI Analysis Results)
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  legal_category TEXT NOT NULL,
  severity_score INTEGER NOT NULL CHECK (severity_score >= 0 AND severity_score <= 100),
  severity_level TEXT NOT NULL CHECK (severity_level IN ('Low', 'Medium', 'High', 'Critical')),
  possible_legal_issues JSONB NOT NULL,
  recommended_actions JSONB NOT NULL,
  important_points JSONB NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  disclaimer TEXT NOT NULL,
  raw_response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_case_analyses_case_id ON case_analyses(case_id);
CREATE INDEX IF NOT EXISTS idx_case_analyses_created_at ON case_analyses(created_at DESC);

-- ============================================================================
-- Legal Documents Table (RAG)
-- ============================================================================
CREATE TABLE IF NOT EXISTS legal_documents (
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
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_legal_documents_source ON legal_documents(source_url);
CREATE INDEX IF NOT EXISTS idx_legal_documents_embedding ON legal_documents USING ivfflat(embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_legal_documents_jurisdiction_country ON legal_documents(jurisdiction_country);
CREATE INDEX IF NOT EXISTS idx_legal_documents_jurisdiction_state ON legal_documents(jurisdiction_state);
CREATE INDEX IF NOT EXISTS idx_legal_documents_category ON legal_documents(category);
CREATE INDEX IF NOT EXISTS idx_legal_documents_document_type ON legal_documents(document_type);

-- ============================================================================
-- Notifications Table (Future)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('case_update', 'ai_analysis_complete', 'system', 'reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Cases table policies
CREATE POLICY "Users can view own cases" ON cases
  FOR SELECT USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create own cases" ON cases
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own cases" ON cases
  FOR UPDATE USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own cases" ON cases
  FOR DELETE USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_id));

-- Case files table policies
CREATE POLICY "Users can view files of own cases" ON case_files
  FOR SELECT USING (
    auth.uid() IN (
      SELECT auth_user_id FROM users 
      WHERE id = (SELECT user_id FROM cases WHERE id = case_id)
    )
  );

CREATE POLICY "Users can create files for own cases" ON case_files
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT auth_user_id FROM users 
      WHERE id = (SELECT user_id FROM cases WHERE id = case_id)
    )
  );

CREATE POLICY "Users can delete files of own cases" ON case_files
  FOR DELETE USING (
    auth.uid() IN (
      SELECT auth_user_id FROM users 
      WHERE id = (SELECT user_id FROM cases WHERE id = case_id)
    )
  );

-- AI conversations table policies
CREATE POLICY "Users can view conversations of own cases" ON ai_conversations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT auth_user_id FROM users 
      WHERE id = (SELECT user_id FROM cases WHERE id = case_id)
    )
  );

CREATE POLICY "Users can create conversations for own cases" ON ai_conversations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT auth_user_id FROM users 
      WHERE id = (SELECT user_id FROM cases WHERE id = case_id)
    )
  );

-- Case analyses table policies
CREATE POLICY "Users can view analyses of own cases" ON case_analyses
  FOR SELECT USING (
    auth.uid() IN (
      SELECT auth_user_id FROM users 
      WHERE id = (SELECT user_id FROM cases WHERE id = case_id)
    )
  );

CREATE POLICY "Users can create analyses for own cases" ON case_analyses
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT auth_user_id FROM users 
      WHERE id = (SELECT user_id FROM cases WHERE id = case_id)
    )
  );

-- Notifications table policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_id));

-- Legal documents table (public read access, restricted write)
CREATE POLICY "Anyone can view legal documents" ON legal_documents
  FOR SELECT USING (true);

-- ============================================================================
-- Functions and Triggers for Updated At
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Function to create user profile after signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Function to clean up user data on account deletion
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Notifications will be deleted via CASCADE
  -- Cases and their associated files/conversations will be deleted via CASCADE
  -- User profile will be deleted via CASCADE
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

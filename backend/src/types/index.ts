/**
 * Core type definitions for LegalSense Backend
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  auth_user_id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
}

export interface UpdateUserInput {
  full_name?: string;
  avatar_url?: string;
}

// ============================================================================
// Case Types
// ============================================================================

export type CaseCategory = 
  | 'Property'
  | 'Family'
  | 'Employment'
  | 'Cyber Crime'
  | 'Consumer'
  | 'Traffic'
  | 'Criminal'
  | 'Civil';

export type CaseStatus = 
  | 'draft'
  | 'submitted'
  | 'analyzing'
  | 'completed'
  | 'archived';

export interface LegalCase {
  id: string;
  user_id: string;
  case_title: string;
  case_description: string;
  category: CaseCategory;
  status: CaseStatus;
  severity_score: number | null;
  ai_summary: string | null;
  location_country: string | null;
  location_state: string | null;
  location_city: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCaseInput {
  user_id: string;
  case_title: string;
  case_description: string;
  category: CaseCategory;
  location_country?: string;
  location_state?: string;
  location_city?: string;
}

export interface UpdateCaseInput {
  case_title?: string;
  case_description?: string;
  category?: CaseCategory;
  status?: CaseStatus;
  severity_score?: number;
  ai_summary?: string;
  location_country?: string;
  location_state?: string;
  location_city?: string;
}

// ============================================================================
// Case File Types
// ============================================================================

export type FileType = 
  | 'image'
  | 'pdf'
  | 'word'
  | 'audio'
  | 'video'
  | 'other';

export interface CaseFile {
  id: string;
  case_id: string;
  filename: string;
  file_type: FileType;
  storage_path: string;
  public_url: string | null;
  file_size: number;
  extracted_text: string | null;
  uploaded_at: string;
}

export interface CreateCaseFileInput {
  case_id: string;
  filename: string;
  file_type: FileType;
  storage_path: string;
  public_url?: string;
  file_size: number;
  extracted_text?: string | null;
}

// ============================================================================
// AI Conversation Types
// ============================================================================

export interface AIConversation {
  id: string;
  case_id: string;
  user_message: string;
  ai_response: string;
  model_used: string;
  token_usage: number | null;
  created_at: string;
}

export interface CreateConversationInput {
  case_id: string;
  user_message: string;
  ai_response: string;
  model_used: string;
  token_usage?: number;
}

// ============================================================================
// Legal Document Types (RAG)
// ============================================================================

export interface LegalDocument {
  id: string;
  title: string;
  document_type: string;
  act_year: number | null;
  section_number: string | null;
  section_title: string | null;
  content: string;
  category: string | null;
  jurisdiction_country: string;
  jurisdiction_state: string | null;
  jurisdiction_city: string | null;
  source_url: string | null;
  source_authority: string | null;
  effective_date: string | null;
  embedding: number[] | null; // pgvector
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLegalDocumentInput {
  title: string;
  document_type: string;
  act_year?: number;
  section_number?: string;
  section_title?: string;
  content: string;
  category?: string;
  jurisdiction_country?: string;
  jurisdiction_state?: string;
  jurisdiction_city?: string;
  source_url?: string;
  source_authority?: string;
  effective_date?: string;
  metadata?: Record<string, any>;
}

export interface LegalDocumentSearchResult {
  document: LegalDocument;
  similarity: number;
}

// ============================================================================
// Notification Types (Future)
// ============================================================================

export type NotificationType = 
  | 'case_update'
  | 'ai_analysis_complete'
  | 'system'
  | 'reminder';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  full_name?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

// ============================================================================
// AI Service Types (Future)
// ============================================================================

export interface AIProvider {
  name: string;
  generateSummary(input: string): Promise<string>;
  generateResponse(input: string, context?: any): Promise<string>;
}

export interface AIResponse {
  content: string;
  model: string;
  tokensUsed: number;
  latency: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimension: number;
}

export interface VectorSearchResult {
  document: LegalDocument;
  similarity: number;
}

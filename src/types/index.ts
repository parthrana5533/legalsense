export type CaseCategory =
  | 'Property'
  | 'Family'
  | 'Employment'
  | 'Cyber Crime'
  | 'Consumer'
  | 'Traffic'
  | 'Criminal'
  | 'Civil';

export type CaseStatus = 'draft' | 'submitted' | 'analyzing' | 'completed' | 'archived';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document' | 'audio';
  url: string;
  size: number;
  uploadedAt: string;
}

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

export interface CaseFile {
  id: string;
  case_id: string;
  filename: string;
  file_type: 'image' | 'pdf' | 'word' | 'audio' | 'video' | 'other';
  storage_path: string;
  public_url: string | null;
  file_size: number;
  extracted_text: string | null;
  uploaded_at: string;
}

export interface CaseReport {
  id: string;
  caseId: string;
  summary: string;
  applicableLaws: string[];
  severityScore: number;
  evidenceChecklist: EvidenceItem[];
  recommendations: string[];
  generatedAt: string;
}

export interface EvidenceItem {
  id: string;
  label: string;
  required: boolean;
  collected: boolean;
}

export interface Feedback {
  id: string;
  userId: string;
  caseId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateCaseInput {
  case_title: string;
  category: CaseCategory;
  case_description: string;
  location_country?: string;
  location_state?: string;
  location_city?: string;
  documents?: File[];
}

export interface AuthFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  general?: string;
}

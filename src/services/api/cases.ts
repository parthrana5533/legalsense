import { fetchWithAuth } from './index';
import type { LegalCase, CaseFile, CaseCategory } from '@/types';

export interface CreateCaseInput {
  case_title: string;
  case_description: string;
  category: CaseCategory;
  location_country?: string;
  location_state?: string;
  location_city?: string;
}

export const CASE_CATEGORIES: CaseCategory[] = [
  'Property',
  'Family',
  'Employment',
  'Cyber Crime',
  'Consumer',
  'Traffic',
  'Criminal',
  'Civil',
];

// Re-export types for convenience
export type { LegalCase, CaseFile } from '@/types';

export async function getCaseHistory(page = 1, limit = 20, search?: string): Promise<{
  success: boolean;
  data: {
    data: LegalCase[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append('search', search);
  }

  const response = await fetchWithAuth(`/api/cases?${params}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch cases');
  }

  return response.json();
}

export async function getCaseById(caseId: string): Promise<LegalCase> {
  const response = await fetchWithAuth(`/api/cases/${caseId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch case');
  }

  const result = await response.json();
  return result.data;
}

export async function createCase(input: CreateCaseInput): Promise<LegalCase> {
  const response = await fetchWithAuth('/api/cases', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create case');
  }

  const result = await response.json();
  return result.data;
}

export async function updateCase(caseId: string, input: Partial<CreateCaseInput>): Promise<LegalCase> {
  const response = await fetchWithAuth(`/api/cases/${caseId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update case');
  }

  const result = await response.json();
  return result.data;
}

export async function deleteCase(caseId: string): Promise<void> {
  const response = await fetchWithAuth(`/api/cases/${caseId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete case');
  }
}

export async function submitCase(caseId: string): Promise<LegalCase> {
  const response = await fetchWithAuth(`/api/cases/${caseId}/submit`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit case');
  }

  const result = await response.json();
  return result.data;
}

export async function getCaseFiles(caseId: string): Promise<CaseFile[]> {
  const response = await fetchWithAuth(`/api/files/case/${caseId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch case files');
  }

  const result = await response.json();
  return result.data;
}

export async function uploadCaseFile(
  caseId: string,
  file: File
): Promise<CaseFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('case_id', caseId);

  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/upload`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  const result = await response.json();
  return result.data;
}

export async function deleteCaseFile(fileId: string): Promise<void> {
  const response = await fetchWithAuth(`/api/files/${fileId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete file');
  }
}

export interface ApplicableLaw {
  act_name: string;
  section: string;
  section_title: string;
  explanation: string;
  jurisdiction: string;
  source_url: string;
}

export interface Source {
  title: string;
  section: string;
  jurisdiction: string;
  source_url: string;
  relevance: string;
}

export interface AnalysisResult {
  summary: string;
  legal_issue: string;
  severity_score: number;
  severity_level: string;
  applicable_laws: ApplicableLaw[];
  legal_reasoning: string;
  evidence_required: string[];
  recommendations: string[];
  important_points: string[];
  confidence_score: number;
  disclaimer: string;
  sources: Source[];
}

export async function analyzeCase(caseId: string): Promise<AnalysisResult> {
  const response = await fetchWithAuth(`/api/cases/${caseId}/analyze`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    const errorMessage = error.error || 'Failed to analyze case';
    // Include status code in error for frontend handling
    throw new Error(`${errorMessage} (HTTP ${response.status})`);
  }

  const result = await response.json();
  return result.data;
}

export async function getCaseAnalysis(caseId: string): Promise<AnalysisResult | null> {
  const response = await fetchWithAuth(`/api/cases/${caseId}/analysis`);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch analysis');
  }

  const result = await response.json();
  return result.data;
}

export async function getCaseAnalysisHistory(caseId: string): Promise<AnalysisResult[]> {
  const response = await fetchWithAuth(`/api/cases/${caseId}/analysis/history`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch analysis history');
  }

  const result = await response.json();
  return result.data;
}

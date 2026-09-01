import type { CaseReport, EvidenceItem } from '@/types';

const MOCK_EVIDENCE: EvidenceItem[] = [
  { id: 'ev-1', label: 'Written complaint to landlord', required: true, collected: true },
  { id: 'ev-2', label: 'Lease agreement copy', required: true, collected: true },
  { id: 'ev-3', label: 'Property condition photos', required: true, collected: false },
  { id: 'ev-4', label: 'Bank transfer records', required: false, collected: true },
  { id: 'ev-5', label: 'Communication records (email/SMS)', required: true, collected: false },
];

export async function analyzeCase(caseId: string): Promise<{
  status: 'pending' | 'processing' | 'complete';
  message: string;
}> {
  await new Promise((r) => setTimeout(r, 800));
  return {
    status: 'pending',
    message: `AI analysis for case ${caseId} will be available once Gemini integration is complete.`,
  };
}

export async function generateReport(caseId: string): Promise<CaseReport> {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    id: `report-${caseId}`,
    caseId,
    summary:
      'Based on preliminary review, your case involves a potential breach of tenancy deposit regulations. The landlord may be required to return the deposit with interest within 30 days of lease termination.',
    applicableLaws: [
      'Transfer of Property Act, 1882 – Section 108',
      'Maharashtra Rent Control Act, 1999',
      'Consumer Protection Act, 2019 – Section 2(11)',
    ],
    severityScore: 6,
    evidenceChecklist: MOCK_EVIDENCE,
    recommendations: [
      'Send a formal legal notice to the landlord demanding deposit return within 15 days.',
      'File a complaint with the Rent Control Authority if no response is received.',
      'Consider mediation through the local consumer forum as an alternative dispute resolution.',
      'Gather photographic evidence of property condition at move-out.',
    ],
    generatedAt: new Date().toISOString(),
  };
}

export async function performOCR(_documentId: string): Promise<{
  text: string;
  confidence: number;
}> {
  await new Promise((r) => setTimeout(r, 600));
  return {
    text: 'OCR processing will extract text from uploaded documents once integrated.',
    confidence: 0,
  };
}

export async function queryRAG(_query: string): Promise<{
  answer: string;
  sources: string[];
}> {
  await new Promise((r) => setTimeout(r, 700));
  return {
    answer: 'RAG-powered legal knowledge retrieval will be available in a future release.',
    sources: [],
  };
}

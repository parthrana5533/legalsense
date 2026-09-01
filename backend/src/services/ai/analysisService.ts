/**
 * AI Analysis Service
 * Orchestrates the AI analysis workflow using Groq with RAG support
 */

import { groqClient } from './groqClient';
import { buildAnalysisPrompt, RetrievedSource } from './promptBuilder';
import { analysisRepository } from '../../repositories/analysisRepository';
import { caseRepository } from '../../repositories/caseRepository';
import { vectorSearchService } from './vectorSearchService';
import { caseFileRepository } from '../../repositories/caseFileRepository';

export interface AnalysisInput {
  case_id: string;
  user_id: string;
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

/**
 * Check if error is a quota/rate-limit error (429)
 */
function isQuotaExhaustedError(error: any): boolean {
  const errorMessage = error?.message || '';
  return errorMessage.includes('429') || 
         errorMessage.includes('RESOURCE_EXHAUSTED') ||
         errorMessage.includes('quota') ||
         errorMessage.includes('rate limit');
}

/**
 * Main AI Analysis Service
 * Coordinates the analysis pipeline
 * 
 * Future extension points:
 * - OCR Service: Extract text from uploaded files
 * - Document Processor: Process and clean extracted text
 * - Knowledge Base Service: Access legal knowledge base
 * - Embedding Service: Generate embeddings for RAG
 * - Vector Search Service: Search relevant legal documents
 * - RAG Service: Augment prompts with retrieved context
 */
export class AnalysisService {
  /**
   * Analyze a legal case using Groq AI with RAG
   */
  async analyzeCase(input: AnalysisInput): Promise<AnalysisResult> {
    // 1. Load case details
    const caseData = await caseRepository.findById(input.case_id);
    
    if (!caseData) {
      throw new Error('Case not found');
    }

    if (caseData.user_id !== input.user_id) {
      throw new Error('Unauthorized to analyze this case');
    }

    // 1.5. Load case files and extract evidence text
    const caseFiles = await caseFileRepository.findByCaseId(input.case_id);
    const evidenceTexts = caseFiles
      .filter(file => file.extracted_text && file.extracted_text.trim().length > 0)
      .map(file => ({
        filename: file.filename,
        text: file.extracted_text!,
        file_type: file.file_type,
      }));

    // Combine all evidence text for RAG query
    const combinedEvidenceText = evidenceTexts
      .map(e => `[Evidence from ${e.filename}]: ${e.text}`)
      .join('\n\n');

    // 2. Retrieve relevant legal documents using RAG
    let retrievedSources: RetrievedSource[] = [];
    try {
      // Build query text with evidence if available
      const queryText = combinedEvidenceText 
        ? `${caseData.case_description} ${caseData.category}\n\nEvidence:\n${combinedEvidenceText}`
        : `${caseData.case_description} ${caseData.category}`;

      const searchResults = await vectorSearchService.searchWithJurisdictionPriority({
        queryText: queryText,
        jurisdictionCountry: caseData.location_country || 'India',
        jurisdictionState: caseData.location_state || null,
        category: caseData.category,
        limit: 10,
      });

      // Combine results with priority: state-specific first, then central
      retrievedSources = [
        ...searchResults.stateSpecific,
        ...searchResults.central,
        ...searchResults.other,
      ].slice(0, 10).map(result => ({
        title: result.document.title,
        section_number: result.document.section_number || undefined,
        section_title: result.document.section_title || undefined,
        content: result.document.content,
        jurisdiction_country: result.document.jurisdiction_country,
        jurisdiction_state: result.document.jurisdiction_state || undefined,
        source_url: result.document.source_url || undefined,
        similarity: result.similarity,
      }));
    } catch (error) {
      // Check if error is due to quota exhaustion - throw specific error to prevent analysis
      if (isQuotaExhaustedError(error)) {
        console.error('RAG retrieval failed due to quota exhaustion:', error);
        throw new Error('Legal source retrieval is temporarily unavailable due to API quota limits. Please try again later. Your previous analysis will be preserved.');
      }
      
      console.error('RAG retrieval failed, proceeding without legal sources:', error);
      // Continue without retrieved sources for other errors
    }

    // 3. Build prompt with case details, evidence, and retrieved legal context
    const messages = buildAnalysisPrompt({
      case_title: caseData.case_title,
      case_description: caseData.case_description,
      category: caseData.category,
      location_country: caseData.location_country || 'India',
      location_state: caseData.location_state || undefined,
      location_city: caseData.location_city || undefined,
      evidence_texts: evidenceTexts,
    }, retrievedSources);

    // 4. Send to Groq AI
    const response = await groqClient.chatCompletion(messages);

    // 5. Parse and validate JSON response
    let analysis: AnalysisResult;
    try {
      analysis = JSON.parse(response);
      
      // Validate required fields
      if (!analysis.summary || !analysis.legal_issue || !analysis.severity_level) {
        throw new Error('Invalid analysis response: missing required fields');
      }

      // Validate severity score is within bounds
      if (analysis.severity_score < 0 || analysis.severity_score > 100) {
        analysis.severity_score = Math.max(0, Math.min(100, analysis.severity_score));
      }

      // Adjust confidence score based on RAG results
      if (retrievedSources.length === 0) {
        // Cap confidence at 0.6 if no sources were retrieved
        analysis.confidence_score = Math.min(analysis.confidence_score, 0.6);
      } else {
        // Boost confidence slightly if high-quality sources were retrieved
        const avgSimilarity = retrievedSources.reduce((sum, s) => sum + s.similarity, 0) / retrievedSources.length;
        if (avgSimilarity > 0.8) {
          analysis.confidence_score = Math.min(analysis.confidence_score + 0.1, 0.95);
        }
      }

      // Validate confidence score is within bounds
      if (analysis.confidence_score < 0 || analysis.confidence_score > 1) {
        analysis.confidence_score = Math.max(0, Math.min(1, analysis.confidence_score));
      }

      // Ensure disclaimer is present
      if (!analysis.disclaimer) {
        analysis.disclaimer = 'This AI-generated analysis is for informational purposes only and does not constitute legal advice. Laws may vary by jurisdiction and may change over time. Verify important legal matters with an advocate or authoritative legal source.';
      }

      // Ensure arrays are present
      if (!analysis.applicable_laws) analysis.applicable_laws = [];
      if (!analysis.evidence_required) analysis.evidence_required = [];
      if (!analysis.recommendations) analysis.recommendations = [];
      if (!analysis.important_points) analysis.important_points = [];
      if (!analysis.sources) analysis.sources = [];
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }

    // 6. Store analysis in database
    await analysisRepository.create({
      case_id: input.case_id,
      summary: analysis.summary,
      legal_category: analysis.legal_issue, // Map legal_issue to legal_category for backward compatibility
      severity_score: analysis.severity_score,
      severity_level: analysis.severity_level,
      possible_legal_issues: analysis.evidence_required, // Map for backward compatibility
      recommended_actions: analysis.recommendations,
      important_points: analysis.important_points,
      confidence_score: analysis.confidence_score,
      disclaimer: analysis.disclaimer,
      raw_response: {
        ...analysis,
        retrieved_sources: retrievedSources,
      },
    });

    // 7. Update case status to completed after successful analysis
    await caseRepository.updateStatus(input.case_id, 'completed');

    return analysis;
  }

  /**
   * Get the latest analysis for a case
   */
  async getLatestAnalysis(caseId: string, userId: string): Promise<AnalysisResult | null> {
    const analysis = await analysisRepository.findLatestByCaseId(caseId);
    
    if (!analysis) {
      return null;
    }

    // Verify user owns the case
    const caseData = await caseRepository.findById(caseId);
    if (!caseData || caseData.user_id !== userId) {
      throw new Error('Unauthorized to view this analysis');
    }

    // Return the raw response if it contains the new schema, otherwise map from old schema
    const rawResponse = analysis.raw_response as any;
    if (rawResponse && rawResponse.legal_issue) {
      return {
        summary: analysis.summary,
        legal_issue: rawResponse.legal_issue,
        severity_score: analysis.severity_score,
        severity_level: analysis.severity_level,
        applicable_laws: rawResponse.applicable_laws || [],
        legal_reasoning: rawResponse.legal_reasoning || '',
        evidence_required: rawResponse.evidence_required || [],
        recommendations: analysis.recommended_actions,
        important_points: analysis.important_points,
        confidence_score: analysis.confidence_score,
        disclaimer: analysis.disclaimer,
        sources: rawResponse.sources || [],
      };
    }

    // Fallback for old schema
    return {
      summary: analysis.summary,
      legal_issue: analysis.legal_category || 'Unknown',
      severity_score: analysis.severity_score,
      severity_level: analysis.severity_level,
      applicable_laws: [],
      legal_reasoning: '',
      evidence_required: analysis.possible_legal_issues || [],
      recommendations: analysis.recommended_actions,
      important_points: analysis.important_points,
      confidence_score: analysis.confidence_score,
      disclaimer: analysis.disclaimer,
      sources: [],
    };
  }

  /**
   * Get analysis history for a case
   */
  async getAnalysisHistory(caseId: string, userId: string): Promise<AnalysisResult[]> {
    // Verify user owns the case
    const caseData = await caseRepository.findById(caseId);
    if (!caseData || caseData.user_id !== userId) {
      throw new Error('Unauthorized to view this analysis history');
    }

    const analyses = await analysisRepository.findByCaseId(caseId);
    
    return analyses.map((analysis: any) => {
      const rawResponse = analysis.raw_response as any;
      if (rawResponse && rawResponse.legal_issue) {
        return {
          summary: analysis.summary,
          legal_issue: rawResponse.legal_issue,
          severity_score: analysis.severity_score,
          severity_level: analysis.severity_level,
          applicable_laws: rawResponse.applicable_laws || [],
          legal_reasoning: rawResponse.legal_reasoning || '',
          evidence_required: rawResponse.evidence_required || [],
          recommendations: analysis.recommended_actions,
          important_points: analysis.important_points,
          confidence_score: analysis.confidence_score,
          disclaimer: analysis.disclaimer,
          sources: rawResponse.sources || [],
        };
      }

      // Fallback for old schema
      return {
        summary: analysis.summary,
        legal_issue: analysis.legal_category || 'Unknown',
        severity_score: analysis.severity_score,
        severity_level: analysis.severity_level,
        applicable_laws: [],
        legal_reasoning: '',
        evidence_required: analysis.possible_legal_issues || [],
        recommendations: analysis.recommended_actions,
        important_points: analysis.important_points,
        confidence_score: analysis.confidence_score,
        disclaimer: analysis.disclaimer,
        sources: [],
      };
    });
  }
}

export const analysisService = new AnalysisService();

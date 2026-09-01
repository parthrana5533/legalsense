/**
 * Case Analysis Repository
 * Handles database operations for case analyses
 */

import { supabaseService } from '../config/supabase';

export interface CaseAnalysis {
  id: string;
  case_id: string;
  summary: string;
  legal_category: string;
  severity_score: number;
  severity_level: string;
  possible_legal_issues: string[];
  recommended_actions: string[];
  important_points: string[];
  confidence_score: number;
  disclaimer: string;
  raw_response: any;
  created_at: string;
}

export interface CreateAnalysisInput {
  case_id: string;
  summary: string;
  legal_category: string;
  severity_score: number;
  severity_level: string;
  possible_legal_issues: string[];
  recommended_actions: string[];
  important_points: string[];
  confidence_score: number;
  disclaimer: string;
  raw_response: any;
}

export class AnalysisRepository {
  /**
   * Create a new analysis
   */
  async create(input: CreateAnalysisInput): Promise<CaseAnalysis> {
    const { data, error } = await supabaseService
      .from('case_analyses')
      .insert({
        case_id: input.case_id,
        summary: input.summary,
        legal_category: input.legal_category,
        severity_score: input.severity_score,
        severity_level: input.severity_level,
        possible_legal_issues: input.possible_legal_issues,
        recommended_actions: input.recommended_actions,
        important_points: input.important_points,
        confidence_score: input.confidence_score,
        disclaimer: input.disclaimer,
        raw_response: input.raw_response,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create analysis: ${error.message}`);
    }

    return data as CaseAnalysis;
  }

  /**
   * Find the latest analysis for a case
   */
  async findLatestByCaseId(caseId: string): Promise<CaseAnalysis | null> {
    const { data, error } = await supabaseService
      .from('case_analyses')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to fetch analysis: ${error.message}`);
    }

    return data as CaseAnalysis;
  }

  /**
   * Find all analyses for a case
   */
  async findByCaseId(caseId: string): Promise<CaseAnalysis[]> {
    const { data, error } = await supabaseService
      .from('case_analyses')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch analyses: ${error.message}`);
    }

    return (data || []) as CaseAnalysis[];
  }

  /**
   * Find analysis by ID
   */
  async findById(id: string): Promise<CaseAnalysis | null> {
    const { data, error } = await supabaseService
      .from('case_analyses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch analysis: ${error.message}`);
    }

    return data as CaseAnalysis;
  }

  /**
   * Delete analysis by ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabaseService
      .from('case_analyses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete analysis: ${error.message}`);
    }
  }

  /**
   * Delete all analyses for a case
   */
  async deleteByCaseId(caseId: string): Promise<void> {
    const { error } = await supabaseService
      .from('case_analyses')
      .delete()
      .eq('case_id', caseId);

    if (error) {
      throw new Error(`Failed to delete analyses: ${error.message}`);
    }
  }
}

export const analysisRepository = new AnalysisRepository();

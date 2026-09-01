/**
 * Case Repository
 * Handles all database operations for legal cases
 */

import { supabaseService } from '../config/supabase';
import { LegalCase, CreateCaseInput, UpdateCaseInput, CaseStatus } from '../types';

export class CaseRepository {
  /**
   * Find case by ID
   */
  async findById(id: string): Promise<LegalCase | null> {
    const { data, error } = await supabaseService
      .from('cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Find all cases for a user
   */
  async findByUserId(userId: string, page = 1, limit = 20): Promise<{ data: LegalCase[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabaseService
      .from('cases')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch cases: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
    };
  }

  /**
   * Search cases by title or description
   */
  async search(userId: string, query: string, page = 1, limit = 20): Promise<{ data: LegalCase[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabaseService
      .from('cases')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .or(`case_title.ilike.%${query}%,case_description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to search cases: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
    };
  }

  /**
   * Create new case
   */
  async create(input: CreateCaseInput): Promise<LegalCase> {
    const { data, error } = await supabaseService
      .from('cases')
      .insert({
        user_id: input.user_id,
        case_title: input.case_title,
        case_description: input.case_description,
        category: input.category,
        status: 'draft' as CaseStatus,
        severity_score: null,
        ai_summary: null,
        location_country: input.location_country || 'India',
        location_state: input.location_state || null,
        location_city: input.location_city || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create case: ${error.message}`);
    }

    return data;
  }

  /**
   * Update case
   */
  async update(id: string, input: UpdateCaseInput): Promise<LegalCase> {
    const { data, error } = await supabaseService
      .from('cases')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update case: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete case
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabaseService
      .from('cases')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete case: ${error.message}`);
    }
  }

  /**
   * Update case status
   */
  async updateStatus(id: string, status: CaseStatus): Promise<LegalCase> {
    return this.update(id, { status });
  }

  /**
   * Update AI summary
   */
  async updateAISummary(id: string, aiSummary: string, severityScore: number): Promise<LegalCase> {
    return this.update(id, {
      ai_summary: aiSummary,
      severity_score: severityScore,
    });
  }
}

export const caseRepository = new CaseRepository();

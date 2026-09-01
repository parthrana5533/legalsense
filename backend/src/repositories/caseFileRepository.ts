/**
 * Case File Repository
 * Handles all database operations for case files
 */

import { supabaseService } from '../config/supabase';
import { CaseFile, CreateCaseFileInput } from '../types';

export class CaseFileRepository {
  /**
   * Find file by ID
   */
  async findById(id: string): Promise<CaseFile | null> {
    const { data, error } = await supabaseService
      .from('case_files')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Find all files for a case
   */
  async findByCaseId(caseId: string): Promise<CaseFile[]> {
    const { data, error } = await supabaseService
      .from('case_files')
      .select('*')
      .eq('case_id', caseId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch case files: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create new case file
   */
  async create(input: CreateCaseFileInput): Promise<CaseFile> {
    const { data, error } = await supabaseService
      .from('case_files')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create case file: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete file
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabaseService
      .from('case_files')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete case file: ${error.message}`);
    }
  }

  /**
   * Delete all files for a case
   */
  async deleteByCaseId(caseId: string): Promise<void> {
    const { error } = await supabaseService
      .from('case_files')
      .delete()
      .eq('case_id', caseId);

    if (error) {
      throw new Error(`Failed to delete case files: ${error.message}`);
    }
  }
}

export const caseFileRepository = new CaseFileRepository();

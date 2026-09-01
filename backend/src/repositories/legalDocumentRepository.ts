/**
 * Legal Document Repository
 * Handles database operations for legal documents with RAG support
 */

import { supabaseService } from '../config/supabase';
import { LegalDocument, CreateLegalDocumentInput, LegalDocumentSearchResult } from '../types';

export class LegalDocumentRepository {
  /**
   * Create a new legal document
   */
  async create(input: CreateLegalDocumentInput): Promise<LegalDocument> {
    const { data, error } = await supabaseService
      .from('legal_documents')
      .insert({
        title: input.title,
        document_type: input.document_type,
        act_year: input.act_year || null,
        section_number: input.section_number || null,
        section_title: input.section_title || null,
        content: input.content,
        category: input.category || null,
        jurisdiction_country: input.jurisdiction_country || 'India',
        jurisdiction_state: input.jurisdiction_state || null,
        jurisdiction_city: input.jurisdiction_city || null,
        source_url: input.source_url || null,
        source_authority: input.source_authority || null,
        effective_date: input.effective_date || null,
        embedding: null, // Will be set separately
        metadata: input.metadata || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create legal document: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a legal document
   */
  async update(id: string, updates: Partial<CreateLegalDocumentInput & { embedding?: number[] }>): Promise<LegalDocument> {
    const { data, error } = await supabaseService
      .from('legal_documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update legal document: ${error.message}`);
    }

    return data;
  }

  /**
   * Find document by ID
   */
  async findById(id: string): Promise<LegalDocument | null> {
    const { data, error } = await supabaseService
      .from('legal_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Search documents by jurisdiction and category
   */
  async findByJurisdictionAndCategory(
    jurisdictionCountry: string,
    jurisdictionState: string | null,
    category: string | null,
    limit = 20
  ): Promise<LegalDocument[]> {
    let query = supabaseService
      .from('legal_documents')
      .select('*')
      .eq('jurisdiction_country', jurisdictionCountry)
      .limit(limit);

    if (jurisdictionState) {
      query = query.eq('jurisdiction_state', jurisdictionState);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to search legal documents: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Vector similarity search using pgvector
   * Returns documents sorted by similarity score
   */
  async vectorSearch(
    queryEmbedding: number[],
    jurisdictionCountry: string,
    jurisdictionState: string | null,
    category: string | null,
    limit = 10
  ): Promise<LegalDocumentSearchResult[]> {
    // Build the query with jurisdiction and category filters
    let query = supabaseService.rpc('match_legal_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // Lowered from 0.7 to 0.5 for better recall
      match_count: limit,
      p_jurisdiction_country: jurisdictionCountry,
      p_jurisdiction_state: jurisdictionState,
      p_category: category,
    });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to perform vector search: ${error.message}`);
    }

    // Map results to include similarity score
    return (data || []).map((item: any) => ({
      document: {
        id: item.id,
        title: item.title,
        document_type: item.document_type,
        act_year: item.act_year,
        section_number: item.section_number,
        section_title: item.section_title,
        content: item.content,
        category: item.category,
        jurisdiction_country: item.jurisdiction_country,
        jurisdiction_state: item.jurisdiction_state,
        jurisdiction_city: item.jurisdiction_city,
        source_url: item.source_url,
        source_authority: item.source_authority,
        effective_date: item.effective_date,
        embedding: item.embedding,
        metadata: item.metadata,
        created_at: item.created_at,
        updated_at: item.updated_at,
      },
      similarity: item.similarity,
    }));
  }

  /**
   * Get all documents (for admin purposes)
   */
  async findAll(limit = 100, offset = 0): Promise<LegalDocument[]> {
    const { data, error } = await supabaseService
      .from('legal_documents')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch legal documents: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Delete a legal document
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabaseService
      .from('legal_documents')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete legal document: ${error.message}`);
    }
  }
}

export const legalDocumentRepository = new LegalDocumentRepository();

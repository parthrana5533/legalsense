/**
 * AI Conversation Repository
 * Handles all database operations for AI conversations
 */

import { supabaseService } from '../config/supabase';
import { AIConversation, CreateConversationInput } from '../types';

export class ConversationRepository {
  /**
   * Find conversation by ID
   */
  async findById(id: string): Promise<AIConversation | null> {
    const { data, error } = await supabaseService
      .from('ai_conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Find all conversations for a case
   */
  async findByCaseId(caseId: string): Promise<AIConversation[]> {
    const { data, error } = await supabaseService
      .from('ai_conversations')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create new conversation
   */
  async create(input: CreateConversationInput): Promise<AIConversation> {
    const { data, error } = await supabaseService
      .from('ai_conversations')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete conversation
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabaseService
      .from('ai_conversations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }

  /**
   * Delete all conversations for a case
   */
  async deleteByCaseId(caseId: string): Promise<void> {
    const { error } = await supabaseService
      .from('ai_conversations')
      .delete()
      .eq('case_id', caseId);

    if (error) {
      throw new Error(`Failed to delete conversations: ${error.message}`);
    }
  }
}

export const conversationRepository = new ConversationRepository();

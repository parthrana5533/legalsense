/**
 * AI Conversation Service
 * Business logic for AI conversation operations
 */

import { conversationRepository } from '../repositories/conversationRepository';
import { CreateConversationInput, AIConversation } from '../types';

export class ConversationService {
  /**
   * Get conversation by ID
   */
  async getConversationById(id: string): Promise<AIConversation> {
    const conversation = await conversationRepository.findById(id);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  }

  /**
   * Get all conversations for a case
   */
  async getCaseConversations(caseId: string): Promise<AIConversation[]> {
    return conversationRepository.findByCaseId(caseId);
  }

  /**
   * Create new conversation entry
   */
  async createConversation(input: CreateConversationInput): Promise<AIConversation> {
    return conversationRepository.create(input);
  }

  /**
   * Delete conversation
   */
  async deleteConversation(id: string): Promise<void> {
    await conversationRepository.delete(id);
  }

  /**
   * Delete all conversations for a case
   */
  async deleteCaseConversations(caseId: string): Promise<void> {
    await conversationRepository.deleteByCaseId(caseId);
  }
}

export const conversationService = new ConversationService();

/**
 * Case Service
 * Business logic for legal case operations
 */

import { caseRepository } from '../repositories/caseRepository';
import { caseFileRepository } from '../repositories/caseFileRepository';
import { CreateCaseInput, UpdateCaseInput, LegalCase, CaseStatus } from '../types';

export class CaseService {
  /**
   * Get case by ID with ownership check
   */
  async getCaseById(id: string, userId: string): Promise<LegalCase> {
    const caseData = await caseRepository.findById(id);

    if (!caseData) {
      throw new Error('Case not found');
    }

    if (caseData.user_id !== userId) {
      throw new Error('Access denied');
    }

    return caseData;
  }

  /**
   * Get all cases for a user with pagination
   */
  async getUserCases(
    userId: string,
    page = 1,
    limit = 20,
    search?: string
  ): Promise<{ data: LegalCase[]; total: number; page: number; limit: number; totalPages: number }> {
    let result;

    if (search) {
      result = await caseRepository.search(userId, search, page, limit);
    } else {
      result = await caseRepository.findByUserId(userId, page, limit);
    }

    const totalPages = Math.ceil(result.total / limit);

    return {
      ...result,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Create new case
   */
  async createCase(input: CreateCaseInput): Promise<LegalCase> {
    return caseRepository.create(input);
  }

  /**
   * Update case with ownership check
   */
  async updateCase(id: string, userId: string, input: UpdateCaseInput): Promise<LegalCase> {
    const existingCase = await this.getCaseById(id, userId);
    return caseRepository.update(id, input);
  }

  /**
   * Delete case with ownership check
   */
  async deleteCase(id: string, userId: string): Promise<void> {
    const existingCase = await this.getCaseById(id, userId);
    
    // Delete associated files
    await caseFileRepository.deleteByCaseId(id);
    
    // Delete case
    await caseRepository.delete(id);
  }

  /**
   * Submit case for analysis
   */
  async submitCase(id: string, userId: string): Promise<LegalCase> {
    const existingCase = await this.getCaseById(id, userId);
    
    if (existingCase.status !== 'draft') {
      throw new Error('Only draft cases can be submitted');
    }

    return caseRepository.updateStatus(id, 'submitted');
  }

  /**
   * Update case with AI analysis results
   */
  async updateAIAnalysis(
    id: string,
    aiSummary: string,
    severityScore: number
  ): Promise<LegalCase> {
    return caseRepository.updateAISummary(id, aiSummary, severityScore);
  }
}

export const caseService = new CaseService();

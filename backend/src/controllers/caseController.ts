/**
 * Case Controller
 * Handles HTTP requests for legal case operations
 */

import { Request, Response } from 'express';
import { caseService } from '../services/caseService';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, LegalCase, PaginatedResponse } from '../types';

export class CaseController {
  /**
   * GET /api/cases
   * Get all cases for current user
   */
  async getCases(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;

      const result = await caseService.getUserCases(req.user.id, page, limit, search);

      const response: ApiResponse<PaginatedResponse<LegalCase>> = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch cases',
      };
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/cases/:id
   * Get a specific case
   */
  async getCaseById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const caseData = await caseService.getCaseById(req.params.id, req.user.id);

      const response: ApiResponse<LegalCase> = {
        success: true,
        data: caseData,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch case',
      };
      res.status(error instanceof Error && error.message === 'Case not found' ? 404 : 500).json(response);
    }
  }

  /**
   * POST /api/cases
   * Create a new case
   */
  async createCase(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const caseData = await caseService.createCase({
        ...req.body,
        user_id: req.user.id,
      });

      const response: ApiResponse<LegalCase> = {
        success: true,
        data: caseData,
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create case',
      };
      res.status(400).json(response);
    }
  }

  /**
   * PATCH /api/cases/:id
   * Update a case
   */
  async updateCase(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const caseData = await caseService.updateCase(req.params.id, req.user.id, req.body);

      const response: ApiResponse<LegalCase> = {
        success: true,
        data: caseData,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update case',
      };
      res.status(error instanceof Error && error.message === 'Case not found' ? 404 : 400).json(response);
    }
  }

  /**
   * DELETE /api/cases/:id
   * Delete a case
   */
  async deleteCase(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      await caseService.deleteCase(req.params.id, req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Case deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete case',
      };
      res.status(error instanceof Error && error.message === 'Case not found' ? 404 : 500).json(response);
    }
  }

  /**
   * POST /api/cases/:id/submit
   * Submit case for analysis
   */
  async submitCase(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const caseData = await caseService.submitCase(req.params.id, req.user.id);

      const response: ApiResponse<LegalCase> = {
        success: true,
        data: caseData,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit case',
      };
      res.status(error instanceof Error && error.message === 'Case not found' ? 404 : 400).json(response);
    }
  }
}

export const caseController = new CaseController();

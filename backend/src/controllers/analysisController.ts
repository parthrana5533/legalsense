/**
 * Analysis Controller
 * Handles HTTP requests for AI case analysis
 */

import { Request, Response } from 'express';
import { analysisService } from '../services/ai/analysisService';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

export class AnalysisController {
  /**
   * POST /api/cases/:caseId/analyze
   * Analyze a case using Groq AI
   */
  async analyzeCase(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const { caseId } = req.params;

      if (!caseId) {
        const response: ApiResponse = {
          success: false,
          error: 'Case ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const result = await analysisService.analyzeCase({
        case_id: caseId,
        user_id: req.user.id,
      });

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze case';
      
      // Check if this is a quota exhaustion error - return 503 Service Unavailable
      if (errorMessage.includes('temporarily unavailable') || errorMessage.includes('API quota limits')) {
        const response: ApiResponse = {
          success: false,
          error: errorMessage,
        };
        res.status(503).json(response);
        return;
      }
      
      const response: ApiResponse = {
        success: false,
        error: errorMessage,
      };
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/cases/:caseId/analysis
   * Get the latest analysis for a case
   */
  async getLatestAnalysis(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const { caseId } = req.params;

      if (!caseId) {
        const response: ApiResponse = {
          success: false,
          error: 'Case ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const result = await analysisService.getLatestAnalysis(caseId, req.user.id);

      if (!result) {
        const response: ApiResponse = {
          success: false,
          error: 'No analysis found for this case',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analysis',
      };
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/cases/:caseId/analysis/history
   * Get analysis history for a case
   */
  async getAnalysisHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const { caseId } = req.params;

      if (!caseId) {
        const response: ApiResponse = {
          success: false,
          error: 'Case ID is required',
        };
        res.status(400).json(response);
        return;
      }

      const result = await analysisService.getAnalysisHistory(caseId, req.user.id);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analysis history',
      };
      res.status(500).json(response);
    }
  }
}

export const analysisController = new AnalysisController();

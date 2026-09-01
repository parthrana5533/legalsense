/**
 * Analysis Routes
 * Defines all AI analysis-related API endpoints
 */

import { Router } from 'express';
import { analysisController } from '../controllers/analysisController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/cases/:caseId/analyze
 * @desc    Analyze a case using Groq AI
 * @access  Private
 */
router.post(
  '/:caseId/analyze',
  authenticate,
  asyncHandler(analysisController.analyzeCase.bind(analysisController))
);

/**
 * @route   GET /api/cases/:caseId/analysis
 * @desc    Get the latest analysis for a case
 * @access  Private
 */
router.get(
  '/:caseId/analysis',
  authenticate,
  asyncHandler(analysisController.getLatestAnalysis.bind(analysisController))
);

/**
 * @route   GET /api/cases/:caseId/analysis/history
 * @desc    Get analysis history for a case
 * @access  Private
 */
router.get(
  '/:caseId/analysis/history',
  authenticate,
  asyncHandler(analysisController.getAnalysisHistory.bind(analysisController))
);

export default router;

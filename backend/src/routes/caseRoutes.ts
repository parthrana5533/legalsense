/**
 * Case Routes
 * Defines all case-related API endpoints
 */

import { Router } from 'express';
import { caseController } from '../controllers/caseController';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { createCaseSchema, updateCaseSchema, paginationSchema } from '../validators';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/cases
 * @desc    Get all cases for current user
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validateQuery(paginationSchema),
  asyncHandler(caseController.getCases.bind(caseController))
);

/**
 * @route   GET /api/cases/:id
 * @desc    Get a specific case
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(caseController.getCaseById.bind(caseController))
);

/**
 * @route   POST /api/cases
 * @desc    Create a new case
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validateBody(createCaseSchema),
  asyncHandler(caseController.createCase.bind(caseController))
);

/**
 * @route   PATCH /api/cases/:id
 * @desc    Update a case
 * @access  Private
 */
router.patch(
  '/:id',
  authenticate,
  validateBody(updateCaseSchema),
  asyncHandler(caseController.updateCase.bind(caseController))
);

/**
 * @route   DELETE /api/cases/:id
 * @desc    Delete a case
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(caseController.deleteCase.bind(caseController))
);

/**
 * @route   POST /api/cases/:id/submit
 * @desc    Submit case for analysis
 * @access  Private
 */
router.post(
  '/:id/submit',
  authenticate,
  asyncHandler(caseController.submitCase.bind(caseController))
);

export default router;

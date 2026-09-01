/**
 * User Routes
 * Defines all user-related API endpoints
 */

import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { updateUserSchema } from '../validators';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(userController.getProfile.bind(userController))
);

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch(
  '/me',
  authenticate,
  validateBody(updateUserSchema),
  asyncHandler(userController.updateProfile.bind(userController))
);

export default router;

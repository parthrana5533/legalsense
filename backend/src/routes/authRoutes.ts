/**
 * Authentication Routes
 * Defines all authentication-related API endpoints
 */

import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateBody } from '../middleware/validation';
import { authRateLimiter } from '../middleware/rateLimiter';
import { signUpSchema, signInSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/signup',
  authRateLimiter,
  validateBody(signUpSchema),
  asyncHandler(authController.signUp.bind(authController))
);

/**
 * @route   POST /api/auth/signin
 * @desc    Sign in existing user
 * @access  Public
 */
router.post(
  '/signin',
  authRateLimiter,
  validateBody(signInSchema),
  asyncHandler(authController.signIn.bind(authController))
);

/**
 * @route   POST /api/auth/signout
 * @desc    Sign out user
 * @access  Private
 */
router.post(
  '/signout',
  asyncHandler(authController.signOut.bind(authController))
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  authRateLimiter,
  validateBody(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword.bind(authController))
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  asyncHandler(authController.resetPassword.bind(authController))
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get(
  '/me',
  asyncHandler(authController.getCurrentUser.bind(authController))
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  '/account',
  asyncHandler(authController.deleteAccount.bind(authController))
);

export default router;

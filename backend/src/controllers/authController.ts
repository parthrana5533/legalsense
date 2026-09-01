/**
 * Authentication Controller
 * Handles HTTP requests for authentication operations
 */

import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, AuthResponse } from '../types';

export class AuthController {
  /**
   * POST /api/auth/signup
   * Register a new user
   */
  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { user, session } = await authService.signUp(req.body);

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            email_confirmed_at: null,
            created_at: user.created_at,
          },
          session,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign up',
      };
      res.status(400).json(response);
    }
  }

  /**
   * POST /api/auth/signin
   * Sign in existing user
   */
  async signIn(req: Request, res: Response): Promise<void> {
    try {
      const { user, session } = await authService.signIn(req.body);

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            email_confirmed_at: null,
            created_at: user.created_at,
          },
          session,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign in',
      };
      res.status(401).json(response);
    }
  }

  /**
   * POST /api/auth/signout
   * Sign out user
   */
  async signOut(req: AuthRequest, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7);

      if (token) {
        await authService.signOut(token);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Signed out successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign out',
      };
      res.status(500).json(response);
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Send password reset email
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      await authService.forgotPassword(req.body.email);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset email sent',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send reset email',
      };
      res.status(400).json(response);
    }
  }

  /**
   * POST /api/auth/reset-password
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      await authService.resetPassword(req.body.token, req.body.password);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset password',
      };
      res.status(400).json(response);
    }
  }

  /**
   * GET /api/auth/me
   * Get current user
   */
  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7);

      if (!token) {
        const response: ApiResponse = {
          success: false,
          error: 'No token provided',
        };
        res.status(401).json(response);
        return;
      }

      const user = await authService.getCurrentUser(token);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user',
      };
      res.status(500).json(response);
    }
  }

  /**
   * DELETE /api/auth/account
   * Delete user account
   */
  async deleteAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      await authService.deleteAccount(req.user.auth_user_id);

      const response: ApiResponse = {
        success: true,
        message: 'Account deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete account',
      };
      res.status(500).json(response);
    }
  }
}

export const authController = new AuthController();

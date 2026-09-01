/**
 * User Controller
 * Handles HTTP requests for user operations
 */

import { Request, Response } from 'express';
import { userRepository } from '../repositories/userRepository';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, User } from '../types';

export class UserController {
  /**
   * GET /api/users/me
   * Get current user profile
   */
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const user = await userRepository.findByAuthUserId(req.user.auth_user_id);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<User> = {
        success: true,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user profile',
      };
      res.status(500).json(response);
    }
  }

  /**
   * PATCH /api/users/me
   * Update current user profile
   */
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const userProfile = await userRepository.findByAuthUserId(req.user.auth_user_id);

      if (!userProfile) {
        const response: ApiResponse = {
          success: false,
          error: 'User not found',
        };
        res.status(404).json(response);
        return;
      }

      const updatedUser = await userRepository.update(userProfile.id, req.body);

      const response: ApiResponse<User> = {
        success: true,
        data: updatedUser,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
      res.status(500).json(response);
    }
  }
}

export const userController = new UserController();

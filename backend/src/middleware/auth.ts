/**
 * Authentication Middleware
 * Validates Supabase JWT tokens and attaches user info to request
 */

import { Request, Response, NextFunction } from 'express';
import { supabaseAnon } from '../config/supabase';
import { AppError } from './errorHandler';
import { userRepository } from '../repositories/userRepository';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    auth_user_id: string;
  };
}

/**
 * Validates Supabase JWT token from Authorization header
 * Attaches user information to request if valid
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No authorization token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

    if (error || !user) {
      throw new AppError(401, 'Invalid or expired token');
    }

    // Get user profile from our database
    let userProfile = await userRepository.findByAuthUserId(user.id);

    // If profile doesn't exist, create it (for users who signed up before profile creation was fixed)
    if (!userProfile) {
      userProfile = await userRepository.create({
        auth_user_id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null,
      });
    }

    // Attach user info from our database (not Supabase auth)
    req.user = {
      id: userProfile.id,
      email: userProfile.email,
      auth_user_id: user.id,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication - doesn't fail if no token provided
 * Still validates token if present
 */
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email || '',
          auth_user_id: user.id,
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth
    next();
  }
}

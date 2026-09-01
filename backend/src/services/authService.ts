/**
 * Authentication Service
 * Handles Supabase authentication operations
 */

import { supabaseAnon, supabaseService } from '../config/supabase';
import { userRepository } from '../repositories/userRepository';
import { SignUpInput, SignInInput, AuthResponse, User } from '../types';

export class AuthService {
  /**
   * Sign up a new user
   */
  async signUp(input: SignUpInput): Promise<{ user: User; session: AuthResponse['session'] }> {
    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.full_name,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user || !authData.session) {
      throw new Error('Failed to create user account');
    }

    // Check if user profile already exists (in case of retry)
    let userProfile = await userRepository.findByAuthUserId(authData.user.id);

    // Create user profile in our database if it doesn't exist
    if (!userProfile) {
      userProfile = await userRepository.create({
        auth_user_id: authData.user.id,
        email: input.email,
        full_name: input.full_name || undefined,
      });
    }

    return {
      user: userProfile,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_in: authData.session.expires_in || 3600,
      },
    };
  }

  /**
   * Sign in user
   */
  async signIn(input: SignInInput): Promise<{ user: User; session: AuthResponse['session'] }> {
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user || !authData.session) {
      throw new Error('Failed to sign in');
    }

    // Get or create user profile
    let userProfile = await userRepository.findByAuthUserId(authData.user.id);

    if (!userProfile) {
      userProfile = await userRepository.create({
        auth_user_id: authData.user.id,
        email: authData.user.email || '',
        full_name: authData.user.user_metadata?.full_name || null,
      });
    }

    return {
      user: userProfile,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_in: authData.session.expires_in || 3600,
      },
    };
  }

  /**
   * Sign out user
   */
  async signOut(accessToken: string): Promise<void> {
    const { error } = await supabaseAnon.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const { error } = await supabaseAnon.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get current user from token
   */
  async getCurrentUser(accessToken: string): Promise<User | null> {
    const { data: { user }, error } = await supabaseAnon.auth.getUser(accessToken);

    if (error || !user) {
      return null;
    }

    let userProfile = await userRepository.findByAuthUserId(user.id);

    // If profile doesn't exist, create it (for users who signed up before profile creation was fixed)
    if (!userProfile) {
      userProfile = await userRepository.create({
        auth_user_id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null,
      });
    }

    return userProfile;
  }

  /**
   * Delete user account
   */
  async deleteAccount(authUserId: string): Promise<void> {
    // Delete user profile from our database
    const userProfile = await userRepository.findByAuthUserId(authUserId);
    if (userProfile) {
      await userRepository.delete(userProfile.id);
    }

    // Delete auth user from Supabase
    const { error } = await supabaseService.auth.admin.deleteUser(authUserId);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export const authService = new AuthService();

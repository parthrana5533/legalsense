/**
 * User Repository
 * Handles all database operations for users
 */

import { supabaseService } from '../config/supabase';
import { User, CreateUserInput, UpdateUserInput } from '../types';

export class UserRepository {
  /**
   * Find user by auth_user_id
   */
  async findByAuthUserId(authUserId: string): Promise<User | null> {
    const { data, error } = await supabaseService
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabaseService
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseService
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Create new user
   */
  async create(input: CreateUserInput): Promise<User> {
    const { data, error } = await supabaseService
      .from('users')
      .insert({
        auth_user_id: input.auth_user_id,
        full_name: input.full_name || null,
        email: input.email,
        avatar_url: input.avatar_url || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  /**
   * Update user
   */
  async update(id: string, input: UpdateUserInput): Promise<User> {
    const { data, error } = await supabaseService
      .from('users')
      .update({
        full_name: input.full_name,
        avatar_url: input.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabaseService
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

export const userRepository = new UserRepository();

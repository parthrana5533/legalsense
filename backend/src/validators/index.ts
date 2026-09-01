/**
 * Zod Validation Schemas
 * Defines validation rules for API inputs
 */

import { z } from 'zod';

// ============================================================================
// Auth Validators
// ============================================================================

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ============================================================================
// User Validators
// ============================================================================

export const updateUserSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar_url: z.string().url('Invalid URL').optional(),
});

// ============================================================================
// Case Validators
// ============================================================================

export const caseCategories = [
  'Property',
  'Family',
  'Employment',
  'Cyber Crime',
  'Consumer',
  'Traffic',
  'Criminal',
  'Civil',
] as const;

export const caseStatuses = [
  'draft',
  'submitted',
  'analyzing',
  'completed',
  'archived',
] as const;

export const createCaseSchema = z.object({
  case_title: z.string().min(5, 'Title must be at least 5 characters'),
  case_description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(caseCategories),
  location: z.string().optional(),
});

export const updateCaseSchema = z.object({
  case_title: z.string().min(5, 'Title must be at least 5 characters').optional(),
  case_description: z.string().min(20, 'Description must be at least 20 characters').optional(),
  category: z.enum(caseCategories).optional(),
  status: z.enum(caseStatuses).optional(),
  severity_score: z.number().min(0).max(10).optional(),
  ai_summary: z.string().optional(),
  location: z.string().optional(),
});

// ============================================================================
// Case File Validators
// ============================================================================

export const fileTypes = [
  'image',
  'pdf',
  'word',
  'audio',
  'video',
  'other',
] as const;

export const createCaseFileSchema = z.object({
  case_id: z.string().uuid('Invalid case ID'),
  filename: z.string().min(1, 'Filename is required'),
  file_type: z.enum(fileTypes),
  storage_path: z.string().min(1, 'Storage path is required'),
  public_url: z.string().url('Invalid URL').optional(),
  file_size: z.number().min(0, 'File size must be positive'),
});

// ============================================================================
// AI Conversation Validators
// ============================================================================

export const createConversationSchema = z.object({
  case_id: z.string().uuid('Invalid case ID'),
  user_message: z.string().min(1, 'Message is required'),
  ai_response: z.string().min(1, 'AI response is required'),
  model_used: z.string().min(1, 'Model name is required'),
  token_usage: z.number().min(0).optional(),
});

// ============================================================================
// Pagination Validators
// ============================================================================

export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1).default(1)),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100).default(20)),
  search: z.string().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;

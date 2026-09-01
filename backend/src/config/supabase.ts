/**
 * Supabase Client Configuration
 * Creates and exports Supabase client instances
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './index';

/**
 * Supabase client with anon key (for client-side operations)
 * Used for operations that respect RLS policies
 */
export const supabaseAnon: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

/**
 * Supabase client with service role key (for server-side operations)
 * Bypasses RLS policies - use with caution
 * Only use on the server for privileged operations
 */
export const supabaseService: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

/**
 * Get appropriate client based on context
 * @param useServiceRole - If true, returns service role client (bypasses RLS)
 */
export function getSupabaseClient(useServiceRole = false): SupabaseClient {
  return useServiceRole ? supabaseService : supabaseAnon;
}

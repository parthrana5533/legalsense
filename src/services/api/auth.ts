import { auth } from '../supabase';
import { fetchWithAuth } from './index';

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  user: AuthUser;
  session: AuthSession;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResponse> {
  const response = await fetch('http://localhost:3001/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      full_name: displayName,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create account');
  }

  const result = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', result.data.session.access_token);
  localStorage.setItem('refresh_token', result.data.session.refresh_token);

  return {
    user: {
      id: result.data.user.id,
      email: result.data.user.email,
      email_confirmed_at: result.data.user.created_at,
      created_at: result.data.user.created_at,
    },
    session: result.data.session,
  };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('http://localhost:3001/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign in');
  }

  const result = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', result.data.session.access_token);
  localStorage.setItem('refresh_token', result.data.session.refresh_token);

  return {
    user: {
      id: result.data.user.id,
      email: result.data.user.email,
      email_confirmed_at: result.data.user.created_at,
      created_at: result.data.user.created_at,
    },
    session: result.data.session,
  };
}

export async function signInWithGoogle(): Promise<AuthResponse> {
  const { error } = await auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;

  // OAuth redirect will handle the rest
  throw new Error('OAuth redirect initiated');
}

export async function logOut(): Promise<void> {
  const response = await fetchWithAuth('/api/auth/signout', {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign out');
  }

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export async function resetPassword(email: string): Promise<void> {
  const { error } = await auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
}

export async function changeUserPassword(newPassword: string): Promise<void> {
  const { error } = await auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

export async function updateUserProfile(data: {
  full_name?: string;
  avatar_url?: string;
}): Promise<void> {
  const response = await fetchWithAuth('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }
}

export async function deleteUserAccount(): Promise<void> {
  const response = await fetchWithAuth('/api/auth/account', {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete account');
  }

  await logOut();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetchWithAuth('/api/auth/me');
    
    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch {
    return null;
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const response = await fetchWithAuth('/api/users/me');
    
    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch {
    return null;
  }
}

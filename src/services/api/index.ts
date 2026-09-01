/**
 * API Configuration
 * Central API base URL for backend calls
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_BASE_URL = API_URL;

/**
 * Helper function to make authenticated API calls
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
}

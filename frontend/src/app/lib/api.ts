import { supabase } from './supabaseClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Universal fetch wrapper that automatically attaches the Supabase Auth token.
 */
export async function fetchFromAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // 1. Get the current user's active session token from Supabase
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  // 2. Set up headers with authorization if the user is logged in
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // 3. Make the call to Railway
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 4. Handle errors gracefully
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
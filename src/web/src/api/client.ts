/**
 * Typed API client for the CabinConnect .NET API.
 * All data mutations go through this client — never directly to Supabase.
 * Auth token is injected from the Supabase session on every request.
 */

import { supabase } from '../auth/supabase-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL env var')
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Not authenticated')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw Object.assign(new Error(error.message ?? 'API error'), { status: response.status, body: error })
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
}

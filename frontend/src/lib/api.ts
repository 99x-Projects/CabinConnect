import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL as string || 'https://localhost:7001';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export interface CreateCabinRequest {
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
}

export interface CabinResponse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
  createdAt: string;
}

export async function createCabin(request: CreateCabinRequest): Promise<CabinResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/cabins`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.title || 'Failed to create cabin');
  }

  return response.json();
}

export async function getMyCabins(): Promise<CabinResponse[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/cabins`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cabins');
  }

  return response.json();
}

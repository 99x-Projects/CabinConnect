import { supabase } from './supabase';
import type {
  AmenityResponse,
  CabinResponse,
  RegisterCabinRequest,
  UpdateCabinRequest,
} from '../types/cabin';

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    let message = `Request failed with status ${response.status}`;
    try {
      const parsed = JSON.parse(body) as { error?: string };
      if (parsed.error) {
        message = parsed.error;
      }
    } catch {
      // body was not JSON — use the generic message
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function getAmenities(): Promise<AmenityResponse[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/amenities`, { headers });
  return handleResponse<AmenityResponse[]>(response);
}

export async function listCabins(): Promise<CabinResponse[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/cabins`, { headers });
  return handleResponse<CabinResponse[]>(response);
}

export async function getCabin(id: string): Promise<CabinResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/cabins/${id}`, { headers });
  return handleResponse<CabinResponse>(response);
}

export async function registerCabin(request: RegisterCabinRequest): Promise<CabinResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/cabins`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
  return handleResponse<CabinResponse>(response);
}

export async function updateCabin(
  id: string,
  request: UpdateCabinRequest,
): Promise<CabinResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/api/cabins/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(request),
  });
  return handleResponse<CabinResponse>(response);
}

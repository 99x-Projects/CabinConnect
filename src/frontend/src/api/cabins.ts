import type { ApiResponse, CabinDto, CreateCabinRequest } from '../types/cabin';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function getCabins(token: string): Promise<ApiResponse<CabinDto[]>> {
  const response = await fetch(`${API_BASE}/api/cabins`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { data: null, error: body?.error ?? `Request failed: ${response.status}` };
  }

  return response.json() as Promise<ApiResponse<CabinDto[]>>;
}

export type CabinStatusAction = 'Deactivate' | 'Reactivate';

export async function setCabinStatus(
  id: string,
  action: CabinStatusAction,
  token: string,
): Promise<ApiResponse<CabinDto>> {
  const response = await fetch(`${API_BASE}/api/cabins/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { data: null, error: body?.error ?? `Request failed: ${response.status}` };
  }

  return response.json() as Promise<ApiResponse<CabinDto>>;
}

export interface UpdateCabinRequest {
  name?: string;
  location?: string;
  capacity?: number;
  amenities?: Amenity[];
}

export async function updateCabin(
  id: string,
  request: UpdateCabinRequest,
  token: string,
): Promise<ApiResponse<CabinDto>> {
  const response = await fetch(`${API_BASE}/api/cabins/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { data: null, error: body?.error ?? `Request failed: ${response.status}` };
  }

  return response.json() as Promise<ApiResponse<CabinDto>>;
}

export async function getCabin(id: string, token: string): Promise<ApiResponse<CabinDto>> {
  const response = await fetch(`${API_BASE}/api/cabins/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { data: null, error: body?.error ?? `Request failed: ${response.status}` };
  }

  return response.json() as Promise<ApiResponse<CabinDto>>;
}

export async function registerCabin(
  request: CreateCabinRequest,
  token: string,
): Promise<ApiResponse<CabinDto>> {
  const response = await fetch(`${API_BASE}/api/cabins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { data: null, error: body?.error ?? `Request failed: ${response.status}` };
  }

  return response.json() as Promise<ApiResponse<CabinDto>>;
}

import { supabaseClient } from '../lib/supabase-client';

export class ApiError extends Error {
  public readonly status: number;

  public constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface HealthResponse {
  readonly status: string;
}

export interface UserMeResponse {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly role: string;
  readonly createdAt: string;
}

const apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL;

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabaseClient.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchOnce(path: string): Promise<Response> {
  return fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(await authHeaders()),
    },
  });
}

async function fetchWithJsonBodyOnce(path: string, method: 'POST' | 'PUT', body: unknown): Promise<Response> {
  return fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(await authHeaders()),
    },
    body: JSON.stringify(body),
  });
}

async function request<T>(path: string): Promise<T> {
  let response = await fetchOnce(path);

  if (response.status === 401) {
    // EC-008 / EC-J: try a single refresh+retry, then surface ApiError.
    const refreshed = await supabaseClient.auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) {
      throw new ApiError(`Unauthorized: ${path}`, 401);
    }
    response = await fetchOnce(path);
  }

  if (!response.ok) {
    throw new ApiError(
      `Request to ${path} failed with status ${String(response.status)}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export async function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health');
}

export async function getUsersMe(): Promise<UserMeResponse> {
  return request<UserMeResponse>('/api/users/me');
}

// --- CabinConnect additions ---
export interface Community {
  readonly id: string;
  readonly name: string;
  readonly region: string | null;
  readonly active: boolean;
}

export async function getCommunities(): Promise<Community[]> {
  return request<Community[]>('/api/communities');
}

export interface CabinDto {
  readonly id: string;
  readonly ownerId: string;
  readonly communityId: string;
  readonly name: string;
  readonly address: string;
  readonly capacity: number;
  readonly amenities: string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateCabinRequest {
  name: string;
  address: string;
  communityId: string;
  capacity: number;
  amenities: string[];
}

export async function createCabin(payload: CreateCabinRequest): Promise<CabinDto> {
  const response = await fetchWithJsonBodyOnce('/api/cabins', 'POST', {
    name: payload.name,
    address: payload.address,
    community_id: payload.communityId,
    capacity: payload.capacity,
    amenities: payload.amenities,
  });

  if (response.status === 401) {
    const refreshed = await supabaseClient.auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) {
      throw new ApiError('Unauthorized', 401);
    }
    return createCabin(payload);
  }

  if (response.status === 409) {
    throw new ApiError('Owner already has a registered cabin.', 409);
  }

  if (response.status === 400) {
    const data = await response.json();
    throw new ApiError(JSON.stringify(data), 400);
  }

  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.status}`, response.status);
  }

  return (await response.json()) as CabinDto;
}

export interface UpdateCabinRequest {
  name: string;
  address: string;
  communityId: string;
  capacity: number;
  amenities: string[];
}

export async function getOwnCabin(): Promise<CabinDto> {
  return request<CabinDto>('/api/cabins/me');
}

export async function updateOwnCabin(payload: UpdateCabinRequest): Promise<CabinDto> {
  let response = await fetchWithJsonBodyOnce('/api/cabins/me', 'PUT', {
    name: payload.name,
    address: payload.address,
    community_id: payload.communityId,
    capacity: payload.capacity,
    amenities: payload.amenities,
  });

  if (response.status === 401) {
    const refreshed = await supabaseClient.auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) {
      throw new ApiError('Unauthorized', 401);
    }

    response = await fetchWithJsonBodyOnce('/api/cabins/me', 'PUT', {
      name: payload.name,
      address: payload.address,
      community_id: payload.communityId,
      capacity: payload.capacity,
      amenities: payload.amenities,
    });
  }

  if (response.status === 404) {
    throw new ApiError('No cabin registered.', 404);
  }

  if (response.status === 400) {
    const data = await response.json();
    throw new ApiError(JSON.stringify(data), 400);
  }

  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.status}`, response.status);
  }

  return (await response.json()) as CabinDto;
}

export interface AccessCodeDto {
  readonly label: string;
  readonly value: string;
}

export interface EmergencyContactDto {
  readonly name: string;
  readonly phone: string;
  readonly relation: string | null;
}

export interface CabinOperationalDto {
  readonly accessCodes: AccessCodeDto[];
  readonly emergencyContacts: EmergencyContactDto[];
  readonly houseRules: string | null;
  readonly updatedAt: string;
}

export interface UpsertCabinOperationalRequest {
  accessCodes: AccessCodeDto[];
  emergencyContacts: EmergencyContactDto[];
  houseRules: string | null;
}

export async function getOwnCabinOperational(): Promise<CabinOperationalDto> {
  return request<CabinOperationalDto>('/api/cabins/me/operational');
}

export async function upsertOwnCabinOperational(
  payload: UpsertCabinOperationalRequest,
): Promise<CabinOperationalDto> {
  let response = await fetchWithJsonBodyOnce('/api/cabins/me/operational', 'PUT', {
    access_codes: payload.accessCodes,
    emergency_contacts: payload.emergencyContacts,
    house_rules: payload.houseRules,
  });

  if (response.status === 401) {
    const refreshed = await supabaseClient.auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) {
      throw new ApiError('Unauthorized', 401);
    }

    response = await fetchWithJsonBodyOnce('/api/cabins/me/operational', 'PUT', {
      access_codes: payload.accessCodes,
      emergency_contacts: payload.emergencyContacts,
      house_rules: payload.houseRules,
    });
  }

  if (response.status === 404) {
    throw new ApiError('No cabin registered.', 404);
  }

  if (response.status === 400) {
    const data = await response.json();
    throw new ApiError(JSON.stringify(data), 400);
  }

  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.status}`, response.status);
  }

  return (await response.json()) as CabinOperationalDto;
}

import { apiFetch } from './api';
import type { AmenityTag, Cabin, CabinDetail, CreateCabinPayload, KeyInfo, UpdateCabinPayload } from '@/types/cabin';

export const cabinsApi = {
  list: () => apiFetch<Cabin[]>('/api/cabins'),

  get: (id: string, reveal = false) =>
    apiFetch<CabinDetail>(`/api/cabins/${id}${reveal ? '?reveal=true' : ''}`),

  create: (payload: CreateCabinPayload) =>
    apiFetch<Cabin>('/api/cabins', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateCabinPayload) =>
    apiFetch<Cabin>(`/api/cabins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getKeyInfo: (id: string, reveal = false) =>
    apiFetch<KeyInfo>(`/api/cabins/${id}/key-info${reveal ? '?reveal=true' : ''}`),

  upsertKeyInfo: (id: string, payload: Partial<Pick<KeyInfo, 'accessCodes' | 'emergencyContacts' | 'houseRules'>>) =>
    apiFetch<KeyInfo>(`/api/cabins/${id}/key-info`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  amenityTags: () => apiFetch<AmenityTag[]>('/api/amenity-tags'),
};

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import type { Supplier, Review, SupplierCategory, SupplierSearchParams } from '@cabinconnect/shared';
import { supabase } from '../lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export function useSuppliers(params: Partial<SupplierSearchParams> = {}) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams({
        page: String(params.page ?? 1),
        limit: String(params.limit ?? 30),
        ...(params.category ? { category: params.category } : {}),
        ...(params.resort ? { resort: params.resort } : {}),
        ...(params.lat != null ? { lat: String(params.lat) } : {}),
        ...(params.lng != null ? { lng: String(params.lng) } : {}),
        ...(params.radiusKm != null ? { radiusKm: String(params.radiusKm) } : {}),
      });
      const res = await apiFetch<{ data: Supplier[]; total: number }>(`/api/v1/suppliers?${qs}`);
      setSuppliers(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, [params.category, params.resort, params.lat, params.lng]);

  useEffect(() => { load(); }, [load]);

  const nominate = async (input: Parameters<typeof apiFetch>[1] extends { body: infer B } ? B : never) => {
    const res = await apiFetch<{ data: Supplier }>('/api/v1/suppliers', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data;
  };

  return { suppliers, total, loading, error, reload: load, nominate };
}

export function useSupplierDetail(supplierId: string) {
  const [supplier, setSupplier] = useState<(Supplier & { supplier_reviews?: Review[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supplierId) return;
    setLoading(true);
    apiFetch<{ data: Supplier & { supplier_reviews?: Review[] } }>(`/api/v1/suppliers/${supplierId}`)
      .then(r => setSupplier(r.data))
      .finally(() => setLoading(false));
  }, [supplierId]);

  const addReview = async (rating: number, comment: string, jobDate?: string) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    await fetch(`${API_URL}/api/v1/suppliers/${supplierId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
      body: JSON.stringify({ rating, comment, jobDate }),
    });
    // reload to get updated rating
    const res = await apiFetch<{ data: Supplier & { supplier_reviews?: Review[] } }>(`/api/v1/suppliers/${supplierId}`);
    setSupplier(res.data);
  };

  const claim = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const userId = data.session?.user?.id;
    await fetch(`${API_URL}/api/v1/suppliers/${supplierId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}` },
      body: JSON.stringify({ userId }),
    });
    setSupplier(prev => prev ? { ...prev, claimedBy: userId } : prev);
  };

  return { supplier, loading, addReview, claim };
}

export async function requestGeoLocation(): Promise<{ lat: number; lng: number } | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  const loc = await Location.getCurrentPositionAsync({});
  return { lat: loc.coords.latitude, lng: loc.coords.longitude };
}

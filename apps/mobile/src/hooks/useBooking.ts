import { useState, useEffect, useCallback } from 'react';
import type { AvailabilityWindow, CabinBooking, CabinInvite } from '@cabinconnect/shared';
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
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `API error ${res.status}`);
  }
  return res.json();
}

export function useCabinCalendar(cabinId: string) {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [bookings, setBookings] = useState<CabinBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!cabinId) return;
    setLoading(true);
    try {
      const [wRes, bRes] = await Promise.all([
        apiFetch<{ data: AvailabilityWindow[] }>(`/api/v1/cabins/${cabinId}/availability`),
        apiFetch<{ data: CabinBooking[] }>(`/api/v1/cabins/${cabinId}/bookings`),
      ]);
      setWindows(wRes.data);
      setBookings(bRes.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [cabinId]);

  useEffect(() => { load(); }, [load]);

  const createWindow = async (input: { startDate: string; endDate: string; notes?: string }) => {
    const res = await apiFetch<{ data: AvailabilityWindow }>(`/api/v1/cabins/${cabinId}/availability`, {
      method: 'POST', body: JSON.stringify(input),
    });
    setWindows(prev => [...prev, res.data].sort((a, b) => a.startDate.localeCompare(b.startDate)));
    return res.data;
  };

  const deleteWindow = async (windowId: string) => {
    await apiFetch(`/api/v1/cabins/${cabinId}/availability/${windowId}`, { method: 'DELETE' });
    setWindows(prev => prev.filter(w => w.id !== windowId));
  };

  const createBooking = async (input: { startDate: string; endDate: string; notes?: string }) => {
    const res = await apiFetch<{ data: CabinBooking }>(`/api/v1/cabins/${cabinId}/bookings`, {
      method: 'POST', body: JSON.stringify(input),
    });
    setBookings(prev => [...prev, res.data].sort((a, b) => a.startDate.localeCompare(b.startDate)));
    return res.data;
  };

  const cancelBooking = async (bookingId: string) => {
    await apiFetch(`/api/v1/cabins/${cabinId}/bookings/${bookingId}`, { method: 'DELETE' });
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  return { windows, bookings, loading, error, reload: load, createWindow, deleteWindow, createBooking, cancelBooking };
}

export function useCabinInvites(cabinId: string) {
  const [invites, setInvites] = useState<CabinInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cabinId) return;
    setLoading(true);
    apiFetch<{ data: CabinInvite[] }>(`/api/v1/cabins/${cabinId}/invites`)
      .then(r => setInvites(r.data))
      .finally(() => setLoading(false));
  }, [cabinId]);

  useEffect(() => { load(); }, [load]);

  const invite = async (email: string) => {
    const res = await apiFetch<{ data: CabinInvite }>(`/api/v1/cabins/${cabinId}/invites`, {
      method: 'POST', body: JSON.stringify({ email }),
    });
    setInvites(prev => [res.data, ...prev]);
    return res.data;
  };

  const revoke = async (inviteId: string) => {
    await apiFetch(`/api/v1/cabins/${cabinId}/invites/${inviteId}`, { method: 'DELETE' });
    setInvites(prev => prev.filter(i => i.id !== inviteId));
  };

  return { invites, loading, reload: load, invite, revoke };
}

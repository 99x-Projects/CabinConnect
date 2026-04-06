import { useState, useEffect, useCallback } from 'react';
import type { CabinEvent, EventSearchParams, EventRSVP, RSVPStatus, CreateEventInput } from '@cabinconnect/shared';
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

export function useEvents(params: Partial<EventSearchParams> = {}) {
  const [events, setEvents] = useState<CabinEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams({
        page: String(params.page ?? 1),
        limit: String(params.limit ?? 20),
        ...(params.resort ? { resort: params.resort } : {}),
        ...(params.category ? { category: params.category } : {}),
        ...(params.from ? { from: params.from } : {}),
        ...(params.to ? { to: params.to } : {}),
      });
      const res = await apiFetch<{ data: CabinEvent[]; total: number }>(`/api/v1/events?${qs}`);
      setEvents(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [params.resort, params.category, params.from, params.to]);

  useEffect(() => { load(); }, [load]);

  const createEvent = async (input: CreateEventInput): Promise<CabinEvent> => {
    const res = await apiFetch<{ data: CabinEvent }>('/api/v1/events', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setEvents(prev => [res.data, ...prev]);
    return res.data;
  };

  return { events, total, loading, error, reload: load, createEvent };
}

export function useEventDetail(eventId: string) {
  const [event, setEvent] = useState<CabinEvent | null>(null);
  const [myRsvp, setMyRsvp] = useState<EventRSVP | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    apiFetch<{ data: CabinEvent }>(`/api/v1/events/${eventId}`)
      .then(r => setEvent(r.data))
      .finally(() => setLoading(false));
  }, [eventId]);

  const rsvp = async (status: RSVPStatus) => {
    const res = await apiFetch<{ data: EventRSVP }>(`/api/v1/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    setMyRsvp(res.data);
    setEvent(prev => prev ? { ...prev, attendeeCount: prev.attendeeCount + (status === 'going' ? 1 : 0) } : prev);
  };

  const cancelRsvp = async () => {
    await apiFetch(`/api/v1/events/${eventId}/rsvp`, { method: 'DELETE' });
    setMyRsvp(null);
  };

  return { event, myRsvp, loading, rsvp, cancelRsvp };
}

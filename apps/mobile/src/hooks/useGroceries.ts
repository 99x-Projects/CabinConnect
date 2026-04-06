import { useState, useEffect, useCallback } from 'react';
import type { GroceryOrder, OrderItem } from '@cabinconnect/shared';
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

export function useMyOrders() {
  const [orders, setOrders] = useState<GroceryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ data: GroceryOrder[] }>('/api/v1/orders/mine');
      setOrders(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createOrder = async (input: Omit<GroceryOrder, 'id' | 'userId' | 'userName' | 'status' | 'volunteerId' | 'volunteerName' | 'createdAt' | 'updatedAt'>): Promise<GroceryOrder> => {
    const res = await apiFetch<{ data: GroceryOrder }>('/api/v1/orders', { method: 'POST', body: JSON.stringify(input) });
    setOrders(prev => [res.data, ...prev]);
    return res.data;
  };

  return { orders, loading, error, reload: load, createOrder };
}

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<GroceryOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    apiFetch<{ data: GroceryOrder }>(`/api/v1/orders/${orderId}`)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const updateItems = async (items: OrderItem[]) => {
    const res = await apiFetch<{ data: GroceryOrder }>(`/api/v1/orders/${orderId}/items`, {
      method: 'PATCH', body: JSON.stringify({ items }),
    });
    setOrder(res.data);
  };

  const submit = async () => {
    const res = await apiFetch<{ data: GroceryOrder }>(`/api/v1/orders/${orderId}/submit`, { method: 'POST' });
    setOrder(res.data);
  };

  const cancel = async () => {
    await apiFetch(`/api/v1/orders/${orderId}`, { method: 'DELETE' });
    setOrder(prev => prev ? { ...prev, status: 'cancelled' } : prev);
  };

  return { order, loading, reload: load, updateItems, submit, cancel };
}

export function useVolunteerOrders() {
  const [orders, setOrders] = useState<GroceryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    apiFetch<{ data: GroceryOrder[] }>('/api/v1/orders/volunteer')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const acceptDelivery = async (orderId: string) => {
    const res = await apiFetch<{ data: GroceryOrder }>(`/api/v1/orders/${orderId}/volunteer`, { method: 'POST' });
    setOrders(prev => prev.filter(o => o.id !== orderId));
    return res.data;
  };

  const markStatus = async (orderId: string, status: 'out_for_delivery' | 'delivered') => {
    await apiFetch(`/api/v1/orders/${orderId}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    });
  };

  return { orders, loading, reload: load, acceptDelivery, markStatus };
}

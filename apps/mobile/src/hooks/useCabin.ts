import { useState, useEffect, useCallback } from 'react';
import type { Cabin, MaintenanceRecord, OwnershipCost, VisitorInstructions, CostSummary } from '@cabinconnect/shared';
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

export function useCabins() {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ data: Cabin[] }>('/api/v1/cabins');
      setCabins(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load cabins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (input: Omit<Cabin, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    const res = await apiFetch<{ data: Cabin }>('/api/v1/cabins', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setCabins(prev => [res.data, ...prev]);
    return res.data;
  };

  return { cabins, loading, error, reload: load, create };
}

export function useCabinDetail(cabinId: string) {
  const [cabin, setCabin] = useState<Cabin | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [costs, setCosts] = useState<OwnershipCost[]>([]);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [instructions, setInstructions] = useState<VisitorInstructions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cabinId) return;
    setLoading(true);
    Promise.all([
      apiFetch<{ data: Cabin }>(`/api/v1/cabins/${cabinId}`),
      apiFetch<{ data: MaintenanceRecord[] }>(`/api/v1/cabins/${cabinId}/maintenance`),
      apiFetch<{ data: OwnershipCost[]; summary: CostSummary }>(`/api/v1/cabins/${cabinId}/costs`),
      apiFetch<{ data: VisitorInstructions | null }>(`/api/v1/cabins/${cabinId}/instructions`),
    ]).then(([c, m, co, i]) => {
      setCabin(c.data);
      setMaintenance(m.data);
      setCosts(co.data);
      setCostSummary(co.summary);
      setInstructions(i.data);
    }).finally(() => setLoading(false));
  }, [cabinId]);

  const addMaintenance = async (input: Omit<MaintenanceRecord, 'id' | 'cabinId' | 'createdAt'>) => {
    const res = await apiFetch<{ data: MaintenanceRecord }>(`/api/v1/cabins/${cabinId}/maintenance`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setMaintenance(prev => [res.data, ...prev]);
  };

  const saveInstructions = async (input: Omit<VisitorInstructions, 'id' | 'cabinId' | 'updatedAt'>) => {
    const res = await apiFetch<{ data: VisitorInstructions }>(`/api/v1/cabins/${cabinId}/instructions`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    setInstructions(res.data);
  };

  return { cabin, maintenance, costs, costSummary, instructions, loading, addMaintenance, saveInstructions };
}

import { useState, useEffect, useCallback } from 'react';
import type { Tool, BorrowRequest, ToolSearchParams, ToolCategory } from '@cabinconnect/shared';
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

export function useTools(params: Partial<ToolSearchParams> = {}) {
  const [tools, setTools] = useState<Tool[]>([]);
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
      });
      const res = await apiFetch<{ data: Tool[] }>(`/api/v1/tools?${qs}`);
      setTools(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  }, [params.category, params.resort]);

  useEffect(() => { load(); }, [load]);

  const listTool = async (input: Omit<Tool, 'id' | 'ownerId' | 'ownerName' | 'available' | 'createdAt' | 'updatedAt'>): Promise<Tool> => {
    const res = await apiFetch<{ data: Tool }>('/api/v1/tools', { method: 'POST', body: JSON.stringify(input) });
    setTools(prev => [res.data, ...prev]);
    return res.data;
  };

  return { tools, loading, error, reload: load, listTool };
}

export function useToolDetail(toolId: string) {
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!toolId) return;
    setLoading(true);
    apiFetch<{ data: Tool }>(`/api/v1/tools/${toolId}`)
      .then(r => setTool(r.data))
      .finally(() => setLoading(false));
  }, [toolId]);

  const requestBorrow = async (startDate: string, endDate: string, message?: string): Promise<BorrowRequest> => {
    const res = await apiFetch<{ data: BorrowRequest }>(`/api/v1/tools/${toolId}/request`, {
      method: 'POST',
      body: JSON.stringify({ startDate, endDate, message }),
    });
    return res.data;
  };

  return { tool, loading, requestBorrow };
}

export function useMyToolActivity() {
  const [listings, setListings] = useState<Tool[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<BorrowRequest[]>([]);
  const [myRequests, setMyRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [listingsRes, myReqRes] = await Promise.all([
      apiFetch<{ data: { tools: Tool[]; requests: BorrowRequest[] } }>('/api/v1/tools/my-listings'),
      apiFetch<{ data: BorrowRequest[] }>('/api/v1/tools/my-requests'),
    ]);
    setListings(listingsRes.data.tools);
    setIncomingRequests(listingsRes.data.requests);
    setMyRequests(myReqRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateRequestStatus = async (requestId: string, status: BorrowRequest['status']) => {
    await apiFetch(`/api/v1/tools/requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setIncomingRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
  };

  return { listings, incomingRequests, myRequests, loading, reload: load, updateRequestStatus };
}

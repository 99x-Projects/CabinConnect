import { useCallback, useEffect, useState } from 'react';
import { listCabins } from '../lib/api';
import type { CabinResponse } from '../types/cabin';

export interface UseCabinsResult {
  cabins: CabinResponse[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useCabins(): UseCabinsResult {
  const [cabins, setCabins] = useState<CabinResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    listCabins()
      .then(setCabins)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load cabins.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { cabins, loading, error, reload: load };
}

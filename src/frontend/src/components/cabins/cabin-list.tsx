import { useEffect, useState } from 'react';
import { getCabins } from '../../api/cabins';
import type { CabinDto } from '../../types/cabin';

interface CabinListProps {
  token: string;
  refreshKey?: number;
  onSelectCabin?: (cabinId: string) => void;
}

export function CabinList({ token, refreshKey, onSelectCabin }: CabinListProps) {
  const [cabins, setCabins] = useState<CabinDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCabins(token).then(result => {
      if (result.error || !result.data) {
        setError(result.error ?? 'Failed to load cabins.');
      } else {
        setCabins(result.data);
      }
      setLoading(false);
    });
  }, [token, refreshKey]);

  if (loading) return <p>Loading cabins…</p>;
  if (error) return <p role="alert" style={{ color: 'red' }}>{error}</p>;
  if (cabins.length === 0) return <p>No cabins registered yet.</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {cabins.map(cabin => (
        <li key={cabin.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <strong>{cabin.name}</strong>
          {' — '}{cabin.location}
          {', '}{cabin.capacity} guests
          {' '}
          <span style={{ color: cabin.status === 'Active' ? 'green' : 'grey' }}>
            [{cabin.status}]
          </span>
          {cabin.amenities.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: '0.85em', color: '#555' }}>
              {cabin.amenities.join(', ')}
            </span>
          )}
          {onSelectCabin && (
            <button
              onClick={() => onSelectCabin(cabin.id)}
              style={{ marginLeft: 12, fontSize: '0.85em' }}
            >
              View
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

import { useEffect, useState } from 'react';
import { getCabin, setCabinStatus } from '../../api/cabins';
import type { CabinDto } from '../../types/cabin';
import { EditCabinForm } from './edit-cabin-form';

interface CabinDetailProps {
  cabinId: string;
  token: string;
  onBack: () => void;
}

export function CabinDetail({ cabinId, token, onBack }: CabinDetailProps) {
  const [cabin, setCabin] = useState<CabinDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  useEffect(() => {
    getCabin(cabinId, token).then(result => {
      if (result.error || !result.data) {
        setError(result.error ?? 'Failed to load cabin.');
      } else {
        setCabin(result.data);
      }
      setLoading(false);
    });
  }, [cabinId, token]);

  async function handleStatusToggle() {
    if (!cabin) return;
    setStatusBusy(true);
    setError(null);
    const action = cabin.status === 'Active' ? 'Deactivate' : 'Reactivate';
    const result = await setCabinStatus(cabin.id, action, token);
    if (result.error || !result.data) {
      setError(result.error ?? 'Failed to update status.');
    } else {
      setCabin(result.data);
    }
    setStatusBusy(false);
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert" style={{ color: 'red' }}>{error}</p>;
  if (!cabin) return null;

  if (editing) {
    return (
      <div>
        <h3>Edit: {cabin.name}</h3>
        <EditCabinForm
          cabin={cabin}
          token={token}
          onSuccess={updated => { setCabin(updated); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack}>← Back to list</button>
      {' '}
      <button onClick={() => setEditing(true)}>Edit</button>
      {' '}
      <button onClick={handleStatusToggle} disabled={statusBusy}>
        {statusBusy
          ? '…'
          : cabin.status === 'Active' ? 'Deactivate' : 'Reactivate'}
      </button>

      <h3>{cabin.name}</h3>
      <table>
        <tbody>
          <tr><th>Location</th><td>{cabin.location}</td></tr>
          <tr><th>Max guests</th><td>{cabin.capacity}</td></tr>
          <tr><th>Amenities</th><td>{cabin.amenities.join(', ')}</td></tr>
          <tr>
            <th>Status</th>
            <td style={{ color: cabin.status === 'Active' ? 'green' : 'grey' }}>
              {cabin.status}
            </td>
          </tr>
          <tr><th>ID</th><td><code>{cabin.id}</code></td></tr>
        </tbody>
      </table>
    </div>
  );
}

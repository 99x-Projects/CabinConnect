import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import type { Cabin } from '../types/cabin'

interface Props {
  onCreateNew: () => void
  onEdit: (cabin: Cabin) => void
}

export default function CabinListPage({ onCreateNew, onEdit }: Props) {
  const [cabins, setCabins] = useState<Cabin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    apiClient.get<Cabin[]>('/api/cabins')
      .then(setCabins)
      .catch(() => setError('Failed to load cabins.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this cabin?')) return
    setDeleting(id)
    try {
      await apiClient.delete(`/api/cabins/${id}`)
      setCabins(prev => prev.filter(c => c.id !== id))
    } catch {
      alert('Failed to delete cabin.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>My Cabins</h1>
        <button
          onClick={onCreateNew}
          style={{ padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          + Add Cabin
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && cabins.length === 0 && (
        <p style={{ color: '#666' }}>No cabins yet. Add your first cabin to get started.</p>
      )}

      {cabins.map(cabin => (
        <div
          key={cabin.id}
          style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 12 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, marginBottom: 4 }}>{cabin.name}</h2>
              <p style={{ margin: 0, color: '#555' }}>
                {cabin.address.city}, {cabin.address.country} · {cabin.community.name} · {cabin.capacity} guests
              </p>
              {cabin.amenities.length > 0 && (
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>
                  {cabin.amenities.map(a => a.name).join(', ')}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onEdit(cabin)}
                style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cabin.id)}
                disabled={deleting === cabin.id}
                style={{ padding: '6px 12px', background: '#e00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >
                {deleting === cabin.id ? '…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import { apiClient, referenceClient } from '../api/client'
import type { Cabin, Community, Amenity, CreateCabinRequest, UpdateCabinRequest } from '../types/cabin'

interface Props {
  cabin?: Cabin | null  // null/undefined = create mode; Cabin = edit mode
  onSaved: () => void
  onCancel: () => void
}

export default function CabinFormPage({ cabin, onSaved, onCancel }: Props) {
  const isEdit = cabin != null

  const [communities, setCommunities] = useState<Community[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [refLoading, setRefLoading] = useState(true)
  const [refError, setRefError] = useState<string | null>(null)

  // Form fields
  const [name, setName] = useState(cabin?.name ?? '')
  const [street, setStreet] = useState(cabin?.address.street ?? '')
  const [postalCode, setPostalCode] = useState(cabin?.address.postalCode ?? '')
  const [city, setCity] = useState(cabin?.address.city ?? '')
  const [country, setCountry] = useState(cabin?.address.country ?? 'NO')
  const [communityId, setCommunityId] = useState(cabin?.community.id ?? '')
  const [capacity, setCapacity] = useState(cabin?.capacity ?? 1)
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<string>>(
    new Set(cabin?.amenities.map(a => a.id) ?? [])
  )

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      referenceClient.getCommunities<Community[]>(),
      referenceClient.getAmenities<Amenity[]>(),
    ])
      .then(([comms, amens]) => {
        setCommunities(comms)
        setAmenities(amens)
        if (!isEdit && comms.length > 0) setCommunityId(comms[0].id)
      })
      .catch(() => setRefError('Failed to load reference data.'))
      .finally(() => setRefLoading(false))
  }, [isEdit])

  function toggleAmenity(id: string) {
    setSelectedAmenityIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)

    try {
      if (isEdit) {
        const body: UpdateCabinRequest = {
          name,
          address: { street, postalCode, city, country },
          communityId,
          capacity,
          amenityIds: [...selectedAmenityIds],
        }
        await apiClient.put<Cabin>(`/api/cabins/${cabin.id}`, body)
      } else {
        const body: CreateCabinRequest = {
          name,
          address: { street, postalCode, city, country },
          communityId,
          capacity,
          amenityIds: [...selectedAmenityIds],
        }
        await apiClient.post<Cabin>('/api/cabins', body)
      }
      onSaved()
    } catch (err: unknown) {
      const apiErr = err as { body?: { title?: string } }
      setSubmitError(apiErr?.body?.title ?? 'Failed to save cabin.')
    } finally {
      setSubmitting(false)
    }
  }

  if (refLoading) return <p style={{ padding: 24 }}>Loading…</p>
  if (refError) return <p style={{ padding: 24, color: 'red' }}>{refError}</p>

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>{isEdit ? 'Edit Cabin' : 'Add Cabin'}</h1>
      <form onSubmit={handleSubmit}>
        <Field label="Cabin name">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
            maxLength={100}
            style={inputStyle}
          />
        </Field>

        <Field label="Street address">
          <input value={street} onChange={e => setStreet(e.target.value)} required maxLength={200} style={inputStyle} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Postal code">
            <input value={postalCode} onChange={e => setPostalCode(e.target.value)} required maxLength={200} style={inputStyle} />
          </Field>
          <Field label="City">
            <input value={city} onChange={e => setCity(e.target.value)} required maxLength={200} style={inputStyle} />
          </Field>
        </div>
        <Field label="Country">
          <input value={country} onChange={e => setCountry(e.target.value)} maxLength={200} style={inputStyle} />
        </Field>

        <Field label="Community">
          <select value={communityId} onChange={e => setCommunityId(e.target.value)} required style={inputStyle}>
            {communities.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {c.region}</option>
            ))}
          </select>
        </Field>

        <Field label={`Capacity (1–50 guests)`}>
          <input
            type="number"
            min={1}
            max={50}
            value={capacity}
            onChange={e => setCapacity(parseInt(e.target.value, 10))}
            required
            style={{ ...inputStyle, width: 100 }}
          />
        </Field>

        <Field label="Amenities">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {amenities.map(a => (
              <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedAmenityIds.has(a.id)}
                  onChange={() => toggleAmenity(a.id)}
                />
                {a.name}
              </label>
            ))}
          </div>
        </Field>

        {submitError && <p style={{ color: 'red', marginBottom: 12 }}>{submitError}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '10px 20px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add Cabin'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  boxSizing: 'border-box',
  border: '1px solid #ccc',
  borderRadius: 4,
}

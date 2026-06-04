import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCabin } from '../lib/api';

export function CreateCabinPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [amenities, setAmenities] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    if (!location.trim()) {
      errors.location = 'Location is required';
    }

    const cap = parseInt(capacity, 10);
    if (!capacity || isNaN(cap)) {
      errors.capacity = 'Capacity is required';
    } else if (cap < 1) {
      errors.capacity = 'Capacity must be at least 1';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await createCabin({
        name: name.trim(),
        location: location.trim(),
        capacity: parseInt(capacity, 10),
        amenities: amenities
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a.length > 0),
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create cabin');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>Add New Cabin</h2>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fed7d7', color: '#c53030', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Cabin Name *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mountain Retreat"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
          />
          {fieldErrors.name && <span style={{ color: '#c53030', fontSize: '0.875rem' }}>{fieldErrors.name}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="location" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Location *</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Hemsedal, Norway"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
          />
          {fieldErrors.location && <span style={{ color: '#c53030', fontSize: '0.875rem' }}>{fieldErrors.location}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="capacity" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Capacity (guests) *</label>
          <input
            id="capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g. 6"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
          />
          {fieldErrors.capacity && <span style={{ color: '#c53030', fontSize: '0.875rem' }}>{fieldErrors.capacity}</span>}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="amenities" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Amenities</label>
          <input
            id="amenities"
            type="text"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            placeholder="e.g. WiFi, Sauna, Hot Tub (comma-separated)"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
          />
          <span style={{ color: '#718096', fontSize: '0.75rem' }}>Comma-separated list of amenities</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#2b6cb0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          {loading ? 'Creating...' : 'Create Cabin'}
        </button>
      </form>
    </div>
  );
}

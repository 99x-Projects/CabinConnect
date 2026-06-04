import { useState } from 'react';
import { registerCabin } from '../../api/cabins';
import { ALL_AMENITIES, type Amenity, type CreateCabinRequest } from '../../types/cabin';

interface RegisterCabinFormProps {
  token: string;
  onSuccess: (cabinId: string) => void;
}

export function RegisterCabinForm({ token, onSuccess }: RegisterCabinFormProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleAmenity(amenity: Amenity) {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedAmenities.length === 0) {
      setError('Select at least one amenity.');
      return;
    }

    const request: CreateCabinRequest = {
      name,
      location,
      capacity: Number(capacity),
      amenities: selectedAmenities,
    };

    setSubmitting(true);
    try {
      const result = await registerCabin(request, token);
      if (result.error || !result.data) {
        setError(result.error ?? 'An unexpected error occurred.');
        return;
      }
      onSuccess(result.data.id);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="cabin-name">Cabin name</label>
        <input
          id="cabin-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      <div>
        <label htmlFor="cabin-location">Location</label>
        <input
          id="cabin-location"
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
          maxLength={500}
        />
      </div>

      <div>
        <label htmlFor="cabin-capacity">Max guests</label>
        <input
          id="cabin-capacity"
          type="number"
          value={capacity}
          onChange={e => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
          required
          min={1}
        />
      </div>

      <fieldset>
        <legend>Amenities (select at least one)</legend>
        {ALL_AMENITIES.map(amenity => (
          <label key={amenity} style={{ display: 'block' }}>
            <input
              type="checkbox"
              checked={selectedAmenities.includes(amenity)}
              onChange={() => toggleAmenity(amenity)}
            />
            {' '}{amenity}
          </label>
        ))}
      </fieldset>

      {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Registering…' : 'Register cabin'}
      </button>
    </form>
  );
}

import { useState } from 'react';
import { updateCabin } from '../../api/cabins';
import { ALL_AMENITIES, type Amenity, type CabinDto } from '../../types/cabin';

interface EditCabinFormProps {
  cabin: CabinDto;
  token: string;
  onSuccess: (updated: CabinDto) => void;
  onCancel: () => void;
}

export function EditCabinForm({ cabin, token, onSuccess, onCancel }: EditCabinFormProps) {
  const [name, setName] = useState(cabin.name);
  const [location, setLocation] = useState(cabin.location);
  const [capacity, setCapacity] = useState<number>(cabin.capacity);
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>(cabin.amenities);
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

    setSubmitting(true);
    try {
      const result = await updateCabin(
        cabin.id,
        { name, location, capacity, amenities: selectedAmenities },
        token,
      );
      if (result.error || !result.data) {
        setError(result.error ?? 'An unexpected error occurred.');
        return;
      }
      onSuccess(result.data);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="edit-name">Cabin name</label>
        <input
          id="edit-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      <div>
        <label htmlFor="edit-location">Location</label>
        <input
          id="edit-location"
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
          maxLength={500}
        />
      </div>

      <div>
        <label htmlFor="edit-capacity">Max guests</label>
        <input
          id="edit-capacity"
          type="number"
          value={capacity}
          onChange={e => setCapacity(Number(e.target.value))}
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
        {submitting ? 'Saving…' : 'Save changes'}
      </button>
      {' '}
      <button type="button" onClick={onCancel} disabled={submitting}>
        Cancel
      </button>
    </form>
  );
}

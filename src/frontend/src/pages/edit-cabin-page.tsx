import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ApiError,
  getCommunities,
  getOwnCabin,
  type Community,
  updateOwnCabin,
} from '../api/client';
import { AMENITIES } from '../constants/amenities';

interface FormState {
  name: string;
  address: string;
  communityId: string;
  capacity: string;
  amenities: Set<string>;
}

function describeApiError(errorToDescribe: ApiError): string {
  if (errorToDescribe.status !== 400) {
    return errorToDescribe.message;
  }

  try {
    const parsed = JSON.parse(errorToDescribe.message) as {
      errors?: Record<string, string[]>;
    };

    const flattened = Object.values(parsed.errors ?? {}).flat();
    return flattened.length > 0 ? flattened.join(' ') : 'Validation failed.';
  } catch {
    return 'Validation failed.';
  }
}

export function EditCabinPage(): JSX.Element {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: '',
    address: '',
    communityId: '',
    capacity: '',
    amenities: new Set<string>(),
  });

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoadingInitial(true);
      setError(null);

      try {
        const [cabin, availableCommunities] = await Promise.all([
          getOwnCabin(),
          getCommunities(),
        ]);

        if (cancelled) {
          return;
        }

        setCommunities(availableCommunities);
        setForm({
          name: cabin.name,
          address: cabin.address,
          communityId: cabin.communityId,
          capacity: String(cabin.capacity),
          amenities: new Set(cabin.amenities),
        });
      } catch (loadError: unknown) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && loadError.status === 404) {
          setError('You do not have a registered cabin yet. Register one first.');
        } else {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load cabin profile.');
        }
      } finally {
        if (!cancelled) {
          setLoadingInitial(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeCommunities = useMemo(
    () => communities.filter((community) => community.active),
    [communities],
  );

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
    const { name, value } = event.target;

    if (name === 'amenities') {
      const checked = event.currentTarget instanceof HTMLInputElement ? event.currentTarget.checked : false;
      setForm((current) => {
        const nextAmenities = new Set(current.amenities);
        if (checked) {
          nextAmenities.add(value);
        } else {
          nextAmenities.delete(value);
        }

        return {
          ...current,
          amenities: nextAmenities,
        };
      });

      return;
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.address.trim() || !form.communityId || !form.capacity) {
      setError('All fields are required.');
      return;
    }

    const parsedCapacity = Number(form.capacity);
    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1 || parsedCapacity > 50) {
      setError('Capacity must be an integer between 1 and 50.');
      return;
    }

    setLoadingSave(true);

    try {
      await updateOwnCabin({
        name: form.name.trim(),
        address: form.address.trim(),
        communityId: form.communityId,
        capacity: parsedCapacity,
        amenities: Array.from(form.amenities),
      });

      setSuccess('Cabin profile saved.');
    } catch (saveError: unknown) {
      if (saveError instanceof ApiError) {
        setError(describeApiError(saveError));
      } else {
        setError('Failed to update cabin profile.');
      }
    } finally {
      setLoadingSave(false);
    }
  }

  if (loadingInitial) {
    return (
      <section className="screen form-screen">
        <div className="card form-card">
          <output>Loading cabin profile...</output>
        </div>
      </section>
    );
  }

  return (
    <section className="screen form-screen">
      <div className="card form-card">
        <div className="form-header">
          <p className="eyebrow">Cabin profile</p>
          <h1>Edit Cabin Details</h1>
          <p className="muted">Keep your listing details accurate for guests and operations.</p>
        </div>

        {error && <p className="error-banner" role="alert">{error}</p>}
        {success && <p className="success-banner">{success}</p>}

        <form onSubmit={handleSubmit} className="stack">
          <div className="field">
            <label htmlFor="edit-cabin-name">Cabin Name</label>
            <input
              id="edit-cabin-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="edit-cabin-address">Address</label>
            <input
              id="edit-cabin-address"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="edit-cabin-community">Community</label>
            <select
              id="edit-cabin-community"
              name="communityId"
              value={form.communityId}
              onChange={handleChange}
              required
            >
              <option value="">Select...</option>
              {activeCommunities.map((community) => (
                <option key={community.id} value={community.id}>{community.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="edit-cabin-capacity">Capacity (1-50)</label>
            <input
              id="edit-cabin-capacity"
              name="capacity"
              type="number"
              min={1}
              max={50}
              value={form.capacity}
              onChange={handleChange}
              required
            />
          </div>

          <fieldset className="amenities-grid">
            <legend>Amenities</legend>
            <div className="amenities-items">
              {AMENITIES.map((amenity) => (
                <label key={amenity.code} className="amenity-chip">
                  <input
                    type="checkbox"
                    name="amenities"
                    value={amenity.code}
                    checked={form.amenities.has(amenity.code)}
                    onChange={handleChange}
                  />
                  <span>{amenity.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="button-row">
            <button className="btn btn-primary" type="submit" disabled={loadingSave}>
              {loadingSave ? 'Saving...' : 'Save changes'}
            </button>
            <Link className="btn btn-ghost" to="/my-cabin">Back to dashboard</Link>
            <Link className="btn btn-ghost" to="/my-cabin/operational">Edit operational details</Link>
            {error?.includes('Register one first') && (
              <Link className="btn btn-primary" to="/my-cabin/register">Register your cabin</Link>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

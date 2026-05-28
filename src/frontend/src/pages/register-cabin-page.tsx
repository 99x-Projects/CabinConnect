import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, createCabin, getCommunities, type Community } from '../api/client';
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
    const fieldErrors = parsed.errors;
    if (!fieldErrors) {
      return 'Validation failed.';
    }

    const flattened = Object.values(fieldErrors).flat();
    if (flattened.length === 0) {
      return 'Validation failed.';
    }

    return flattened.join(' ');
  } catch {
    return 'Validation failed.';
  }
}

export function RegisterCabinPage(): JSX.Element {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [form, setForm] = useState<FormState>({
    name: '',
    address: '',
    communityId: '',
    capacity: '',
    amenities: new Set(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setCommunitiesLoading(true);
    getCommunities()
      .then((list) => setCommunities(list.filter((c) => c.active)))
      .catch(() => setError('Failed to load communities. Please refresh and try again.'))
      .finally(() => setCommunitiesLoading(false));
  }, []);

  const canSubmit =
    !loading &&
    !communitiesLoading &&
    communities.length > 0 &&
    form.name.trim().length > 0 &&
    form.address.trim().length > 0 &&
    form.communityId.length > 0 &&
    form.capacity.length > 0;

  function getCommunityPlaceholder(): string {
    if (communitiesLoading) {
      return 'Loading communities...';
    }
    if (communities.length === 0) {
      return 'No communities available';
    }
    return 'Select...';
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
    const { name, value } = e.target;
    if (name === 'amenities') {
      const checked = e.currentTarget instanceof HTMLInputElement ? e.currentTarget.checked : false;
      setForm((f) => {
        const next = new Set(f.amenities);
        if (checked) {
          next.add(value);
        } else {
          next.delete(value);
        }
        return { ...f, amenities: next };
      });
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (!form.name.trim() || !form.address.trim() || !form.communityId || !form.capacity) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    const capacity = Number(form.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
      setError('Capacity must be an integer between 1 and 50.');
      setLoading(false);
      return;
    }

    try {
      await createCabin({
        name: form.name.trim(),
        address: form.address.trim(),
        communityId: form.communityId,
        capacity,
        amenities: Array.from(form.amenities),
      });
      setSuccess(true);
      setForm({ name: '', address: '', communityId: '', capacity: '', amenities: new Set() });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(describeApiError(err));
      } else {
        setError('Failed to register cabin.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="screen form-screen">
      <div className="card form-card">
        <div className="form-header">
          <p className="eyebrow">Cabin profile</p>
          <h1>Register Your Cabin</h1>
          <p className="muted">Set up your primary listing details and amenities.</p>
        </div>

        <form onSubmit={handleSubmit} className="stack">
          <div className="field">
            <label htmlFor="cabin-name">Cabin Name</label>
            <input id="cabin-name" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="cabin-address">Address</label>
            <input id="cabin-address" name="address" value={form.address} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="cabin-community">Community</label>
            <select
              id="cabin-community"
              name="communityId"
              value={form.communityId}
              onChange={handleChange}
              required
              disabled={communitiesLoading || communities.length === 0}
            >
              <option value="">{getCommunityPlaceholder()}</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {!communitiesLoading && communities.length === 0 && (
              <p className="muted small">Ask an admin to seed communities before registering a cabin.</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="cabin-capacity">Capacity (1-50)</label>
            <input
              id="cabin-capacity"
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
              {AMENITIES.map((a) => (
                <label key={a.code} className="amenity-chip">
                  <input
                    type="checkbox"
                    name="amenities"
                    value={a.code}
                    checked={form.amenities.has(a.code)}
                    onChange={handleChange}
                  />
                  <span>{a.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p className="error-banner">{error}</p>}
          {success && <p className="success-banner">Cabin registered successfully!</p>}

          <div className="button-row">
            <button type="submit" disabled={!canSubmit} className="btn btn-primary">
              {loading ? 'Registering...' : 'Register Cabin'}
            </button>
            <Link to="/my-cabin" className="btn btn-ghost">Back to dashboard</Link>
          </div>
        </form>
      </div>
    </section>
  );
}

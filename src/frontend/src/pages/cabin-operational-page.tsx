import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ApiError,
  getOwnCabinOperational,
  type AccessCodeDto,
  type EmergencyContactDto,
  upsertOwnCabinOperational,
} from '../api/client';

interface OperationalFormState {
  accessCodes: AccessCodeDto[];
  emergencyContacts: EmergencyContactDto[];
  houseRules: string;
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

export function CabinOperationalPage(): JSX.Element {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<OperationalFormState>({
    accessCodes: [],
    emergencyContacts: [],
    houseRules: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoadingInitial(true);
      setError(null);

      try {
        const data = await getOwnCabinOperational();
        if (cancelled) {
          return;
        }

        setForm({
          accessCodes: data.accessCodes,
          emergencyContacts: data.emergencyContacts,
          houseRules: data.houseRules ?? '',
        });
      } catch (loadError: unknown) {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && loadError.status === 404) {
          setError('You do not have a registered cabin yet. Register one first.');
        } else {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load operational details.');
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

  function updateAccessCode(index: number, field: keyof AccessCodeDto, value: string): void {
    setForm((current) => {
      const next = [...current.accessCodes];
      const existing = next[index] ?? { label: '', value: '' };
      next[index] = {
        ...existing,
        [field]: value,
      };

      return {
        ...current,
        accessCodes: next,
      };
    });
  }

  function updateEmergencyContact(index: number, field: keyof EmergencyContactDto, value: string): void {
    setForm((current) => {
      const next = [...current.emergencyContacts];
      const existing = next[index] ?? { name: '', phone: '', relation: null };
      next[index] = {
        ...existing,
        [field]: field === 'relation' && value.length === 0 ? null : value,
      };

      return {
        ...current,
        emergencyContacts: next,
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoadingSave(true);

    try {
      const saved = await upsertOwnCabinOperational({
        accessCodes: form.accessCodes.map((entry) => ({
          label: entry.label.trim(),
          value: entry.value.trim(),
        })),
        emergencyContacts: form.emergencyContacts.map((entry) => ({
          name: entry.name.trim(),
          phone: entry.phone.trim(),
          relation: entry.relation?.trim() || null,
        })),
        houseRules: form.houseRules.trim().length > 0 ? form.houseRules.trim() : null,
      });

      setForm({
        accessCodes: saved.accessCodes,
        emergencyContacts: saved.emergencyContacts,
        houseRules: saved.houseRules ?? '',
      });
      setSuccess('Operational details saved.');
    } catch (saveError: unknown) {
      if (saveError instanceof ApiError) {
        setError(describeApiError(saveError));
      } else {
        setError('Failed to save operational details.');
      }
    } finally {
      setLoadingSave(false);
    }
  }

  if (loadingInitial) {
    return (
      <section className="screen form-screen">
        <div className="card form-card">
          <output>Loading operational details...</output>
        </div>
      </section>
    );
  }

  return (
    <section className="screen form-screen">
      <div className="card form-card">
        <div className="form-header">
          <p className="eyebrow">Cabin operations</p>
          <h1>Operational Details</h1>
          <p className="muted">Store sensitive operations info for owner workflows.</p>
        </div>

        {error && <p className="error-banner" role="alert">{error}</p>}
        {success && <p className="success-banner">{success}</p>}

        <form className="stack" onSubmit={handleSubmit}>
          <section className="stack subsection-card">
            <div className="button-row section-header-row">
              <h2>Access Codes</h2>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setForm((current) => ({
                    ...current,
                    accessCodes: [...current.accessCodes, { label: '', value: '' }],
                  }));
                }}
              >
                Add access code
              </button>
            </div>

            {form.accessCodes.length === 0 && <p className="muted small">No access codes configured yet.</p>}
            {form.accessCodes.map((entry, index) => (
              <div className="inline-grid" key={`access-${String(index)}`}>
                <input
                  aria-label={`Access code label ${String(index + 1)}`}
                  placeholder="Label"
                  value={entry.label}
                  onChange={(event) => {
                    updateAccessCode(index, 'label', event.target.value);
                  }}
                />
                <input
                  aria-label={`Access code value ${String(index + 1)}`}
                  placeholder="Value"
                  value={entry.value}
                  onChange={(event) => {
                    updateAccessCode(index, 'value', event.target.value);
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setForm((current) => ({
                      ...current,
                      accessCodes: current.accessCodes.filter((_, i) => i !== index),
                    }));
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </section>

          <section className="stack subsection-card">
            <div className="button-row section-header-row">
              <h2>Emergency Contacts</h2>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setForm((current) => ({
                    ...current,
                    emergencyContacts: [...current.emergencyContacts, { name: '', phone: '', relation: null }],
                  }));
                }}
              >
                Add contact
              </button>
            </div>

            {form.emergencyContacts.length === 0 && <p className="muted small">No emergency contacts configured yet.</p>}
            {form.emergencyContacts.map((entry, index) => (
              <div className="triple-grid" key={`contact-${String(index)}`}>
                <input
                  aria-label={`Emergency contact name ${String(index + 1)}`}
                  placeholder="Name"
                  value={entry.name}
                  onChange={(event) => {
                    updateEmergencyContact(index, 'name', event.target.value);
                  }}
                />
                <input
                  aria-label={`Emergency contact phone ${String(index + 1)}`}
                  placeholder="Phone"
                  value={entry.phone}
                  onChange={(event) => {
                    updateEmergencyContact(index, 'phone', event.target.value);
                  }}
                />
                <input
                  aria-label={`Emergency contact relation ${String(index + 1)}`}
                  placeholder="Relation (optional)"
                  value={entry.relation ?? ''}
                  onChange={(event) => {
                    updateEmergencyContact(index, 'relation', event.target.value);
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setForm((current) => ({
                      ...current,
                      emergencyContacts: current.emergencyContacts.filter((_, i) => i !== index),
                    }));
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </section>

          <div className="field">
            <label htmlFor="house-rules">House Rules</label>
            <textarea
              id="house-rules"
              className="textarea"
              maxLength={5000}
              value={form.houseRules}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  houseRules: event.target.value,
                }));
              }}
            />
            <p className="muted small">{String(form.houseRules.length)} / 5000</p>
          </div>

          <div className="button-row">
            <button className="btn btn-primary" type="submit" disabled={loadingSave}>
              {loadingSave ? 'Saving...' : 'Save operational details'}
            </button>
            <Link className="btn btn-ghost" to="/my-cabin">Back to dashboard</Link>
            <Link className="btn btn-ghost" to="/my-cabin/edit">Edit cabin profile</Link>
            {error?.includes('Register one first') && (
              <Link className="btn btn-primary" to="/my-cabin/register">Register your cabin</Link>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavBar } from '../components/nav-bar';
import { CabinForm } from '../components/cabin-form';
import type { CabinFormValues } from '../components/cabin-form';
import { getCabin, updateCabin } from '../lib/api';
import type { CabinResponse } from '../types/cabin';

export function EditCabinPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cabin, setCabin] = useState<CabinResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getCabin(id)
      .then(setCabin)
      .catch(() => setLoadError('Could not load cabin details.'));
  }, [id]);

  async function handleSubmit(values: CabinFormValues) {
    if (!id) return;
    setSubmitError(null);
    setSubmitting(true);

    try {
      await updateCabin(id, {
        name: values.name,
        description: values.description,
        streetAddress: values.streetAddress,
        capacity: values.capacity,
        catalogAmenityIds:
          values.selectedCatalogAmenityIds.length > 0 ? values.selectedCatalogAmenityIds : null,
        customAmenities: values.customAmenities.length > 0 ? values.customAmenities : null,
      });
      navigate('/cabins');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update cabin.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-lg mx-auto px-4 py-8">
          <p className="text-red-600 text-sm">{loadError}</p>
        </main>
      </div>
    );
  }

  if (!cabin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-lg mx-auto px-4 py-8">
          <p className="text-gray-500 text-sm">Loading…</p>
        </main>
      </div>
    );
  }

  const initialValues: CabinFormValues = {
    name: cabin.name,
    description: cabin.description,
    streetAddress: cabin.streetAddress,
    capacity: cabin.capacity,
    selectedCatalogAmenityIds: cabin.catalogAmenities.map((a) => a.id),
    customAmenityInput: '',
    customAmenities: cabin.customAmenities,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit cabin</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <CabinForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            submitting={submitting}
            error={submitError}
          />
        </div>
      </main>
    </div>
  );
}

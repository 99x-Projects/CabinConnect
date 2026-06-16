import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/nav-bar';
import { CabinForm } from '../components/cabin-form';
import type { CabinFormValues } from '../components/cabin-form';
import { registerCabin } from '../lib/api';

export function RegisterCabinPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: CabinFormValues) {
    setError(null);
    setSubmitting(true);

    try {
      await registerCabin({
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
      setError(err instanceof Error ? err.message : 'Failed to register cabin.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Register a cabin</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <CabinForm
            onSubmit={handleSubmit}
            submitLabel="Register cabin"
            submitting={submitting}
            error={error}
          />
        </div>
      </main>
    </div>
  );
}

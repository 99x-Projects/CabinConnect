import { useEffect, useState } from 'react';
import { getAmenities } from '../lib/api';
import type { AmenityResponse } from '../types/cabin';

export interface CabinFormValues {
  name: string;
  description: string;
  streetAddress: string;
  capacity: number;
  selectedCatalogAmenityIds: string[];
  customAmenityInput: string;
  customAmenities: string[];
}

interface CabinFormProps {
  initialValues?: Partial<CabinFormValues>;
  onSubmit: (values: CabinFormValues) => Promise<void>;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
}

const DEFAULT_VALUES: CabinFormValues = {
  name: '',
  description: '',
  streetAddress: '',
  capacity: 1,
  selectedCatalogAmenityIds: [],
  customAmenityInput: '',
  customAmenities: [],
};

export function CabinForm({ initialValues, onSubmit, submitLabel, submitting, error }: CabinFormProps) {
  const [values, setValues] = useState<CabinFormValues>({ ...DEFAULT_VALUES, ...initialValues });
  const [catalog, setCatalog] = useState<AmenityResponse[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    getAmenities()
      .then(setCatalog)
      .catch(() => setCatalogError('Could not load amenity catalog.'));
  }, []);

  function handleChange(field: keyof CabinFormValues, value: string | number | string[]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function toggleCatalogAmenity(id: string) {
    setValues((prev) => ({
      ...prev,
      selectedCatalogAmenityIds: prev.selectedCatalogAmenityIds.includes(id)
        ? prev.selectedCatalogAmenityIds.filter((a) => a !== id)
        : [...prev.selectedCatalogAmenityIds, id],
    }));
  }

  function addCustomAmenity() {
    const trimmed = values.customAmenityInput.trim();
    if (trimmed && !values.customAmenities.includes(trimmed)) {
      setValues((prev) => ({
        ...prev,
        customAmenities: [...prev.customAmenities, trimmed],
        customAmenityInput: '',
      }));
    }
  }

  function removeCustomAmenity(amenity: string) {
    setValues((prev) => ({
      ...prev,
      customAmenities: prev.customAmenities.filter((a) => a !== amenity),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(values);
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cabin name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={values.streetAddress}
          onChange={(e) => handleChange('streetAddress', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Max guests (1–50) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={1}
          max={50}
          value={values.capacity}
          onChange={(e) => handleChange('capacity', Number(e.target.value))}
          className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Catalog amenities</p>
        {catalogError && <p className="text-xs text-red-600 mb-2">{catalogError}</p>}
        <div className="flex flex-wrap gap-2">
          {catalog.map((amenity) => (
            <button
              key={amenity.id}
              type="button"
              onClick={() => toggleCatalogAmenity(amenity.id)}
              className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                values.selectedCatalogAmenityIds.includes(amenity.id)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
              }`}
            >
              {amenity.displayName}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Custom amenities</p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={values.customAmenityInput}
            onChange={(e) => handleChange('customAmenityInput', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomAmenity();
              }
            }}
            placeholder="e.g. Hot tub"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={addCustomAmenity}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {values.customAmenities.map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            >
              {amenity}
              <button
                type="button"
                onClick={() => removeCustomAmenity(amenity)}
                className="ml-1 text-gray-400 hover:text-gray-600"
                aria-label={`Remove ${amenity}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}

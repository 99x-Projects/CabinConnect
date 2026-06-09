import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient, ApiError } from '../lib/apiClient'

type CabinCreatedResponse = {
  id: string
  name: string
}

type FieldErrors = {
  name?: string
  description?: string
  location?: string
  baseRate?: string
  maxGuests?: string
}

export default function RegisterCabinPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [baseRate, setBaseRate] = useState('')
  const [maxGuests, setMaxGuests] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<CabinCreatedResponse | null>(null)

  const validate = (): boolean => {
    const errors: FieldErrors = {}

    if (!name.trim()) errors.name = 'Name is required.'
    if (!description.trim()) errors.description = 'Description is required.'
    if (!location.trim()) errors.location = 'Location is required.'

    const parsedRate = parseFloat(baseRate)
    if (!baseRate.trim() || isNaN(parsedRate) || parsedRate <= 0)
      errors.baseRate = 'Base rate must be a number greater than zero.'

    const parsedGuests = parseInt(maxGuests, 10)
    if (!maxGuests.trim() || isNaN(parsedGuests) || parsedGuests < 1)
      errors.maxGuests = 'Max guests must be at least 1.'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      const data = await apiClient.post<CabinCreatedResponse>('/cabins', {
        name: name.trim(),
        description: description.trim(),
        location: location.trim(),
        baseRate: parseFloat(baseRate),
        maxGuests: parseInt(maxGuests, 10),
      })
      setConfirmed(data)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login', { replace: true })
        return
      }
      setFormError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegisterAnother = () => {
    setName('')
    setDescription('')
    setLocation('')
    setBaseRate('')
    setMaxGuests('')
    setFieldErrors({})
    setFormError('')
    setConfirmed(null)
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-margin-mobile">
        <div className="w-full max-w-[440px] bg-secondary-container/30 rounded-xl p-md md:p-lg text-center">
          <div className="mb-md">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: '48px' }}
            >
              check_circle
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">
            Cabin Registered
          </h2>
          <p className="font-body-md text-body-md text-on-surface font-bold mb-xs">
            {confirmed.name}
          </p>
          <p className="font-body-sm text-body-sm text-secondary mb-lg break-all">
            ID: {confirmed.id}
          </p>
          <div className="flex flex-col gap-sm">
            <button
              type="button"
              onClick={handleRegisterAnother}
              className="w-full bg-primary text-on-primary py-md rounded-lg font-label-md text-label-md transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Register Another Cabin
            </button>
            <Link
              to="/dashboard"
              className="w-full inline-block text-center border border-outline-variant rounded-lg py-md font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 w-full z-50 h-16 flex items-center justify-between px-margin-mobile md:px-margin-desktop bg-surface border-b border-outline-variant">
        <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
          CabinConnect
        </span>
        <Link
          to="/dashboard"
          className="font-label-md text-label-md text-primary hover:opacity-80 transition-opacity"
        >
          ← Dashboard
        </Link>
      </header>

      <main className="pt-16 flex justify-center px-margin-mobile py-lg">
        <div className="w-full max-w-[520px]">
          <div className="mb-xl">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-xs">
              Register a Cabin
            </h1>
            <p className="font-body-md text-body-md text-secondary">
              Add your cabin to CabinConnect.
            </p>
          </div>

          <div
            className="bg-secondary-container/30 rounded-xl p-md md:p-lg"
            style={{ boxShadow: '0 10px 40px -10px rgba(23,49,36,0.08)' }}
          >
            <form onSubmit={handleSubmit} noValidate className="space-y-md">
              {/* Name */}
              <div>
                <label
                  htmlFor="cabin-name"
                  className="font-label-sm text-label-sm uppercase tracking-wider text-secondary block mb-xs"
                >
                  Cabin Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="cabin-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Forest Retreat"
                  className="w-full bg-surface-container-low border-b border-outline-variant py-sm px-base font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:bg-surface-container placeholder:text-outline-variant"
                />
                {fieldErrors.name && (
                  <p role="alert" className="font-body-sm text-body-sm text-error mt-xs">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="cabin-description"
                  className="font-label-sm text-label-sm uppercase tracking-wider text-secondary block mb-xs"
                >
                  Description <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="cabin-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your cabin…"
                  className="w-full bg-surface-container-low border-b border-outline-variant py-sm px-base font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:bg-surface-container placeholder:text-outline-variant resize-none"
                />
                {fieldErrors.description && (
                  <p role="alert" className="font-body-sm text-body-sm text-error mt-xs">
                    {fieldErrors.description}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="cabin-location"
                  className="font-label-sm text-label-sm uppercase tracking-wider text-secondary block mb-xs"
                >
                  Location <span aria-hidden="true">*</span>
                </label>
                <input
                  id="cabin-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Norwegian Fjords"
                  className="w-full bg-surface-container-low border-b border-outline-variant py-sm px-base font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:bg-surface-container placeholder:text-outline-variant"
                />
                {fieldErrors.location && (
                  <p role="alert" className="font-body-sm text-body-sm text-error mt-xs">
                    {fieldErrors.location}
                  </p>
                )}
              </div>

              {/* Base Rate + Max Guests */}
              <div className="grid grid-cols-2 gap-gutter">
                <div>
                  <label
                    htmlFor="base-rate"
                    className="font-label-sm text-label-sm uppercase tracking-wider text-secondary block mb-xs"
                  >
                    Base Rate / Night <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="base-rate"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    value={baseRate}
                    onChange={(e) => setBaseRate(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-surface-container-low border-b border-outline-variant py-sm px-base font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:bg-surface-container placeholder:text-outline-variant"
                  />
                  {fieldErrors.baseRate && (
                    <p role="alert" className="font-body-sm text-body-sm text-error mt-xs">
                      {fieldErrors.baseRate}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="max-guests"
                    className="font-label-sm text-label-sm uppercase tracking-wider text-secondary block mb-xs"
                  >
                    Max Guests <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="max-guests"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(e.target.value)}
                    placeholder="1"
                    className="w-full bg-surface-container-low border-b border-outline-variant py-sm px-base font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:bg-surface-container placeholder:text-outline-variant"
                  />
                  {fieldErrors.maxGuests && (
                    <p role="alert" className="font-body-sm text-body-sm text-error mt-xs">
                      {fieldErrors.maxGuests}
                    </p>
                  )}
                </div>
              </div>

              {formError && (
                <p role="alert" className="font-body-sm text-body-sm text-error">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-on-primary py-md rounded-lg font-label-md text-label-md transition-all hover:opacity-90 active:scale-[0.98] mt-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Registering…' : 'Register Cabin'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

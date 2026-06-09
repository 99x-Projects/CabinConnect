import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const ERRORS = {
  EMAIL_REQUIRED: 'Email is required.',
  EMAIL_INVALID: 'Please enter a valid email address.',
  FIRST_NAME_REQUIRED: 'First name is required.',
  PASSWORD_REQUIRED: 'Password is required.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  EMAIL_IN_USE: 'An account with this email already exists. Try logging in instead.',
  PASSWORD_TOO_WEAK: 'Password must be at least 6 characters.',
  GENERIC: 'Something went wrong. Please try again.',
  RESEND_SUCCESS: 'Confirmation email resent — check your inbox and spam folder.',
  RESEND_FAILED: 'Failed to resend confirmation email. Please try again.',
} as const

function mapSignUpError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('already registered') || lower.includes('already in use')) {
    return ERRORS.EMAIL_IN_USE
  }
  if (
    lower.includes('password') &&
    (lower.includes('short') || lower.includes('weak') || lower.includes('characters'))
  ) {
    return ERRORS.PASSWORD_TOO_WEAK
  }
  return ERRORS.GENERIC
}

function getPasswordStrength(pw: string): { label: string; checks: boolean[] } {
  return {
    label: pw.length === 0 ? '' : pw.length < 8 ? 'Weak' : pw.length < 12 ? 'Fair' : 'Strong',
    checks: [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw)],
  }
}

export default function RegisterPage() {
  const { session, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [firstNameError, setFirstNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [view, setView] = useState<'form' | 'confirmation'>('form')
  const [resendMessage, setResendMessage] = useState('')

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-body-md text-body-md text-secondary">Loading…</p>
      </div>
    )
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  const strength = getPasswordStrength(password)

  const validateForm = (): boolean => {
    let valid = true

    if (!firstName.trim()) {
      setFirstNameError(ERRORS.FIRST_NAME_REQUIRED)
      valid = false
    } else {
      setFirstNameError('')
    }

    if (!email.trim()) {
      setEmailError(ERRORS.EMAIL_REQUIRED)
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(ERRORS.EMAIL_INVALID)
      valid = false
    } else {
      setEmailError('')
    }

    if (!password) {
      setPasswordError(ERRORS.PASSWORD_REQUIRED)
      valid = false
    } else {
      setPasswordError('')
    }

    if (password !== confirmPassword) {
      setConfirmError(ERRORS.PASSWORD_MISMATCH)
      valid = false
    } else {
      setConfirmError('')
    }

    return valid
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!validateForm()) return

    // Disabled synchronously before async call begins — prevents duplicate submissions
    setSubmitting(true)

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) {
        setFormError(mapSignUpError(error.message))
      } else {
        setView('confirmation')
      }
    } catch {
      setFormError(ERRORS.GENERIC)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    setResendMessage('')
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      setResendMessage(error ? ERRORS.RESEND_FAILED : ERRORS.RESEND_SUCCESS)
    } catch {
      setResendMessage(ERRORS.RESEND_FAILED)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (view === 'confirmation') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-margin-mobile">
        <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-xl p-lg text-center" style={{ boxShadow: '0 10px 40px -10px rgba(23,49,36,0.08)' }}>
          <span className="material-symbols-outlined text-primary mb-md block" style={{ fontSize: '48px' }}>
            mark_email_read
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">
            Check your email
          </h1>
          <p className="font-body-md text-body-md text-secondary mb-xs">
            We sent a confirmation link to
          </p>
          <p className="font-body-md text-body-md text-on-surface font-bold mb-md break-all">
            {email}
          </p>
          <p className="font-body-md text-body-md text-secondary mb-lg">
            If you don't see it, check your spam folder.
          </p>
          {resendMessage && (
            <p role="status" className="font-body-sm text-body-sm text-on-surface-variant mb-md">
              {resendMessage}
            </p>
          )}
          <div className="space-y-sm">
            <button
              type="button"
              onClick={handleResend}
              className="w-full border border-outline-variant text-primary py-md rounded-lg font-label-md text-label-md hover:bg-surface-container transition-all"
            >
              Resend confirmation email
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-primary text-on-primary py-md rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    )
  }

  const strengthColors = ['text-error', 'text-on-tertiary-container', 'text-primary']
  const strengthColor = password.length === 0
    ? 'text-outline'
    : strength.checks.filter(Boolean).length === 1
      ? strengthColors[0]
      : strength.checks.filter(Boolean).length === 2
        ? strengthColors[1]
        : strengthColors[2]

  const checkLabels = ['8+ characters', 'One uppercase letter', 'One number']

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel — benefits */}
      <section className="hidden md:flex md:w-5/12 lg:w-1/2 relative overflow-hidden bg-primary items-center justify-center p-xl">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            className="w-full h-full object-cover grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7jmbIX-kzLk6oXmlYDTvsqP8j9TNOpPFMyYCdzRkc7zcPX7DH-sO6L7imBkizR6B0zf3c4mIpPnVjhdLQRI0IP2YyVklsajxAN9f-1xI3uWmjuEVbTiwb1oT4UdmQ2Ko_nThMRzOTdeLymAV0ZwknnrVQjb0o7T_dVG4dNVZhl5ELJe7N3xLHzAt8JFUwx_SxBE4Y_V08LqzvF4Ks4cNN6JU3NThlrYPLTCLg33jWiZP6NDbhUnxQpvp84AHlGHv1Qcp2TRIlNUs"
            alt=""
          />
        </div>
        <div className="relative z-10 max-w-lg text-on-primary">
          <div className="mb-lg">
            <span className="font-label-md text-label-md uppercase tracking-widest text-on-primary-container block mb-base">
              Member Benefits
            </span>
            <h1 className="font-display-lg text-display-lg mb-md leading-tight">
              Start building your cabin hub
            </h1>
          </div>
          <ul className="space-y-md">
            <li className="flex items-start gap-md">
              <span className="material-symbols-outlined mt-1 text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <div>
                <p className="font-headline-md text-headline-md mb-xs">Keep cabin knowledge in one place</p>
                <p className="font-body-md text-body-md opacity-80">
                  Store technical manuals, maintenance schedules, and water shut-off locations.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-md">
              <span className="material-symbols-outlined mt-1 text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                groups
              </span>
              <div>
                <p className="font-headline-md text-headline-md mb-xs">Share with family</p>
                <p className="font-body-md text-body-md opacity-80">
                  Invite co-owners to contribute and stay updated on the cabin's status.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-md">
              <span className="material-symbols-outlined mt-1 text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                history
              </span>
              <div>
                <p className="font-headline-md text-headline-md mb-xs">Track every improvement</p>
                <p className="font-body-md text-body-md opacity-80">
                  Log renovation history and seasonal checklists effortlessly.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Right panel — form */}
      <section className="flex-1 flex flex-col items-center justify-center px-margin-mobile md:px-xl py-lg bg-surface-bright">
        <div className="w-full max-w-[480px]">
          <div className="mb-xl text-center md:text-left">
            <div className="inline-flex items-center gap-base mb-md">
              <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
                CabinConnect
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-background">
              Create your account
            </h2>
            <p className="font-body-md text-body-md text-secondary mt-base">
              Join the community and start organising your Nordic escape.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-md">
            {/* First / last name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label
                  htmlFor="first-name"
                  className="font-label-md text-label-md text-on-surface-variant block mb-xs"
                >
                  First Name
                </label>
                <input
                  id="first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  placeholder="Bjørn"
                  className="w-full px-md py-sm bg-secondary-container border-b border-transparent focus:border-primary focus:outline-none transition-all rounded-t-lg font-body-md text-on-background placeholder:text-outline-variant"
                />
                {firstNameError && (
                  <p role="alert" className="font-body-sm text-body-sm text-error mt-xs">
                    {firstNameError}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="last-name"
                  className="font-label-md text-label-md text-on-surface-variant block mb-xs"
                >
                  Last Name
                </label>
                <input
                  id="last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  placeholder="Olsen"
                  className="w-full px-md py-sm bg-secondary-container border-b border-transparent focus:border-primary focus:outline-none transition-all rounded-t-lg font-body-md text-on-background placeholder:text-outline-variant"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="font-label-md text-label-md text-on-surface-variant block mb-xs"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="hello@nordic-retreat.com"
                className="w-full px-md py-sm bg-secondary-container border-b border-transparent focus:border-primary focus:outline-none transition-all rounded-t-lg font-body-md text-on-background placeholder:text-outline-variant"
              />
              {emailError && (
                <p role="alert" className="font-body-sm text-body-sm text-error mt-xs">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="font-label-md text-label-md text-on-surface-variant block mb-xs"
              >
                Create Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full px-md py-sm bg-secondary-container border-b border-transparent focus:border-primary focus:outline-none transition-all rounded-t-lg font-body-md text-on-background placeholder:text-outline-variant pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-on-secondary-container"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined font-body-md">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              {passwordError && (
                <p role="alert" className="font-body-sm text-body-sm text-error mt-xs">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="font-label-md text-label-md text-on-surface-variant block mb-xs"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full px-md py-sm bg-secondary-container border-b border-transparent focus:border-primary focus:outline-none transition-all rounded-t-lg font-body-md text-on-background placeholder:text-outline-variant pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-on-secondary-container"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined font-body-md">
                    {showConfirm ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              {confirmError && (
                <p role="alert" className="font-body-sm text-body-sm text-error mt-xs">
                  {confirmError}
                </p>
              )}
            </div>

            {/* Password strength indicator */}
            <div className="p-md bg-surface-container rounded-lg space-y-xs">
              <p className="font-label-sm text-label-sm text-secondary mb-base">
                PASSWORD MUST CONTAIN:
              </p>
              {checkLabels.map((label, i) => (
                <div key={label} className={`flex items-center gap-xs font-label-md text-label-md ${strength.checks[i] ? 'text-primary' : 'text-outline'}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {strength.checks[i] ? 'check' : 'circle'}
                  </span>
                  <span>{label}</span>
                </div>
              ))}
              {strength.label && (
                <p className={`font-label-sm text-label-sm mt-xs ${strengthColor}`}>
                  Strength: {strength.label}
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="space-y-sm">
              <label className="flex items-start gap-sm cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-5 w-5 rounded border-outline bg-transparent text-primary focus:ring-primary focus:ring-offset-background shrink-0"
                />
                <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-background transition-colors">
                  I agree to the{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-primary font-bold hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-primary font-bold hover:underline">
                    Privacy Policy
                  </a>.
                </span>
              </label>
              {/* Newsletter — visual only */}
              <label className="flex items-start gap-sm cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-outline bg-transparent text-primary focus:ring-primary focus:ring-offset-background shrink-0"
                />
                <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-background transition-colors">
                  Send me periodic updates about new features and cabin maintenance tips.
                </span>
              </label>
            </div>

            {formError && (
              <p role="alert" className="font-body-sm text-body-sm text-error">
                {formError}
              </p>
            )}

            <div className="pt-md">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-on-primary py-md rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating account…' : 'Create Account'}
              </button>
            </div>

            <div className="text-center pt-md">
              <p className="font-body-md text-body-md text-secondary">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline ml-xs">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

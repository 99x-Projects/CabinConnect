import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const ERRORS = {
  EMAIL_REQUIRED: 'Email is required.',
  PASSWORD_REQUIRED: 'Password is required.',
  // AC-4 and AC-5 intentionally use the same message — prevents account enumeration
  INVALID_CREDENTIALS: 'Incorrect email or password.',
  EMAIL_NOT_VERIFIED:
    'Please verify your email before logging in. Check your inbox and spam folder.',
  RATE_LIMITED: 'Too many attempts. Please wait a moment before trying again.',
  GENERIC: 'Something went wrong. Please try again.',
} as const

function mapSignInError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return ERRORS.INVALID_CREDENTIALS
  }
  if (lower.includes('email not confirmed') || lower.includes('not verified')) {
    return ERRORS.EMAIL_NOT_VERIFIED
  }
  if (lower.includes('rate') || lower.includes('too many')) {
    return ERRORS.RATE_LIMITED
  }
  return ERRORS.GENERIC
}

export default function LoginPage() {
  const { session, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const validateForm = (): boolean => {
    let valid = true
    if (!email.trim()) {
      setEmailError(ERRORS.EMAIL_REQUIRED)
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
    return valid
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!validateForm()) return
    setSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setFormError(mapSignInError(error.message))
      } else {
        navigate('/dashboard')
      }
    } catch {
      setFormError(ERRORS.GENERIC)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex-grow flex items-stretch min-h-screen">
      {/* Left column — cabin hero */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary items-center justify-center p-xl">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover scale-110"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXZwZtM_m57cN0X6UmxbGi-RVogzESBKPwIPgx5dwWlSRKwlTkcYd8Zc35c_FVyLlj7i4ZueRWtKAAeXyDReK9IWs2_0a4gEr1Nv5E25agcl3QclDRAVDjr_2ckIm5Yv1Il1bRPnOboJb5En4ezCv8EOvl--BOo_KMPeF8AAaCtmR1F3143wk0nLweGZZXA1mlMKWx87NbK92Jqic5THUQeNKwg9KrxnBXYiOdDCmVJySZbKWdWfznmLgPkqhLt_8PVPzcz32Bd_0"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 to-primary/80" />
        </div>
        <div className="relative z-10 max-w-lg text-white">
          <div className="mb-gutter">
            <span className="font-headline-md text-headline-md font-bold tracking-tight text-white/90">
              CabinConnect
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg mb-md leading-tight text-white">
            One shared place for cabin life
          </h1>
          <p className="font-body-lg text-body-lg text-white/80 max-w-sm">
            Connecting families, friends, and trusted helpers to the essence of the Nordic outdoors.
          </p>
        </div>
      </section>

      {/* Right column — form */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop py-lg bg-surface-bright">
        <div className="w-full max-w-[440px] flex flex-col">
          {/* Mobile branding */}
          <div className="lg:hidden mb-xl flex flex-col items-center">
            <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
              CabinConnect
            </h1>
          </div>

          <div className="bg-secondary-container/30 rounded-xl p-md md:p-lg" style={{ boxShadow: '0 10px 40px -10px rgba(23,49,36,0.08)' }}>
            <header className="mb-xl">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
                Welcome back
              </h2>
              <p className="font-body-md text-body-md text-secondary">
                Please enter your details to sign in.
              </p>
            </header>

            <form onSubmit={handleSubmit} noValidate className="space-y-md">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="font-label-sm text-label-sm uppercase tracking-wider text-secondary block mb-xs"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="w-full bg-surface-container-low border-b border-outline-variant py-sm px-base font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:bg-surface-container placeholder:text-outline-variant"
                />
                {emailError && (
                  <p role="alert" className="font-body-sm text-body-sm text-error mt-xs">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-xs">
                  <label
                    htmlFor="password"
                    className="font-label-sm text-label-sm uppercase tracking-wider text-secondary block"
                  >
                    Password
                  </label>
                  {/* Forgot password — placeholder only; no flow implemented yet */}
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="font-label-md text-label-md text-primary hover:opacity-80 transition-opacity"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border-b border-outline-variant py-sm px-base font-body-md text-body-md transition-all focus:outline-none focus:border-primary focus:bg-surface-container placeholder:text-outline-variant"
                />
                {passwordError && (
                  <p role="alert" className="font-body-sm text-body-sm text-error mt-xs">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Remember me — visual only */}
              <div className="flex items-center space-x-sm pt-xs">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <label
                  htmlFor="remember"
                  className="font-label-md text-label-md text-on-secondary-container select-none"
                >
                  Remember me for 30 days
                </label>
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
                {submitting ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* Social login divider */}
            <div className="relative my-xl">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface-bright px-sm font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social buttons — UI only, no auth wiring */}
            <div className="grid grid-cols-2 gap-gutter">
              <button
                type="button"
                aria-disabled="true"
                className="flex items-center justify-center space-x-sm border border-outline-variant rounded-lg py-sm px-md hover:bg-surface-container-low transition-colors"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-label-md text-label-md text-on-surface">Google</span>
              </button>
              <button
                type="button"
                aria-disabled="true"
                className="flex items-center justify-center space-x-sm border border-outline-variant rounded-lg py-sm px-md hover:bg-surface-container-low transition-colors"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05 1.61-3.2 1.61-1.12 0-1.51-.69-2.85-.69-1.33 0-1.88.68-2.84.68-1.13 0-2.24-.71-3.24-1.61-2.08-1.89-3.32-5.46-3.32-8.4 0-4.08 2.5-6.18 5.17-6.18.96 0 1.83.42 2.65.42.79 0 1.7-.42 2.76-.42 2.1 0 4.14 1.25 5.12 3.33-4.35 1.81-3.64 7.62.25 9.26zM12.03 5.4c-.03-2.18 1.8-4.04 3.9-4.1.2 2.45-2.12 4.41-3.9 4.1z" fill="currentColor" />
                </svg>
                <span className="font-label-md text-label-md text-on-surface">Apple</span>
              </button>
            </div>
          </div>

          <footer className="mt-xl text-center space-y-md">
            <p className="font-body-md text-body-md text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline transition-all">
                Create Account
              </Link>
            </p>
            <div className="flex items-center justify-center space-x-sm pt-md border-t border-outline-variant">
              <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: '18px' }}>
                lock
              </span>
              <p className="font-label-sm text-label-sm text-on-secondary-container">
                Secure access for cabin owners, families, and trusted helpers.
              </p>
            </div>
          </footer>
        </div>
      </section>
    </main>
  )
}

import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabaseClient } from '../lib/supabase-client';

type Submission =
  | { readonly kind: 'idle' }
  | { readonly kind: 'submitting' }
  | { readonly kind: 'error'; readonly message: string };

async function waitForSessionReady(maxAttempts: number, delayMs: number): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return false;
}

export function SignInPage(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submission, setSubmission] = useState<Submission>({ kind: 'idle' });
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget =
    typeof (location.state as { from?: unknown } | null)?.from === 'string'
      ? ((location.state as { from: string }).from || '/my-cabin')
      : '/my-cabin';

  useEffect(() => {
    let cancelled = false;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) {
        navigate(redirectTarget, { replace: true });
      }
    });

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      if (!cancelled && nextSession) {
        navigate(redirectTarget, { replace: true });
      }
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, [navigate, redirectTarget]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmission({ kind: 'submitting' });

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setSubmission({ kind: 'error', message: error.message });
      return;
    }

    if (data.session) {
      await supabaseClient.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    const sessionReady = await waitForSessionReady(8, 150);
    if (!sessionReady) {
      setSubmission({
        kind: 'error',
        message: 'Sign-in succeeded but no active session was found. Please try again.',
      });
      return;
    }

    navigate(redirectTarget, { replace: true });
  }

  const isSubmitting = submission.kind === 'submitting';

  return (
    <section className="screen auth-screen">
      <div className="auth-grid">
        <aside className="hero-panel" aria-hidden="true">
          <div className="hero-badge">CabinConnect</div>
          <h2 className="hero-title">Welcome back to your mountain hub</h2>
          <p className="hero-copy">
            Manage your cabin profile, keep your details current, and stay connected with your community.
          </p>
          <svg className="hero-illustration" viewBox="0 0 320 220" role="img" aria-label="Cabin in mountains">
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d9eef9" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="320" height="220" fill="url(#sky)" />
            <polygon points="40,150 120,70 190,150" fill="#aac2c7" />
            <polygon points="115,150 205,52 290,150" fill="#7ca0aa" />
            <rect x="112" y="126" width="86" height="58" fill="#b77f52" />
            <polygon points="100,126 155,88 210,126" fill="#724a33" />
            <rect x="123" y="142" width="24" height="18" fill="#f2d7b5" />
            <rect x="160" y="148" width="20" height="36" fill="#5d3a29" />
            <rect x="0" y="182" width="320" height="38" fill="#6f8b77" />
          </svg>
        </aside>

        <div className="card auth-card">
          <h1>Sign in</h1>
          <p className="muted">Use your CabinConnect account to continue.</p>

          <form onSubmit={handleSubmit} noValidate aria-label="Sign-in form" className="stack">
            <div className="field">
              <label htmlFor="signin-email">Email</label>
              <input
                id="signin-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="signin-password">Password</label>
              <input
                id="signin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {submission.kind === 'error' && (
              <p role="alert" data-testid="signin-submit-error" className="error-banner">
                {submission.message}
              </p>
            )}

            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="muted small">
            No account yet? <Link to="/sign-up">Sign up</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

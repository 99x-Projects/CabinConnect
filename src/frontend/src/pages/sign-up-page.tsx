import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabaseClient } from '../lib/supabase-client';
import { validateSignUp, type SignUpValidationErrors } from '../auth/sign-up-validation';

type Submission =
  | { readonly kind: 'idle' }
  | { readonly kind: 'submitting' }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'success' };

export function SignUpPage(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<SignUpValidationErrors>({});
  const [submission, setSubmission] = useState<Submission>({ kind: 'idle' });
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const errors = validateSignUp({ email, password, displayName });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmission({ kind: 'submitting' });
    const { error } = await supabaseClient.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim() },
      },
    });

    if (error) {
      setSubmission({ kind: 'error', message: error.message });
      return;
    }

    setSubmission({ kind: 'success' });
    navigate('/my-cabin', { replace: true });
  }

  const isSubmitting = submission.kind === 'submitting';

  return (
    <section className="screen auth-screen">
      <div className="auth-grid">
        <aside className="hero-panel" aria-hidden="true">
          <div className="hero-badge">CabinConnect</div>
          <h2 className="hero-title">Create your cabin owner account</h2>
          <p className="hero-copy">
            Join your neighborhood network to keep your cabin profile complete and ready for guests.
          </p>
          <div className="hero-pill-row">
            <span className="hero-pill">Profile setup</span>
            <span className="hero-pill">Community linked</span>
            <span className="hero-pill">Secure auth</span>
          </div>
        </aside>

        <div className="card auth-card">
          <h1>Sign up</h1>
          <p className="muted">Start by creating your owner profile.</p>

          <form onSubmit={handleSubmit} noValidate aria-label="Sign-up form" className="stack">
            <div className="field">
              <label htmlFor="signup-displayName">Display name</label>
              <input
                id="signup-displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                aria-invalid={fieldErrors.displayName ? true : undefined}
                aria-describedby={fieldErrors.displayName ? 'signup-displayName-error' : undefined}
                disabled={isSubmitting}
                required
              />
              {fieldErrors.displayName && (
                <p id="signup-displayName-error" role="alert" className="field-error">
                  {fieldErrors.displayName}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={fieldErrors.email ? true : undefined}
                aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
                disabled={isSubmitting}
                required
              />
              {fieldErrors.email && (
                <p id="signup-email-error" role="alert" className="field-error">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
                disabled={isSubmitting}
                required
              />
              {fieldErrors.password && (
                <p id="signup-password-error" role="alert" className="field-error">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {submission.kind === 'error' && (
              <p role="alert" data-testid="signup-submit-error" className="error-banner">
                {submission.message}
              </p>
            )}

            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="muted small">
            Already have an account? <Link to="/sign-in">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

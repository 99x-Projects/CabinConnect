import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, getOwnCabin, getUsersMe, type UserMeResponse } from '../api/client';
import { useAuth } from '../auth/auth-context';
import { useFeatureFlag } from '../lib/feature-flags';

type PageState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly profile: UserMeResponse }
  | { readonly kind: 'error'; readonly message: string };

type ProfileLoadResult =
  | { readonly ok: true; readonly profile: UserMeResponse }
  | { readonly ok: false; readonly error: unknown };

async function delay(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchProfileWithSingleRetry(): Promise<ProfileLoadResult> {
  try {
    const profile = await getUsersMe();
    return { ok: true, profile };
  } catch (error: unknown) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      return { ok: false, error };
    }

    await delay(500);

    try {
      const retryProfile = await getUsersMe();
      return { ok: true, profile: retryProfile };
    } catch (retryError: unknown) {
      return { ok: false, error: retryError };
    }
  }
}

function getProfileErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    return 'Still unauthorized after re-sign-in. Verify backend auth config and VITE_API_BASE_URL.';
  }

  return error instanceof Error ? error.message : 'Failed to load your profile.';
}

export function OwnerHomePage(): JSX.Element {
  const [state, setState] = useState<PageState>({ kind: 'loading' });
  const [signingOut, setSigningOut] = useState<boolean>(false);
  const [hasCabin, setHasCabin] = useState<boolean | null>(null);
  const { signOut, session, loading } = useAuth();
  const navigate = useNavigate();
  const cabinProfileMvpEnabled = useFeatureFlag('cabin_profile_mvp');

  useEffect(() => {
    let cancelled = false;

    if (loading) {
      setState({ kind: 'loading' });
      return () => {
        cancelled = true;
      };
    }

    if (!session) {
      setState({ kind: 'error', message: 'No active session. Please sign in again.' });
      return () => {
        cancelled = true;
      };
    }

    const loadProfile = async (): Promise<void> => {
      const result = await fetchProfileWithSingleRetry();
      if (cancelled) {
        return;
      }

      if (result.ok) {
        setState({ kind: 'ready', profile: result.profile });
        try {
          await getOwnCabin();
          if (!cancelled) {
            setHasCabin(true);
          }
        } catch (cabinError: unknown) {
          if (!cancelled) {
            if (cabinError instanceof ApiError && cabinError.status === 404) {
              setHasCabin(false);
            } else {
              setHasCabin(null);
            }
          }
        }
        return;
      }

      setState({ kind: 'error', message: getProfileErrorMessage(result.error) });
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [loading, session]);

  async function handleSignOut(): Promise<void> {
    setSigningOut(true);
    await signOut();
    navigate('/sign-in', { replace: true });
  }

  if (state.kind === 'loading') {
    return (
      <section className="screen dashboard-screen">
        <div className="card">
          <output>Loading your account...</output>
        </div>
      </section>
    );
  }

  if (state.kind === 'error') {
    return (
      <section className="screen dashboard-screen">
        <div className="card">
          <h1>My Cabin</h1>
          <p role="alert" className="error-banner">{state.message}</p>
          <p className="muted">
            <Link to="/sign-in">Go to sign in</Link>
          </p>
        </div>
      </section>
    );
  }

  const { profile } = state;

  return (
    <section className="screen dashboard-screen">
      <div className="dashboard-shell">
        <header className="card dashboard-header">
          <div>
            <p className="eyebrow">Owner dashboard</p>
            <h1>My Cabin</h1>
            <p className="muted">Signed in as {profile.displayName} ({profile.email})</p>
          </div>
          <button type="button" onClick={handleSignOut} disabled={signingOut} className="btn btn-ghost">
            {signingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </header>

        <div className="dashboard-grid">
          <article className="card dashboard-panel">
            <h2>Profile setup</h2>
            <p className="muted">Complete your cabin profile to make your listing ready for operations.</p>
            {cabinProfileMvpEnabled ? (
              <div className="button-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={hasCabin !== false}
                  onClick={() => navigate('/my-cabin/register')}
                >
                  {hasCabin === true ? 'Cabin already registered' : 'Register your cabin'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={hasCabin !== true}
                  onClick={() => navigate('/my-cabin/edit')}
                >
                  Edit cabin details
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={hasCabin !== true}
                  onClick={() => navigate('/my-cabin/operational')}
                >
                  Operational details
                </button>
              </div>
            ) : (
              <p className="warning-banner">Cabin profile is currently disabled in this environment.</p>
            )}
          </article>

          <article className="card dashboard-panel">
            <h2>System health</h2>
            <p className="muted">Check backend availability before testing secure API calls.</p>
            <Link className="btn btn-ghost" to="/health">Open health page</Link>
          </article>
        </div>
      </div>
    </section>
  );
}

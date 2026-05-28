import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabaseClient } from '../lib/supabase-client';
import { useAuth } from './auth-context';

/**
 * Redirects unauthenticated visitors to /sign-in. /sign-in and /sign-up routes
 * are themselves outside the protected area, preventing a redirect loop.
 */
export function RequireAuth({ children }: { readonly children: ReactNode }): JSX.Element {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [resolvedSession, setResolvedSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    if (loading) {
      setResolvedSession(undefined);
      return () => {
        cancelled = true;
      };
    }

    if (session) {
      setResolvedSession(session);
      return () => {
        cancelled = true;
      };
    }

    setResolvedSession(undefined);
    supabaseClient.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setResolvedSession(data.session ?? null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loading, session]);

  if (loading || resolvedSession === undefined) {
    return <output>Authenticating...</output>;
  }

  if (!session && !resolvedSession) {
    return (
      <section className="screen dashboard-screen">
        <div className="card">
          <h1>Sign in required</h1>
          <p className="muted">You must sign in to access this page.</p>
          <Link to="/sign-in" state={{ from: location.pathname }} className="btn btn-primary">
            Go to sign in
          </Link>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}

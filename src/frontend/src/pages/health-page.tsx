import { useEffect, useState } from 'react';
import { Link, useInRouterContext } from 'react-router-dom';
import { getHealth } from '../api/client';

type LoadState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ok'; readonly status: string }
  | { readonly kind: 'error'; readonly message: string };

export function HealthPage(): JSX.Element {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const hasRouter = useInRouterContext();

  useEffect(() => {
    let cancelled = false;

    getHealth()
      .then((result) => {
        if (!cancelled) {
          setState({ kind: 'ok', status: result.status });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          setState({ kind: 'error', message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === 'loading') {
    return (
      <section className="screen health-screen">
        <div className="card health-card">
          <output>Checking API...</output>
        </div>
      </section>
    );
  }

  if (state.kind === 'error') {
    return (
      <section className="screen health-screen">
        <div className="card health-card">
          <h1>System Health</h1>
          <p role="alert" data-testid="health-error" className="error-banner">
            API unreachable: {state.message}
          </p>
          {hasRouter ? (
            <Link className="btn btn-ghost" to="/my-cabin">Back to dashboard</Link>
          ) : (
            <span className="btn btn-ghost">Back to dashboard</span>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="screen health-screen">
      <div className="card health-card">
        <h1>System Health</h1>
        <p data-testid="health-ok" className="success-banner">API: {state.status}</p>
        {hasRouter ? (
          <Link className="btn btn-primary" to="/my-cabin">Go to dashboard</Link>
        ) : (
          <span className="btn btn-primary">Go to dashboard</span>
        )}
      </div>
    </section>
  );
}

import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type AuthStateChangeCallback = (
  event: string,
  session: { access_token: string; user: { id: string } } | null,
) => void;

const mocks = vi.hoisted(() => {
  const callbacks: AuthStateChangeCallback[] = [];
  let mockSession: { access_token: string; user: { id: string } } | null = null;
  return {
    callbacks,
    getSession: vi.fn(async () => ({ data: { session: mockSession } })),
    onAuthStateChange: vi.fn((cb: AuthStateChangeCallback) => {
      callbacks.push(cb);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const idx = callbacks.indexOf(cb);
              if (idx >= 0) callbacks.splice(idx, 1);
            },
          },
        },
      };
    }),
    signOut: vi.fn(async () => ({ error: null })),
    setSession: (s: typeof mockSession) => {
      mockSession = s;
    },
  };
});

vi.mock('../lib/supabase-client', () => ({
  supabaseClient: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signOut: mocks.signOut,
    },
  },
}));

import { AuthProvider } from './auth-provider';
import { useAuth } from './auth-context';

function Probe(): JSX.Element {
  const { session, user, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="userId">{user?.id ?? 'anonymous'}</span>
      <span data-testid="hasSession">{String(session !== null)}</span>
    </div>
  );
}

describe('AuthProvider / useAuth', () => {
  beforeEach(() => {
    mocks.callbacks.length = 0;
    mocks.setSession(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts with no session and loading false after initial getSession resolves', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('userId').textContent).toBe('anonymous');
    expect(screen.getByTestId('hasSession').textContent).toBe('false');
  });

  it('updates when onAuthStateChange fires with a new session', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    act(() => {
      for (const cb of mocks.callbacks) {
        cb('SIGNED_IN', { access_token: 'token-xyz', user: { id: 'user-123' } });
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('userId').textContent).toBe('user-123');
    });
    expect(screen.getByTestId('hasSession').textContent).toBe('true');
  });
});

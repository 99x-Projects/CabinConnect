import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactRouter from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  setSession: vi.fn(),
  unsubscribe: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('../lib/supabase-client', () => ({
  supabaseClient: {
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      setSession: mocks.setSession,
    },
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom');
  return { ...actual, useNavigate: () => mocks.navigate };
});

import { SignInPage } from './sign-in-page';

function renderPage(): void {
  render(
    <MemoryRouter>
      <SignInPage />
    </MemoryRouter>,
  );
}

describe('SignInPage', () => {
  beforeEach(() => {
    mocks.signInWithPassword.mockReset();
    mocks.getSession.mockReset();
    mocks.onAuthStateChange.mockReset();
    mocks.setSession.mockReset();
    mocks.unsubscribe.mockReset();
    mocks.navigate.mockReset();
    mocks.setSession.mockResolvedValue({ data: { session: null }, error: null });
    mocks.getSession.mockResolvedValue({ data: { session: { access_token: 'token' } } });
    mocks.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mocks.unsubscribe,
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls signInWithPassword with trimmed email on submit', async () => {
    mocks.getSession
      .mockResolvedValueOnce({ data: { session: null } })
      .mockResolvedValue({ data: { session: { access_token: 'token' } } });
    mocks.signInWithPassword.mockResolvedValue({
      data: {
        session: {
          access_token: 'token',
          refresh_token: 'refresh',
        },
      },
      error: null,
    });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/email/i), '  alice@example.com  ');
    await user.type(screen.getByLabelText(/password/i), 'correcthorsebattery');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mocks.signInWithPassword).toHaveBeenCalledOnce();
    });
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'correcthorsebattery',
    });
    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/my-cabin', { replace: true });
    });
  });

  it('surfaces invalid-credentials error verbatim', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    mocks.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials' },
    });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong-password-1');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByTestId('signin-submit-error')).toHaveTextContent('Invalid login credentials');
    });
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});

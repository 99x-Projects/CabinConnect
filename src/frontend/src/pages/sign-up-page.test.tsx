import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactRouter from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('../lib/supabase-client', () => ({
  supabaseClient: { auth: { signUp: mocks.signUp } },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('react-router-dom');
  return { ...actual, useNavigate: () => mocks.navigate };
});

import { SignUpPage } from './sign-up-page';

function renderPage(): void {
  render(
    <MemoryRouter>
      <SignUpPage />
    </MemoryRouter>,
  );
}

describe('SignUpPage', () => {
  beforeEach(() => {
    mocks.signUp.mockReset();
    mocks.navigate.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows inline validation errors and does not call signUp on empty submit', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(mocks.signUp).not.toHaveBeenCalled();
    // At least 3 alerts (one per field) — submit-error alert is not present yet.
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThanOrEqual(3);
  });

  it('calls Supabase signUp with trimmed email and display_name metadata on valid submit', async () => {
    mocks.signUp.mockResolvedValue({ data: { user: { id: 'u1' }, session: null }, error: null });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/display name/i), '  Alice O.  ');
    await user.type(screen.getByLabelText(/email/i), '  alice@example.com  ');
    await user.type(screen.getByLabelText(/password/i), 'correcthorsebattery');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mocks.signUp).toHaveBeenCalledOnce();
    });
    expect(mocks.signUp).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'correcthorsebattery',
      options: { data: { display_name: 'Alice O.' } },
    });
    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/my-cabin', { replace: true });
    });
  });

  it('surfaces the Supabase error message (e.g. duplicate email) verbatim', async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/display name/i), 'Alice');
    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'correcthorsebattery');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByTestId('signup-submit-error')).toHaveTextContent('User already registered');
    });
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HealthPage } from './health-page';

vi.mock('../api/client', () => ({
  getHealth: vi.fn(async () => ({ status: 'ok' })),
}));

describe('HealthPage', () => {
  it('renders success state when getHealth resolves', async () => {
    render(<HealthPage />);

    await waitFor(() => {
      expect(screen.getByTestId('health-ok')).toBeInTheDocument();
    });

    expect(screen.getByTestId('health-ok')).toHaveTextContent('API: ok');
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCommunities: vi.fn(),
  createCabin: vi.fn(),
}));

vi.mock('../api/client', () => ({
  ApiError: class ApiError extends Error {
    public readonly status: number;

    public constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
  getCommunities: mocks.getCommunities,
  createCabin: mocks.createCabin,
}));

import { RegisterCabinPage } from './register-cabin-page';

function renderPage(): void {
  render(
    <MemoryRouter>
      <RegisterCabinPage />
    </MemoryRouter>,
  );
}

describe('RegisterCabinPage', () => {
  beforeEach(() => {
    mocks.getCommunities.mockReset();
    mocks.createCabin.mockReset();
    mocks.getCommunities.mockResolvedValue([
      {
        id: 'community-1',
        name: 'Aspen Hollow Resort',
        region: 'Colorado, USA',
        active: true,
      },
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('submits selected community and amenities codes', async () => {
    mocks.createCabin.mockResolvedValue({
      id: 'cab-1',
      ownerId: 'owner-1',
      communityId: 'community-1',
      name: 'Lakeside Cabin',
      address: '123 Pine Trail',
      capacity: 4,
      amenities: ['wifi'],
      createdAt: '2026-05-28T00:00:00Z',
      updatedAt: '2026-05-28T00:00:00Z',
    });

    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/cabin name/i), 'Lakeside Cabin');
    await user.type(screen.getByLabelText(/address/i), '123 Pine Trail');
    await user.selectOptions(screen.getByLabelText(/community/i), 'community-1');
    await user.type(screen.getByLabelText(/capacity/i), '4');
    await user.click(screen.getByLabelText(/wi-fi/i));
    await user.click(screen.getByRole('button', { name: /register cabin/i }));

    await waitFor(() => {
      expect(mocks.createCabin).toHaveBeenCalledOnce();
    });

    expect(mocks.createCabin).toHaveBeenCalledWith({
      name: 'Lakeside Cabin',
      address: '123 Pine Trail',
      communityId: 'community-1',
      capacity: 4,
      amenities: ['wifi'],
    });
  });
});

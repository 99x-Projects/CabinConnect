import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getOwnCabin: vi.fn(),
  getCommunities: vi.fn(),
  updateOwnCabin: vi.fn(),
}));

vi.mock('../api/client', () => ({
  ApiError: class ApiError extends Error {
    public readonly status: number;

    public constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
  getOwnCabin: mocks.getOwnCabin,
  getCommunities: mocks.getCommunities,
  updateOwnCabin: mocks.updateOwnCabin,
}));

import { EditCabinPage } from './edit-cabin-page';

function renderPage(): void {
  render(
    <MemoryRouter>
      <EditCabinPage />
    </MemoryRouter>,
  );
}

describe('EditCabinPage', () => {
  beforeEach(() => {
    mocks.getOwnCabin.mockReset();
    mocks.getCommunities.mockReset();
    mocks.updateOwnCabin.mockReset();

    mocks.getOwnCabin.mockResolvedValue({
      id: 'cab-1',
      ownerId: 'owner-1',
      communityId: 'community-1',
      name: 'Original Cabin',
      address: 'Old Address',
      capacity: 4,
      amenities: ['wifi'],
      createdAt: '2026-05-28T00:00:00Z',
      updatedAt: '2026-05-28T00:00:00Z',
    });

    mocks.getCommunities.mockResolvedValue([
      {
        id: 'community-1',
        name: 'Aspen Hollow Resort',
        region: 'Colorado, USA',
        active: true,
      },
      {
        id: 'community-2',
        name: 'Birch Lake Community',
        region: 'Ontario, Canada',
        active: true,
      },
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates cabin with selected community and amenities', async () => {
    mocks.updateOwnCabin.mockResolvedValue({
      id: 'cab-1',
      ownerId: 'owner-1',
      communityId: 'community-2',
      name: 'Updated Cabin',
      address: 'New Address',
      capacity: 6,
      amenities: ['wifi', 'parking'],
      createdAt: '2026-05-28T00:00:00Z',
      updatedAt: '2026-05-28T01:00:00Z',
    });

    const user = userEvent.setup();
    renderPage();

    await screen.findByRole('heading', { name: /edit cabin details/i });

    const nameInput = screen.getByLabelText(/cabin name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Cabin');

    const addressInput = screen.getByLabelText(/^address$/i);
    await user.clear(addressInput);
    await user.type(addressInput, 'New Address');

    await user.selectOptions(screen.getByLabelText(/community/i), 'community-2');

    const capacityInput = screen.getByLabelText(/capacity/i);
    await user.clear(capacityInput);
    await user.type(capacityInput, '6');

    await user.click(screen.getByLabelText(/^parking$/i));

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(mocks.updateOwnCabin).toHaveBeenCalledOnce();
    });

    expect(mocks.updateOwnCabin).toHaveBeenCalledWith({
      name: 'Updated Cabin',
      address: 'New Address',
      communityId: 'community-2',
      capacity: 6,
      amenities: ['wifi', 'parking'],
    });
  });
});

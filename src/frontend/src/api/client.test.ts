import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  refreshSession: vi.fn(),
}));

vi.mock('../lib/supabase-client', () => ({
  supabaseClient: {
    auth: {
      getSession: mocks.getSession,
      refreshSession: mocks.refreshSession,
    },
  },
}));

import {
  ApiError,
  createCabin,
  getHealth,
  getOwnCabinOperational,
  getUsersMe,
  updateOwnCabin,
} from './client';

describe('API client', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.test');
    mocks.getSession.mockReset();
    mocks.refreshSession.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('attaches Authorization: Bearer <token> when a session exists', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { access_token: 'abc.def.ghi' } } });
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
    );

    await getHealth();

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [, init] = fetchSpy.mock.calls[0]!;
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer abc.def.ghi');
  });

  it('retries once on 401 after a successful refresh', async () => {
    mocks.getSession
      .mockResolvedValueOnce({ data: { session: { access_token: 'old' } } })
      .mockResolvedValueOnce({ data: { session: { access_token: 'new' } } });
    mocks.refreshSession.mockResolvedValue({ data: { session: { access_token: 'new' } }, error: null });

    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'ok' }), { status: 200 }));

    const result = await getHealth();
    expect(result.status).toBe('ok');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(mocks.refreshSession).toHaveBeenCalledOnce();
  });

  it('throws ApiError on a second 401 (no further retry)', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { access_token: 'old' } } });
    mocks.refreshSession.mockResolvedValue({ data: { session: null }, error: { message: 'expired' } });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 401 }));

    await expect(getHealth()).rejects.toBeInstanceOf(ApiError);
  });

  it('getUsersMe hits /api/users/me and returns the parsed body', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { access_token: 'abc' } } });
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: '11111111-1111-4111-8111-111111111111',
          displayName: 'Alice',
          email: 'alice@example.com',
          role: 'owner',
          createdAt: '2026-05-28T00:00:00Z',
        }),
        { status: 200 },
      ),
    );

    const result = await getUsersMe();
    expect(fetchSpy).toHaveBeenCalledOnce();
    // apiBaseUrl is captured at module load; the test-setup env value wins.
    expect(String(fetchSpy.mock.calls[0]![0])).toMatch(/\/api\/users\/me$/);
    expect(result.email).toBe('alice@example.com');
    expect(result.role).toBe('owner');
  });

  it('updateOwnCabin sends snake_case payload to /api/cabins/me', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { access_token: 'abc' } } });
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'cab-1',
          ownerId: 'owner-1',
          communityId: 'community-1',
          name: 'Updated Cabin',
          address: '456 Lake View',
          capacity: 8,
          amenities: ['wifi'],
          createdAt: '2026-05-28T00:00:00Z',
          updatedAt: '2026-05-28T01:00:00Z',
        }),
        { status: 200 },
      ),
    );

    await updateOwnCabin({
      name: 'Updated Cabin',
      address: '456 Lake View',
      communityId: 'community-1',
      capacity: 8,
      amenities: ['wifi'],
    });

    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(String(url)).toMatch(/\/api\/cabins\/me$/);
    expect(init?.method).toBe('PUT');
    expect(init?.body).toBe(JSON.stringify({
      name: 'Updated Cabin',
      address: '456 Lake View',
      community_id: 'community-1',
      capacity: 8,
      amenities: ['wifi'],
    }));
  });

  it('createCabin sends snake_case payload to /api/cabins', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { access_token: 'abc' } } });
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'cab-1',
          ownerId: 'owner-1',
          communityId: 'community-1',
          name: 'Registered Cabin',
          address: '123 Pine Trail',
          capacity: 4,
          amenities: ['wifi'],
          createdAt: '2026-05-28T00:00:00Z',
          updatedAt: '2026-05-28T01:00:00Z',
        }),
        { status: 201 },
      ),
    );

    await createCabin({
      name: 'Registered Cabin',
      address: '123 Pine Trail',
      communityId: 'community-1',
      capacity: 4,
      amenities: ['wifi'],
    });

    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(String(url)).toMatch(/\/api\/cabins$/);
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(JSON.stringify({
      name: 'Registered Cabin',
      address: '123 Pine Trail',
      community_id: 'community-1',
      capacity: 4,
      amenities: ['wifi'],
    }));
  });

  it('getOwnCabinOperational hits /api/cabins/me/operational', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { access_token: 'abc' } } });
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          accessCodes: [{ label: 'Front Door', value: '1234' }],
          emergencyContacts: [{ name: 'Caretaker', phone: '+47 123 45 678', relation: 'On-call' }],
          houseRules: 'No shoes indoors',
          updatedAt: '2026-05-28T01:00:00Z',
        }),
        { status: 200 },
      ),
    );

    const result = await getOwnCabinOperational();

    expect(String(fetchSpy.mock.calls[0]![0])).toMatch(/\/api\/cabins\/me\/operational$/);
    expect(result.accessCodes).toHaveLength(1);
    expect(result.emergencyContacts[0]?.name).toBe('Caretaker');
  });
});

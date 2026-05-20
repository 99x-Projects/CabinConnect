/**
 * Cabin mock data — typed against the shared contract.
 *
 * When Bolt 2 ships the real /cabins/{id} endpoint, this file is deleted and the
 * page swaps to a fetch call. Until then, this fakes what the API will return.
 */

import type { Cabin, CabinDetailResponse, CabinId, CommunityId, UserId } from '@cabinconnect/shared-types';

const HEMSEDAL: CommunityId = 'community_hemsedal_pilot' as CommunityId;
const ASITHA: UserId = 'user_asitha_001' as UserId;
const INGRID: UserId = 'user_ingrid_001' as UserId;

const mockCabin: Cabin = {
  id: 'cabin_birkebakk_42' as CabinId,
  communityId: HEMSEDAL,
  name: 'Birkebakk',
  location: 'Hemsedal — Birkebakkvegen 42',
  capacity: 8,
  amenityTags: ['ski-storage', 'sauna', 'wood-stove', 'wifi'],
  ownerIds: [ASITHA, INGRID],

  createdAt: '2024-03-10T09:00:00Z',
  updatedAt: '2026-05-19T18:30:00Z',
};

export const mockCabinDetailResponse: CabinDetailResponse = {
  cabin: mockCabin,
  isOwner: true,
};

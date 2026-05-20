/**
 * Cabin — the contract Bolt 2 will fulfil.
 *
 * Committed during Bolt 1 so the UI mocks can be typed against the exact shape
 * Bolt 2's API will return. When Bolt 2 ships the handlers, swapping mocks for
 * real fetch calls is mechanical.
 *
 * Source authority: PRD §8 Product Scope, MC-01..MC-13; CI-01 Community boundary;
 * Bolt 2 Unit U-005 (membership / owner relationships).
 */

import type { CommunityId, UserId } from './community';

export type CabinId = string & { readonly __brand: 'CabinId' };

export interface Cabin {
  id: CabinId;
  communityId: CommunityId; // CI-01: enforced NOT NULL FK
  name: string;
  location: string;
  capacity: number;
  amenityTags: string[];
  ownerIds: UserId[]; // MC-07: multiple Cabin Owners per profile

  createdAt: string; // ISO 8601 UTC
  updatedAt: string; // ISO 8601 UTC
}

/** What the GET /cabins/{id} endpoint returns. */
export interface CabinDetailResponse {
  cabin: Cabin;
  isOwner: boolean; // server-derived from JWT.sub vs ownerIds
}

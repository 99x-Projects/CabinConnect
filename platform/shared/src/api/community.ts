/**
 * Community & User — the identity / scoping primitives.
 *
 * Committed during Bolt 1 (Bolt 2 will implement). Branded string types
 * prevent accidentally passing a UserId where a CommunityId is expected.
 */

export type CommunityId = string & { readonly __brand: 'CommunityId' };
export type UserId = string & { readonly __brand: 'UserId' };

export type Locale = 'nb-NO' | 'en';

export interface Community {
  id: CommunityId;
  name: string;
  slug: string;
}

export interface CurrentUser {
  id: UserId;
  displayName: string;
  email: string;
  locale: Locale;
  activeCommunityId: CommunityId; // from JWT claim per BD-1-2
  communities: Array<{
    community: Community;
    role: 'Member' | 'Administrator';
  }>;
}

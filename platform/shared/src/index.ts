// CabinConnect shared types — the handoff surface between Bolt 1 (UI on mocks)
// and Bolt 2 (real backend). Per BD-UF-1 in bolt-01-ui-foundation.md.
//
// Add new types here as they get committed during Bolt 1 (UI design / mocks)
// or Bolt 2 (API handler implementation). The frontend imports from
// `@cabinconnect/shared-types`; the .NET backend mirrors these via code generation
// (deferred — Bolt 2 decides the generation tool during construction).

export type { CabinId, Cabin, CabinDetailResponse } from './api/cabin';
export type { CommunityId, UserId, Locale, Community, CurrentUser } from './api/community';

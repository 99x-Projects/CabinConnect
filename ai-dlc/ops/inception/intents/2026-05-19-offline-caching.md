# Intent: Offline-First Caching for Critical Reads

**Status:** Elaborated
**Date:** 2026-05-19
**Owner:** Asitha (FDE)
**Source in PRD:** CI-13 · Related: NFR-OFF, MC-08, I-3 (cabin connectivity)
**Cluster:** Foundation Cluster (with CI-01, CI-02, CI-14) — see [shared elaboration session](../elaborations/foundation/2026-05-19-session-1.md)

---

## What

Make the CabinConnect web app installable as a PWA and cache designated "critical reads" — Visitor Instructions, today's and tomorrow's Events, active Grocery Orders, Maintenance Tasks for the next 14 days — so they remain available for at least 24 hours after the last successful network fetch, even when the user is at the cabin with no signal.

## Why

Cabin areas in Norway notoriously have patchy mobile coverage (PRD §4.3, Discovery Insight I-3). The user opens CabinConnect at the cabin specifically to access information they need *right now* — *who's coming this weekend, what's the wifi password, when does the Easter event start, where's my order*. If those reads fail because of a missing signal bar, the product feels broken regardless of how good its online experience is.

NFR-OFF formalises this: critical reads available offline for 24h once loaded. Building it as a foundation Intent — before any feature accumulates assumptions about being online — saves us from retrofitting offline awareness across every component later.

## Success Looks Like

- A user can install CabinConnect on their phone home screen as a PWA
- A user who loaded Visitor Instructions, today's Events, and active Orders while still in mobile coverage can open the app at the cabin (no signal) and see those reads instantly
- When the user attempts an action that requires the network (writing, fetching a non-cached resource), they see a clear "offline — will retry when connected" state, not a generic error
- The cache is per-user, per-Community, and never leaks data across users on the same device (e.g. if a user signs out, their cached data is purged)
- Cached critical reads carry a "last updated" timestamp and refresh in the background when connectivity returns
- The cache expires after 24h of disconnection; on next online session, a fresh fetch is forced

## Assumptions

- The MVP is a responsive Progressive Web App, not a native app (CLAUDE.md Non-Goals)
- The mechanism is the Service Worker + Cache API + IndexedDB (no third-party offline framework)
- Critical reads are explicitly enumerated and tagged at the API layer — not auto-cached by guess
- Mutation queueing (offline writes that sync when back online) is **out of scope** for this Intent; the app is read-offline, write-online for MVP

## Open Questions

- Which exact routes/endpoints qualify as "critical reads"? — to be locked in elaboration; initial list: GET visitor-instructions/{id}, GET events?upcoming, GET orders?active, GET maintenance-tasks?range=14d
- What's the storage budget per user (e.g. cap at 5 MB)? — to be defined in elaboration
- What does the offline indicator look like in the UI? — design decision, not part of this Intent

## Out of Scope

- Offline mutations / write queue / background sync (defer to phase 2)
- Offline maps (Norway's cabin areas have dedicated map apps — UT.no, Norgeskart)
- Push-on-demand sync from server (background pull) — out of scope for MVP
- Native app shell

---

## Elaboration Sessions

| Session | Date | Units Extracted |
|---|---|---|
| [Session 1 — Foundation Cluster](../elaborations/foundation/2026-05-19-session-1.md) | 2026-05-19 | 2 (U-007, U-008) |

## Extracted Units

| Unit | File | Status |
|---|---|---|
| U-007 PWA shell + service worker scaffold | [u-007-pwa-shell-service-worker.md](../../build/units/u-007-pwa-shell-service-worker.md) | Open |
| U-008 Critical-read cache strategy | [u-008-critical-read-cache-strategy.md](../../build/units/u-008-critical-read-cache-strategy.md) | Open |

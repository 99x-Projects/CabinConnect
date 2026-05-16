# Intent: Cabin Profile UI (Host)

**Status:** Ready
**Date:** 2026-05-16
**Owner:** Sachith

---

## What
A Host can manage their cabin portfolio through a React UI — logging in, creating cabins via a modal form, editing profiles and amenity tags, storing key information, and viewing a full cabin detail screen with a click-to-reveal for masked fields.

## Why
The Bolt 01 API is fully built but has no UI. Without this screen set, a Host cannot interact with the system. This is the first user-facing slice of the application and the prerequisite for all other Host workflows.

## Success Looks Like
- A Host can log in and log out via Supabase Auth
- A Host can view their cabin list as a grid of summary cards showing name, location, capacity, active status, and amenity tags
- A Host can open a create-cabin modal, fill in name, location, capacity, description, and select amenity tags, and see the new cabin card appear in the list on success
- A Host can open a cabin detail page, edit all profile fields and amenity tags, and save — with a conflict warning shown if the version is stale
- A Host can see key information (access codes, emergency contacts, house rules) as masked fields on the cabin detail page, and click to reveal each sensitive field in plaintext
- A Host can set or update individual key info fields without clearing the ones they did not submit
- A second Host's session cannot see or navigate to the first Host's cabins

## Assumptions
- Auth is Supabase Auth (email + password for MVP); the Supabase client on the frontend is used for auth tokens only — no direct data mutations
- The React app calls the .NET API exclusively for all data operations
- Amenity tags are fetched from `GET /api/amenity-tags` and rendered as a multi-select; no free-text tags
- Client-side validation mirrors API rules (name ≤ 512 chars, capacity ≥ 1) as a UX convenience; the API is authoritative
- The optimistic concurrency `version` field is read from `GET /api/cabins/{id}` and submitted on `PUT /api/cabins/{id}`; a 409 response surfaces a user-facing conflict message
- Key info is a collapsible section within the cabin detail page; additional info beyond key info can expand to a separate sub-page if needed

## Open Questions
_(none — all resolved before file creation)_

## Out of Scope
- Guest-facing cabin browsing or booking UI (separate intent)
- Photo / image upload (deferred)
- Booking or availability calendar UI (separate intent)
- Admin / multi-tenant management screens
- Password reset / email verification flows (Supabase handles these out of the box)

---

## Elaboration Sessions

| Session | Date | Units Extracted |
|---|---|---|
| _(not yet run)_ | | |

## Extracted Units

| Unit | File | Status |
|---|---|---|
| _(not yet elaborated)_ | | |

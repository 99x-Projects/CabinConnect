# Elaboration Session: Cabin Registration — Session 1

**Intent:** [intent/2026-06-09-1780997260-cabin-registration.md](../intents/2026-06-09-1780997260-cabin-registration.md)
**Date:** 2026-06-09
**Participants:** Chinthaka, Claude (AI facilitator)
**Session goal:** Decompose the cabin registration full-stack feature into atomic units with testable ACs and edge case coverage.

---

## Units Agreed This Session

| # | Unit name | Purpose | ACs agreed? | Edge cases surfaced? |
|---|---|---|---|---|
| 1 | Cabins Database Migration | `cabins` table + RLS policies in Supabase PostgreSQL | Yes | Yes |
| 2 | Cabin Registration API Endpoint | `POST /cabins` — validate, persist, return 201 | Yes | Yes |
| 3 | Cabin Registration Frontend Form | React form + confirmation state + dashboard button | Yes | Yes |

---

## Unit Detail

### Unit 1: Cabins Database Migration

**Purpose:** Create the `cabins` table in Supabase PostgreSQL with all required columns and RLS policies — so the API has a schema to write to and Hosts can only insert their own cabins while reads remain public.

**Acceptance Criteria:**
1. Given the migration is applied, when the `cabins` table is inspected, then it has columns: `id` (UUID, PK, default gen_random_uuid()), `host_id` (UUID, not null, references `auth.users`), `name` (text, not null), `description` (text, not null), `location` (text, not null), `base_rate` (numeric, not null), `max_guests` (integer, not null), `created_at` (timestamptz, not null, default now()).
2. Given RLS is enabled on `cabins`, when an authenticated user inserts a cabin with their own user ID as `host_id`, then the insert succeeds.
3. Given RLS is enabled on `cabins`, when an authenticated user attempts to insert a cabin with a different user's ID as `host_id`, then the insert is rejected.
4. Given RLS is enabled on `cabins`, when any user (authenticated or not) selects from `cabins`, then all rows are returned — reads are public.
5. Given the migration is applied, when an insert is attempted with any required field missing, then the insert fails with a NOT NULL constraint violation.

**Edge cases surfaced:**
- EC-003: `created_at` must be `timestamptz` not `timestamp`
- `host_id` FK must reference `auth.users(id)` via raw SQL in EF Core migration
- `base_rate` uses `numeric` without precision/scale — no DB-level rounding
- `max_guests >= 1` enforced at API level only — no DB CHECK constraint

**Open questions:** None.

---

### Unit 2: Cabin Registration API Endpoint

**Purpose:** Expose `POST /cabins` on the .NET API that accepts cabin details from an authenticated Host, validates the input, persists the cabin with the caller's user ID as `host_id`, and returns the created record.

**Acceptance Criteria:**
1. Given an authenticated Host with a valid JWT, when `POST /cabins` is called with valid name, description, location, base_rate, and max_guests, then the API returns `201 Created` with the saved cabin record including its generated `id`, `host_id`, and `created_at`.
2. Given an authenticated Host, when `POST /cabins` is called, then `host_id` is always set from the validated JWT claim — the client cannot supply or override the `host_id` in the request body.
3. Given an unauthenticated request, when `POST /cabins` is called, then the API returns `401 Unauthorized`.
4. Given an authenticated Host, when `POST /cabins` is called with any required field missing or empty, then the API returns `400 Bad Request` with a clear error indicating which field failed.
5. Given an authenticated Host, when `POST /cabins` is called with `base_rate` of zero or negative, then the API returns `400 Bad Request`.
6. Given an authenticated Host, when `POST /cabins` is called with `max_guests` less than 1, then the API returns `400 Bad Request`.
7. Given an authenticated Host, when `POST /cabins` is called with valid data, then the response body never includes internal stack traces or database error detail.

**Edge cases surfaced:**
- EC-007: `host_id` always extracted from JWT `sub` claim, never from request body
- Empty string vs missing: whitespace-only strings fail validation same as null
- Duplicate cabin names: allowed — no uniqueness constraint

**Open questions:** None.

---

### Unit 3: Cabin Registration Frontend Form

**Purpose:** Add a Register Cabin page with a form, client-side validation, loading state, and confirmation state; add a "Register Cabin" button to the Dashboard that navigates to this page.

**Acceptance Criteria:**
1. Given an authenticated Host, when the Register Cabin page loads, then a form is rendered with fields for name, description, location, base_rate, and max_guests — all marked as required.
2. Given the form is submitted with all valid fields, when the API returns `201 Created`, then the form transitions to a confirmation state showing the registered cabin's name and ID.
3. Given the form is submitted with any required field empty or whitespace-only, when the user clicks submit, then field-level error messages appear and the request is not sent.
4. Given the `base_rate` field, when the user enters zero or a negative value, then a field-level error is shown and the request is not sent.
5. Given the `max_guests` field, when the user enters a value less than 1, then a field-level error is shown and the request is not sent.
6. Given a valid submission is in flight, when the API has not yet responded, then the submit button shows a loading state and cannot be clicked again.
7. Given the API returns an error response (4xx or 5xx), when the submission fails, then a form-level error message is displayed without exposing internal API detail.
8. Given an unauthenticated user navigates to the Register Cabin page, when the route is evaluated, then they are redirected to `/login` via the existing Protected Route Guard.
9. Given the Register Cabin page renders, when the primary submit button is inspected, then it uses the same button tokens as Login, Registration, and Dashboard (`bg-primary text-on-primary py-md rounded-lg font-label-md`).
10. Given an authenticated Host is on the Dashboard, when the page loads, then a "Register Cabin" button is visible that navigates to the Register Cabin page.

**Edge cases surfaced:**
- EC-008: `401` on submission redirects to `/login`
- `base_rate` input: `type="number"` requires programmatic validation for empty/`e`/non-positive
- `max_guests`: `min="1"` attribute plus programmatic guard
- Double submission: button disabled during in-flight request
- Confirmation next action: must offer a clear path (e.g. "Register another cabin" resets form)

**Open questions:** None.

---

## Session Notes

- Execution order: Unit 1 → Unit 2 → Unit 3 (strict dependency chain)
- `max_guests >= 1` is API-level only; no DB CHECK constraint agreed
- All authenticated users treated as Hosts — no separate role model in this intent
- "Register Cabin" button on Dashboard is part of Unit 3 scope (not a separate unit)
- API call from frontend goes through existing `apiClient`, never directly to Supabase

---

## Next Session

**Goal:** Not required — all units for this intent are fully elaborated.
**Prerequisite:** Plan a bolt to group and execute these three units.

-- ============================================================================
-- supabase/migrations/20260528120000_cabin_registration.sql
-- ----------------------------------------------------------------------------
-- RLS for `cabins` and `amenities`. Schema (tables, columns, indexes, CHECK
-- constraints) is owned by the EF migration `20260528065828_CabinRegistration`.
-- This file only adds Postgres-level concerns EF Core does not manage:
--   * Row-Level Security policies on `cabins` (owner-scoped)
--   * RLS on `amenities` (read-all for authenticated)
-- The .NET API currently connects as the `postgres` role which bypasses RLS;
-- these policies are dormant until the role cutover (deferred to the
-- security-hardening bolt) but are committed now so they ship with the schema.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- cabins — RLS: an owner can read/write only their own cabin row. owner_id
-- is the Supabase auth user id (auth.uid()); see EC-007 in CLAUDE.md.
-- ---------------------------------------------------------------------------
ALTER TABLE public.cabins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cabins_select_own ON public.cabins;
CREATE POLICY cabins_select_own
    ON public.cabins
    FOR SELECT
    TO authenticated
    USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS cabins_insert_own ON public.cabins;
CREATE POLICY cabins_insert_own
    ON public.cabins
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS cabins_update_own ON public.cabins;
CREATE POLICY cabins_update_own
    ON public.cabins
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS cabins_delete_own ON public.cabins;
CREATE POLICY cabins_delete_own
    ON public.cabins
    FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- amenities — read-all for authenticated users; writes happen only via seed
-- file / migrations (no INSERT/UPDATE/DELETE policies defined).
-- ---------------------------------------------------------------------------
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS amenities_select_all_authenticated ON public.amenities;
CREATE POLICY amenities_select_all_authenticated
    ON public.amenities
    FOR SELECT
    TO authenticated
    USING (true);

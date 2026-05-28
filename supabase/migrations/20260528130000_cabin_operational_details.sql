-- ============================================================================
-- supabase/migrations/20260528130000_cabin_operational_details.sql
-- ----------------------------------------------------------------------------
-- RLS for `cabin_operational_details`. Schema (table/columns/FK) is owned by
-- EF migration `20260528081139_CabinViewEditOperational`.
-- This file adds Postgres-level concerns EF Core does not manage:
--   * Row-Level Security policies tied to owner of parent cabin
--
-- Owner semantics:
--   A Guest can read/write only operational details for cabins where
--   cabins.owner_id = auth.uid().
-- ============================================================================

ALTER TABLE public.cabin_operational_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cabin_operational_details_select_own ON public.cabin_operational_details;
CREATE POLICY cabin_operational_details_select_own
    ON public.cabin_operational_details
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.cabins c
            WHERE c.id = cabin_operational_details.cabin_id
              AND c.owner_id = auth.uid())
    );

DROP POLICY IF EXISTS cabin_operational_details_insert_own ON public.cabin_operational_details;
CREATE POLICY cabin_operational_details_insert_own
    ON public.cabin_operational_details
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.cabins c
            WHERE c.id = cabin_operational_details.cabin_id
              AND c.owner_id = auth.uid())
    );

DROP POLICY IF EXISTS cabin_operational_details_update_own ON public.cabin_operational_details;
CREATE POLICY cabin_operational_details_update_own
    ON public.cabin_operational_details
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.cabins c
            WHERE c.id = cabin_operational_details.cabin_id
              AND c.owner_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.cabins c
            WHERE c.id = cabin_operational_details.cabin_id
              AND c.owner_id = auth.uid())
    );

DROP POLICY IF EXISTS cabin_operational_details_delete_own ON public.cabin_operational_details;
CREATE POLICY cabin_operational_details_delete_own
    ON public.cabin_operational_details
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.cabins c
            WHERE c.id = cabin_operational_details.cabin_id
              AND c.owner_id = auth.uid())
    );

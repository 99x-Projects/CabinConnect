-- Cabin registration schema for Cabin Profile Registration / Unit 02.
-- Execute in Supabase SQL editor or migrations pipeline after amenities.sql.

CREATE TABLE IF NOT EXISTS public.cabins (
    id uuid PRIMARY KEY,
    host_id uuid NOT NULL,
    name text NOT NULL CHECK (length(trim(name)) > 0),
    description text NOT NULL CHECK (length(trim(description)) > 0),
    street_address text NOT NULL CHECK (length(trim(street_address)) > 0),
    capacity integer NOT NULL CHECK (capacity >= 1 AND capacity <= 50),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.cabin_amenities (
    cabin_id uuid NOT NULL REFERENCES public.cabins(id) ON DELETE CASCADE,
    amenity_id uuid NOT NULL REFERENCES public.amenities(id),
    PRIMARY KEY (cabin_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS public.cabin_custom_amenities (
    id uuid PRIMARY KEY,
    cabin_id uuid NOT NULL REFERENCES public.cabins(id) ON DELETE CASCADE,
    display_name text NOT NULL CHECK (length(trim(display_name)) > 0)
);

ALTER TABLE public.cabins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cabin_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cabin_custom_amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cabins_host_insert" ON public.cabins;
CREATE POLICY "cabins_host_insert"
    ON public.cabins
    FOR INSERT
    TO authenticated
    WITH CHECK (host_id = auth.uid());

DROP POLICY IF EXISTS "cabins_host_select" ON public.cabins;
CREATE POLICY "cabins_host_select"
    ON public.cabins
    FOR SELECT
    TO authenticated
    USING (host_id = auth.uid());

DROP POLICY IF EXISTS "cabins_host_update" ON public.cabins;
CREATE POLICY "cabins_host_update"
    ON public.cabins
    FOR UPDATE
    TO authenticated
    USING (host_id = auth.uid())
    WITH CHECK (host_id = auth.uid());

DROP POLICY IF EXISTS "cabin_amenities_host_insert" ON public.cabin_amenities;
CREATE POLICY "cabin_amenities_host_insert"
    ON public.cabin_amenities
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.cabins c
            WHERE c.id = cabin_id
              AND c.host_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "cabin_amenities_host_select" ON public.cabin_amenities;
CREATE POLICY "cabin_amenities_host_select"
    ON public.cabin_amenities
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.cabins c
            WHERE c.id = cabin_id
              AND c.host_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "cabin_custom_amenities_host_insert" ON public.cabin_custom_amenities;
CREATE POLICY "cabin_custom_amenities_host_insert"
    ON public.cabin_custom_amenities
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.cabins c
            WHERE c.id = cabin_id
              AND c.host_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "cabin_custom_amenities_host_select" ON public.cabin_custom_amenities;
CREATE POLICY "cabin_custom_amenities_host_select"
    ON public.cabin_custom_amenities
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.cabins c
            WHERE c.id = cabin_id
              AND c.host_id = auth.uid()
        )
    );

-- Guest-visible reads (active cabins only) are enforced in API query layers for now.

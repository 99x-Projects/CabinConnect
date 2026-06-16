-- Amenity catalog schema for Cabin Profile Registration / Unit 01.
-- Execute in Supabase SQL editor or migrations pipeline.

CREATE TABLE IF NOT EXISTS public.amenities (
    id uuid PRIMARY KEY,
    display_name text NOT NULL UNIQUE CHECK (length(trim(display_name)) > 0),
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "amenities_authenticated_read" ON public.amenities;
CREATE POLICY "amenities_authenticated_read"
    ON public.amenities
    FOR SELECT
    TO authenticated
    USING (true);

-- Seed set for initial catalog.
INSERT INTO public.amenities (id, display_name)
VALUES
    ('3ebc2282-9a9c-4d8b-a367-13de37f59c5d', 'Wi-Fi'),
    ('1294a906-605d-4ce8-b53c-b58844da3e03', 'Fireplace'),
    ('53b28da2-7d5c-48ff-ab72-b947af80f386', 'Parking'),
    ('2d5f8838-6f90-4472-badf-bfce641f3287', 'Pet-friendly'),
    ('8778459f-73c0-40f0-966a-b0ce8d5a7787', 'Kitchen')
ON CONFLICT (id) DO NOTHING;

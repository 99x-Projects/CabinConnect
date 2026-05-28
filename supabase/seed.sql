-- ============================================================================
-- supabase/seed.sql
-- ----------------------------------------------------------------------------
-- Seed data for local-dev and dev-cloud. MUST be idempotent — use
-- `INSERT ... ON CONFLICT DO NOTHING` or equivalent patterns. Runs after all
-- migrations on `supabase db reset`.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- communities — admin-curated registry. UUIDs are stable and MUST NOT change;
-- other modules (Events, Groceries, ToolShare) reference these ids.
-- ---------------------------------------------------------------------------
INSERT INTO public.communities (id, name, region, active, created_at) VALUES
    ('11111111-aaaa-4000-8000-000000000001', 'Aspen Hollow Resort',     'Colorado, USA',       true,  now()),
    ('11111111-aaaa-4000-8000-000000000002', 'Birch Lake Community',    'Ontario, Canada',     true,  now()),
    ('11111111-aaaa-4000-8000-000000000003', 'Cedar Ridge Estates',     'British Columbia',    true,  now()),
    ('11111111-aaaa-4000-8000-000000000004', 'Driftwood Bay',           'Maine, USA',          true,  now()),
    ('11111111-aaaa-4000-8000-000000000005', 'Evergreen Pines Reserve', 'Oregon, USA',         false, now())
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- amenities — curated enum-style reference for the codes a cabin may claim
-- under `cabins.amenities text[]`. Adding a new amenity is a seed-only change;
-- the .NET API validates POST /api/cabins amenity codes against the active
-- rows in this table. Codes are stable lowercase snake_case identifiers.
-- ---------------------------------------------------------------------------
INSERT INTO public.amenities (code, name, active) VALUES
    ('wifi',          'Wi-Fi',                true),
    ('parking',       'On-site parking',      true),
    ('kitchen',       'Full kitchen',         true),
    ('washer',        'Washer',               true),
    ('dryer',         'Dryer',                true),
    ('heating',       'Heating',              true),
    ('air_conditioning', 'Air conditioning',  true),
    ('fireplace',     'Fireplace',            true),
    ('hot_tub',       'Hot tub',              true),
    ('sauna',         'Sauna',                true),
    ('bbq',           'BBQ / grill',          true),
    ('deck',          'Deck or patio',        true),
    ('lake_access',   'Lake access',          true),
    ('ski_storage',   'Ski storage',          true),
    ('pet_friendly',  'Pet friendly',         true)
ON CONFLICT (code) DO NOTHING;


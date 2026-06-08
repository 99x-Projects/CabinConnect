-- Seed: communities and amenities reference data
-- Run AFTER migration 001_cabin_profile_schema.sql

-- ── Communities (Norwegian mountain resorts) ────────────────────────────────
insert into communities (id, name, region) values
    ('a1000000-0000-0000-0000-000000000001', 'Trysil',        'Innlandet'),
    ('a1000000-0000-0000-0000-000000000002', 'Hemsedal',      'Viken'),
    ('a1000000-0000-0000-0000-000000000003', 'Geilo',         'Viken'),
    ('a1000000-0000-0000-0000-000000000004', 'Beitostølen',   'Innlandet'),
    ('a1000000-0000-0000-0000-000000000005', 'Norefjell',     'Viken'),
    ('a1000000-0000-0000-0000-000000000006', 'Kvitfjell',     'Innlandet'),
    ('a1000000-0000-0000-0000-000000000007', 'Hafjell',       'Innlandet')
on conflict (id) do nothing;

-- ── Amenities (controlled list of 8 agreed in elaboration) ──────────────────
insert into amenities (id, name) values
    ('b2000000-0000-0000-0000-000000000001', 'Wi-Fi'),
    ('b2000000-0000-0000-0000-000000000002', 'Electricity'),
    ('b2000000-0000-0000-0000-000000000003', 'Running water'),
    ('b2000000-0000-0000-0000-000000000004', 'Heating'),
    ('b2000000-0000-0000-0000-000000000005', 'Kitchen'),
    ('b2000000-0000-0000-0000-000000000006', 'Parking'),
    ('b2000000-0000-0000-0000-000000000007', 'Sauna'),
    ('b2000000-0000-0000-0000-000000000008', 'Fireplace')
on conflict (id) do nothing;

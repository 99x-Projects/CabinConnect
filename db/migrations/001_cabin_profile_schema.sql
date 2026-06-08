-- Migration: 001_cabin_profile_schema
-- Applies to: Supabase (PostgreSQL)
-- Run via: Supabase SQL Editor or supabase db push

-- ── Enable UUID generation ─────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── communities (seeded reference data) ────────────────────────────────────
create table if not exists communities (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    region      text not null,
    created_at  timestamptz not null default now()
);

alter table communities enable row level security;

-- Communities are publicly readable (needed to populate the create-cabin form)
create policy "communities_public_read"
    on communities for select
    using (true);

-- ── amenities (seeded reference data) ──────────────────────────────────────
create table if not exists amenities (
    id          uuid primary key default gen_random_uuid(),
    name        text not null unique,
    created_at  timestamptz not null default now()
);

alter table amenities enable row level security;

-- Amenities are publicly readable
create policy "amenities_public_read"
    on amenities for select
    using (true);

-- ── cabins ──────────────────────────────────────────────────────────────────
create table if not exists cabins (
    id              uuid primary key default gen_random_uuid(),
    owner_id        uuid not null references auth.users(id),
    name            text not null check (char_length(trim(name)) between 1 and 100),
    street          text not null check (char_length(street) <= 200),
    postal_code     text not null check (char_length(postal_code) <= 200),
    city            text not null check (char_length(city) <= 200),
    country         text not null default 'NO' check (char_length(country) <= 200),
    community_id    uuid not null references communities(id),
    capacity        int not null check (capacity between 1 and 50),
    is_deleted      boolean not null default false,
    created_at      timestamptz not null default now(),
    created_by      uuid not null references auth.users(id),
    updated_at      timestamptz not null default now(),
    updated_by      uuid not null references auth.users(id)
);

create index if not exists ix_cabins_owner_id on cabins(owner_id);
create index if not exists ix_cabins_owner_active on cabins(owner_id) where is_deleted = false;

alter table cabins enable row level security;

-- Owner can read their own non-deleted cabins
create policy "cabins_owner_select"
    on cabins for select
    using (owner_id = auth.uid() and is_deleted = false);

-- Owner can insert their own cabins (owner_id enforced via check)
create policy "cabins_owner_insert"
    on cabins for insert
    with check (owner_id = auth.uid());

-- Owner can update their own non-deleted cabins
create policy "cabins_owner_update"
    on cabins for update
    using (owner_id = auth.uid() and is_deleted = false)
    with check (owner_id = auth.uid());

-- ── cabin_amenities (join table) ─────────────────────────────────────────────
create table if not exists cabin_amenities (
    cabin_id    uuid not null references cabins(id) on delete cascade,
    amenity_id  uuid not null references amenities(id),
    primary key (cabin_id, amenity_id)
);

create index if not exists ix_cabin_amenities_cabin_id on cabin_amenities(cabin_id);

alter table cabin_amenities enable row level security;

-- Owner can read amenities for their own non-deleted cabins
create policy "cabin_amenities_owner_select"
    on cabin_amenities for select
    using (
        exists (
            select 1 from cabins c
            where c.id = cabin_id
              and c.owner_id = auth.uid()
              and c.is_deleted = false
        )
    );

-- Owner can insert amenities for their own cabins
create policy "cabin_amenities_owner_insert"
    on cabin_amenities for insert
    with check (
        exists (
            select 1 from cabins c
            where c.id = cabin_id
              and c.owner_id = auth.uid()
        )
    );

-- Owner can delete amenities for their own non-deleted cabins
create policy "cabin_amenities_owner_delete"
    on cabin_amenities for delete
    using (
        exists (
            select 1 from cabins c
            where c.id = cabin_id
              and c.owner_id = auth.uid()
              and c.is_deleted = false
        )
    );

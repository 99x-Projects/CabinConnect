-- Migration: create cabins table with RLS
-- Depends on: auth.users (Supabase built-in)

create table if not exists cabins (
    id          uuid primary key default gen_random_uuid(),
    owner_id    uuid not null references auth.users(id) on delete cascade,
    name        text not null check (char_length(name) <= 200),
    location    text not null check (char_length(location) <= 500),
    capacity    int  not null check (capacity >= 1),
    amenities   text[] not null default '{}',
    status      text not null default 'Active' check (status in ('Active', 'Inactive')),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- Row-Level Security (EC-007: owners can only see and modify their own cabins)
alter table cabins enable row level security;

create policy "Owners can read their own cabins"
    on cabins for select
    using (auth.uid() = owner_id);

create policy "Owners can insert their own cabins"
    on cabins for insert
    with check (auth.uid() = owner_id);

create policy "Owners can update their own cabins"
    on cabins for update
    using (auth.uid() = owner_id)
    with check (auth.uid() = owner_id);

create policy "Owners can delete their own cabins"
    on cabins for delete
    using (auth.uid() = owner_id);

-- Auto-update updated_at on every row mutation
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger cabins_updated_at
    before update on cabins
    for each row execute function update_updated_at();

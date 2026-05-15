-- Enable UUID generation
create extension if not exists "pgcrypto";

-- cabins
create table cabins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  capacity integer not null check (capacity > 0),
  host_id uuid not null references auth.users(id),
  base_rate numeric(10,2) not null check (base_rate >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table cabins enable row level security;

create policy "Hosts manage their own cabins"
  on cabins for all
  using (auth.uid() = host_id);

create policy "Guests can view active cabins"
  on cabins for select
  using (is_active = true);

-- bookings
create table bookings (
  id uuid primary key default gen_random_uuid(),
  cabin_id uuid not null references cabins(id),
  guest_id uuid not null references auth.users(id),
  check_in date not null,
  check_out date not null,
  status text not null default 'Pending'
    check (status in ('Pending','Confirmed','Cancelled','Completed','NoShow')),
  total_price numeric(10,2) not null check (total_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_out_after_check_in check (check_out > check_in)
);

alter table bookings enable row level security;

create policy "Guests manage their own bookings"
  on bookings for all
  using (auth.uid() = guest_id);

create policy "Hosts view bookings for their cabins"
  on bookings for select
  using (
    cabin_id in (select id from cabins where host_id = auth.uid())
  );

-- holds (temporary, expiry enforced in application layer + TTL index)
create table holds (
  id uuid primary key default gen_random_uuid(),
  cabin_id uuid not null references cabins(id),
  guest_id uuid not null references auth.users(id),
  check_in date not null,
  check_out date not null,
  expires_at timestamptz not null,
  constraint check_out_after_check_in check (check_out > check_in)
);

alter table holds enable row level security;

create policy "Guests manage their own holds"
  on holds for all
  using (auth.uid() = guest_id);

-- blackout_dates
create table blackout_dates (
  id uuid primary key default gen_random_uuid(),
  cabin_id uuid not null references cabins(id),
  start_date date not null,
  end_date date not null,
  reason text not null default '',
  constraint end_after_start check (end_date >= start_date)
);

alter table blackout_dates enable row level security;

create policy "Hosts manage blackout dates for their cabins"
  on blackout_dates for all
  using (
    cabin_id in (select id from cabins where host_id = auth.uid())
  );

-- seasonal_rates
create table seasonal_rates (
  id uuid primary key default gen_random_uuid(),
  cabin_id uuid not null references cabins(id),
  start_date date not null,
  end_date date not null,
  nightly_rate numeric(10,2) not null check (nightly_rate >= 0),
  constraint end_after_start check (end_date >= start_date)
);

alter table seasonal_rates enable row level security;

create policy "Hosts manage seasonal rates for their cabins"
  on seasonal_rates for all
  using (
    cabin_id in (select id from cabins where host_id = auth.uid())
  );

create policy "Guests can view seasonal rates"
  on seasonal_rates for select
  using (true);

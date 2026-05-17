-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- amenity_tags (lookup table — no RLS, public read)
-- ============================================================
create table amenity_tags (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

insert into amenity_tags (name) values
  ('Air Conditioner'),
  ('Fireplace'),
  ('Generator'),
  ('Heater'),
  ('Hot Water'),
  ('Kitchen'),
  ('Parking'),
  ('Washer/Dryer'),
  ('Water Storage'),
  ('WiFi');

-- ============================================================
-- cabins
-- ============================================================
create table cabins (
  id          uuid    primary key default gen_random_uuid(),
  name        text    not null check (char_length(name) <= 512),
  location    text    not null,
  capacity    integer not null check (capacity > 0),
  description text,
  host_id     uuid    not null references auth.users(id),
  base_rate   numeric(10,2) not null default 0 check (base_rate >= 0),
  is_active   boolean not null default true,
  version     integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- EC-013: cabin name must be unique per host
  constraint cabins_host_name_unique unique (host_id, name)
);

alter table cabins enable row level security;

create policy "Hosts manage their own cabins"
  on cabins for all
  using (auth.uid() = host_id);

create policy "Guests can view active cabins"
  on cabins for select
  using (is_active = true);

-- ============================================================
-- cabin_amenity_tags (join table)
-- ============================================================
create table cabin_amenity_tags (
  cabin_id       uuid not null references cabins(id) on delete cascade,
  amenity_tag_id uuid not null references amenity_tags(id),
  primary key (cabin_id, amenity_tag_id)
);

alter table cabin_amenity_tags enable row level security;

create policy "Hosts manage amenity tags for their cabins"
  on cabin_amenity_tags for all
  using (cabin_id in (select id from cabins where host_id = auth.uid()));

create policy "Anyone can view cabin amenity tags"
  on cabin_amenity_tags for select
  using (true);

-- ============================================================
-- cabin_key_info (sensitive operational details — host-only)
-- ============================================================
create table cabin_key_info (
  id                 uuid primary key default gen_random_uuid(),
  cabin_id           uuid not null unique references cabins(id) on delete cascade,
  access_codes       text,
  emergency_contacts text,
  house_rules        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table cabin_key_info enable row level security;

-- Only the owning host can read or write key info (EC-007)
create policy "Hosts manage key info for their cabins"
  on cabin_key_info for all
  using (cabin_id in (select id from cabins where host_id = auth.uid()));

-- ============================================================
-- key_info_reveal_log (audit trail for reveal=true requests)
-- ============================================================
create table key_info_reveal_log (
  id          uuid primary key default gen_random_uuid(),
  cabin_id    uuid not null references cabins(id),
  host_id     uuid not null references auth.users(id),
  revealed_at timestamptz not null default now()
);

alter table key_info_reveal_log enable row level security;

create policy "Hosts can log their own reveal events"
  on key_info_reveal_log for insert
  with check (host_id = auth.uid());

create policy "Hosts can view their own reveal log"
  on key_info_reveal_log for select
  using (host_id = auth.uid());

-- ============================================================
-- bookings
-- ============================================================
create table bookings (
  id          uuid primary key default gen_random_uuid(),
  cabin_id    uuid not null references cabins(id),
  guest_id    uuid not null references auth.users(id),
  check_in    date not null,
  check_out   date not null,
  status      text not null default 'Pending'
    check (status in ('Pending','Confirmed','Cancelled','Completed','NoShow')),
  total_price numeric(10,2) not null check (total_price >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
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

-- ============================================================
-- holds (temporary; expiry enforced at application layer)
-- ============================================================
create table holds (
  id         uuid primary key default gen_random_uuid(),
  cabin_id   uuid not null references cabins(id),
  guest_id   uuid not null references auth.users(id),
  check_in   date not null,
  check_out  date not null,
  expires_at timestamptz not null,
  constraint check_out_after_check_in check (check_out > check_in)
);

alter table holds enable row level security;

create policy "Guests manage their own holds"
  on holds for all
  using (auth.uid() = guest_id);

-- ============================================================
-- blackout_dates
-- ============================================================
create table blackout_dates (
  id         uuid primary key default gen_random_uuid(),
  cabin_id   uuid not null references cabins(id),
  start_date date not null,
  end_date   date not null,
  reason     text not null default '',
  constraint end_after_start check (end_date >= start_date)
);

alter table blackout_dates enable row level security;

create policy "Hosts manage blackout dates for their cabins"
  on blackout_dates for all
  using (
    cabin_id in (select id from cabins where host_id = auth.uid())
  );

-- ============================================================
-- seasonal_rates
-- ============================================================
create table seasonal_rates (
  id           uuid primary key default gen_random_uuid(),
  cabin_id     uuid not null references cabins(id),
  start_date   date not null,
  end_date     date not null,
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

-- ============================================================
-- user_roles (invitation tracking — written by backend via service role)
-- ============================================================
create table user_roles (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  email        text        not null,
  role         text        not null check (role in ('cabin_owner', 'guest')),
  status       text        not null default 'pending' check (status in ('pending', 'active')),
  invited_at   timestamptz not null default now(),
  accepted_at  timestamptz,

  constraint user_roles_email_unique unique (email)
);

alter table user_roles enable row level security;

-- Authenticated users can read their own role record (used for post-setup redirect)
create policy "Users can view their own role"
  on user_roles for select
  using (auth.uid() = user_id);

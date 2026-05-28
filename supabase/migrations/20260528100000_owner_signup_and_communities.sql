-- ============================================================================
-- Supabase migration: 20260528100000_owner_signup_and_communities.sql
-- ----------------------------------------------------------------------------
-- Adds RLS policies for the `users` and `communities` tables created by the
-- EF Core migration `OwnerSignupAndCommunities`. Table/column DDL is owned by
-- EF Core; this file owns RLS, GRANTs, triggers, and seed-time concerns only.
-- See docs/migrations.md for the split.
--
-- Note on roles: until the .NET API switches from the `postgres` superuser to
-- the `authenticator` / `authenticated` role pair, RLS is bypassed by the API
-- in practice. The policies are still authored here so they take effect the
-- moment we cut over (planned for the security-hardening bolt).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- A user can read only their own row. `auth.uid()` returns the Supabase user
-- id (the `sub` claim) of the JWT presented on the request.
DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY users_select_own
    ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- A user may insert only a row whose id matches their JWT (lazy provisioning).
DROP POLICY IF EXISTS users_insert_own ON public.users;
CREATE POLICY users_insert_own
    ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- A user may update only their own row, and may not change the primary key.
DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- communities
-- ---------------------------------------------------------------------------
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read the registry. No insert/update/delete
-- policy exists — seeding happens via supabase/seed.sql under the postgres
-- role, which bypasses RLS by design.
DROP POLICY IF EXISTS communities_select_all_authenticated ON public.communities;
CREATE POLICY communities_select_all_authenticated
    ON public.communities
    FOR SELECT
    TO authenticated
    USING (true);

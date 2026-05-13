-- ============================================================
-- BOOKING / CALENDAR MODULE
-- ============================================================

-- Availability windows set by cabin owner
CREATE TABLE public.cabin_availability (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabin_id    UUID NOT NULL REFERENCES public.cabins(id) ON DELETE CASCADE,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE INDEX idx_availability_cabin ON public.cabin_availability(cabin_id);
CREATE INDEX idx_availability_dates ON public.cabin_availability(start_date, end_date);

-- Invites: owner invites people by email
CREATE TABLE public.cabin_invites (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabin_id          UUID NOT NULL REFERENCES public.cabins(id) ON DELETE CASCADE,
  invited_email     TEXT NOT NULL,
  invited_user_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invited_by        UUID NOT NULL REFERENCES public.profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cabin_id, invited_email)
);

CREATE INDEX idx_invites_cabin ON public.cabin_invites(cabin_id);
CREATE INDEX idx_invites_email ON public.cabin_invites(invited_email);

-- Bookings made by invited users
CREATE TABLE public.cabin_bookings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabin_id    UUID NOT NULL REFERENCES public.cabins(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  notes       TEXT,
  status      TEXT NOT NULL DEFAULT 'confirmed'
                CHECK (status IN ('confirmed', 'cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE INDEX idx_bookings_cabin  ON public.cabin_bookings(cabin_id);
CREATE INDEX idx_bookings_user   ON public.cabin_bookings(user_id);
CREATE INDEX idx_bookings_dates  ON public.cabin_bookings(start_date, end_date);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.cabin_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cabin_invites      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cabin_bookings     ENABLE ROW LEVEL SECURITY;

-- Availability: owner full access, invitees read-only
CREATE POLICY "avail_owner" ON public.cabin_availability
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.cabins WHERE id = cabin_id AND owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.cabins WHERE id = cabin_id AND owner_id = auth.uid())
  );

CREATE POLICY "avail_invitee_read" ON public.cabin_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cabin_invites
      WHERE cabin_id = cabin_availability.cabin_id
        AND invited_email = (auth.jwt() ->> 'email')
    )
  );

-- Invites: owner full access, invitee can read their own
CREATE POLICY "invites_owner" ON public.cabin_invites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.cabins WHERE id = cabin_id AND owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.cabins WHERE id = cabin_id AND owner_id = auth.uid())
  );

CREATE POLICY "invites_self_read" ON public.cabin_invites
  FOR SELECT USING (
    invited_email = (auth.jwt() ->> 'email')
  );

-- Bookings: owner sees all, invitee can insert + see all for their cabin, user cancels own
CREATE POLICY "bookings_owner_read" ON public.cabin_bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.cabins WHERE id = cabin_id AND owner_id = auth.uid())
  );

CREATE POLICY "bookings_invitee_read" ON public.cabin_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cabin_invites
      WHERE cabin_id = cabin_bookings.cabin_id
        AND invited_email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "bookings_invitee_insert" ON public.cabin_bookings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.cabin_invites
      WHERE cabin_id = cabin_bookings.cabin_id
        AND invited_email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "bookings_cancel_own" ON public.cabin_bookings
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_owner_cancel" ON public.cabin_bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.cabins WHERE id = cabin_id AND owner_id = auth.uid())
  );

-- ============================================================
-- FUNCTION: resolve invite to user_id on login
-- (call via trigger or on invite creation if user already exists)
-- ============================================================
CREATE OR REPLACE FUNCTION resolve_invite_user_id()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  IF user_email IS NOT NULL THEN
    UPDATE public.cabin_invites
    SET invited_user_id = NEW.id
    WHERE invited_email = user_email
      AND invited_user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_created_resolve_invites
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION resolve_invite_user_id();

-- ============================================================
-- EVENTS MODULE
-- ============================================================

CREATE TABLE public.events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  location        TEXT NOT NULL,
  geo_point       GEOGRAPHY(Point, 4326),
  start_date      TIMESTAMPTZ NOT NULL,
  end_date        TIMESTAMPTZ NOT NULL,
  organizer_id    UUID NOT NULL REFERENCES public.profiles(id),
  resort          TEXT,
  category        TEXT NOT NULL DEFAULT 'other',
  image_url       TEXT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
  max_attendees   INT,
  attendee_count  INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_status        ON public.events(status);
CREATE INDEX idx_events_start_date    ON public.events(start_date);
CREATE INDEX idx_events_resort        ON public.events(resort);
CREATE INDEX idx_events_organizer     ON public.events(organizer_id);

-- RSVPs
CREATE TABLE public.event_rsvps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  status      TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_rsvps_event ON public.event_rsvps(event_id);
CREATE INDEX idx_rsvps_user  ON public.event_rsvps(user_id);

-- ============================================================
-- TRIGGER: keep attendee_count in sync
-- ============================================================
CREATE OR REPLACE FUNCTION sync_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.events
  SET
    attendee_count = (
      SELECT COUNT(*) FROM public.event_rsvps
      WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
        AND status = 'going'
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_attendee_count
AFTER INSERT OR UPDATE OR DELETE ON public.event_rsvps
FOR EACH ROW EXECUTE FUNCTION sync_attendee_count();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone can read published events
CREATE POLICY "events_read_published" ON public.events
  FOR SELECT USING (status = 'published' OR auth.uid() = organizer_id);

-- Authenticated users can create events
CREATE POLICY "events_insert_auth" ON public.events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Organizer or admin can update/cancel
CREATE POLICY "events_update_organizer_or_admin" ON public.events
  FOR UPDATE USING (
    auth.uid() = organizer_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Authenticated users can RSVP
CREATE POLICY "rsvps_manage_own" ON public.event_rsvps
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anyone can read RSVPs
CREATE POLICY "rsvps_read_all" ON public.event_rsvps
  FOR SELECT USING (true);

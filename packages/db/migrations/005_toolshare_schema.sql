-- ============================================================
-- TOOLSHARE MODULE
-- ============================================================

CREATE TABLE public.tools (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  category     TEXT NOT NULL DEFAULT 'other',
  condition    TEXT NOT NULL DEFAULT 'good' CHECK (condition IN ('new', 'good', 'fair', 'worn')),
  photos       TEXT[] NOT NULL DEFAULT '{}',
  location     GEOGRAPHY(Point, 4326),
  resort       TEXT,
  available    BOOLEAN NOT NULL DEFAULT true,
  price_per_day NUMERIC(8,2),
  currency     TEXT NOT NULL DEFAULT 'NOK',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tools_owner     ON public.tools(owner_id);
CREATE INDEX idx_tools_available ON public.tools(available);
CREATE INDEX idx_tools_category  ON public.tools(category);
CREATE INDEX idx_tools_resort    ON public.tools(resort);

-- Borrow requests
CREATE TABLE public.borrow_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id       UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  requester_id  UUID NOT NULL REFERENCES public.profiles(id),
  owner_id      UUID NOT NULL REFERENCES public.profiles(id),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_requests_tool      ON public.borrow_requests(tool_id);
CREATE INDEX idx_requests_requester ON public.borrow_requests(requester_id);
CREATE INDEX idx_requests_owner     ON public.borrow_requests(owner_id);

-- Auto-mark tool unavailable when request approved
CREATE OR REPLACE FUNCTION sync_tool_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE public.tools SET available = false, updated_at = now() WHERE id = NEW.tool_id;
  ELSIF NEW.status = 'returned' THEN
    UPDATE public.tools SET available = true, updated_at = now() WHERE id = NEW.tool_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tool_availability
AFTER UPDATE ON public.borrow_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION sync_tool_availability();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.tools           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can read available tools
CREATE POLICY "tools_read_available" ON public.tools
  FOR SELECT USING (available = true OR auth.uid() = owner_id);

-- Owner can do everything on their own tools
CREATE POLICY "tools_owner_all" ON public.tools
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Authenticated users can read requests they're part of
CREATE POLICY "requests_read_involved" ON public.borrow_requests
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- Auth users can create requests
CREATE POLICY "requests_insert_auth" ON public.borrow_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Owner can update (approve/reject/return)
CREATE POLICY "requests_update_owner" ON public.borrow_requests
  FOR UPDATE USING (auth.uid() = owner_id);

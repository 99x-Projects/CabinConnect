-- ============================================================
-- GROCERIES MODULE
-- ============================================================

CREATE TABLE public.grocery_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cabin_id          UUID REFERENCES public.cabins(id),
  items             JSONB NOT NULL DEFAULT '[]',
  supermarket       TEXT NOT NULL DEFAULT 'RIMA',
  delivery_address  TEXT NOT NULL,
  pickup_deadline   TIMESTAMPTZ NOT NULL,
  notes             TEXT,
  status            TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','submitted','volunteer_found','out_for_delivery','delivered','no_volunteer','cancelled')),
  volunteer_id      UUID REFERENCES public.profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user      ON public.grocery_orders(user_id);
CREATE INDEX idx_orders_status    ON public.grocery_orders(status);
CREATE INDEX idx_orders_deadline  ON public.grocery_orders(pickup_deadline);
CREATE INDEX idx_orders_volunteer ON public.grocery_orders(volunteer_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.grocery_orders ENABLE ROW LEVEL SECURITY;

-- Owner sees their own orders
CREATE POLICY "orders_owner" ON public.grocery_orders
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Volunteers can see submitted (unassigned) orders and their own accepted orders
CREATE POLICY "orders_volunteer_read" ON public.grocery_orders
  FOR SELECT USING (
    status = 'submitted'
    OR auth.uid() = volunteer_id
  );

-- Volunteers can update (accept) submitted orders
CREATE POLICY "orders_volunteer_accept" ON public.grocery_orders
  FOR UPDATE USING (
    (status = 'submitted' AND auth.uid() IS NOT NULL)  -- accept
    OR auth.uid() = volunteer_id                        -- update their own accepted
  );

-- ============================================================
-- FUNCTION: auto-set no_volunteer when deadline passes
-- (call via cron or pg_cron if available, otherwise handled by API)
-- ============================================================
CREATE OR REPLACE FUNCTION expire_undelivered_orders()
RETURNS void AS $$
BEGIN
  UPDATE public.grocery_orders
  SET status = 'no_volunteer', updated_at = now()
  WHERE status = 'submitted'
    AND pickup_deadline < now();
END;
$$ LANGUAGE plpgsql;

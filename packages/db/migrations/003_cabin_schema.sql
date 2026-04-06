-- ============================================================
-- MYCABIN MODULE
-- ============================================================

CREATE TABLE public.cabins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  location    GEOGRAPHY(Point, 4326),
  size_m2     NUMERIC(7,2),
  year_built  SMALLINT,
  bedrooms    SMALLINT,
  resort      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cabins_owner ON public.cabins(owner_id);

-- Maintenance records
CREATE TABLE public.maintenance_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabin_id      UUID NOT NULL REFERENCES public.cabins(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  date          DATE NOT NULL,
  cost          NUMERIC(10,2),
  category      TEXT NOT NULL DEFAULT 'other',
  completed_by  TEXT,
  next_due_date DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_maintenance_cabin ON public.maintenance_records(cabin_id);
CREATE INDEX idx_maintenance_date ON public.maintenance_records(cabin_id, date DESC);

-- Ownership costs
CREATE TABLE public.ownership_costs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabin_id    UUID NOT NULL REFERENCES public.cabins(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'other',
  amount      NUMERIC(12,2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'NOK',
  frequency   TEXT NOT NULL DEFAULT 'monthly',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_costs_cabin ON public.ownership_costs(cabin_id);

-- Visitor instructions (one per cabin)
CREATE TABLE public.visitor_instructions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabin_id            UUID NOT NULL REFERENCES public.cabins(id) ON DELETE CASCADE UNIQUE,
  access_code         TEXT,
  wifi_name           TEXT,
  wifi_password       TEXT,
  parking_info        TEXT,
  house_rules         TEXT,
  emergency_contacts  JSONB NOT NULL DEFAULT '[]',
  check_in_info       TEXT,
  check_out_info      TEXT,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS POLICIES — CABINS (owner only)
-- ============================================================
ALTER TABLE public.cabins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ownership_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_instructions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cabins_owner_all" ON public.cabins
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "maintenance_owner_all" ON public.maintenance_records
  USING (EXISTS (SELECT 1 FROM public.cabins WHERE id = cabin_id AND owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.cabins WHERE id = cabin_id AND owner_id = auth.uid()));

CREATE POLICY "costs_owner_all" ON public.ownership_costs
  USING (EXISTS (SELECT 1 FROM public.cabins WHERE id = cabin_id AND owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.cabins WHERE id = cabin_id AND owner_id = auth.uid()));

CREATE POLICY "instructions_owner_all" ON public.visitor_instructions
  USING (EXISTS (SELECT 1 FROM public.cabins WHERE id = cabin_id AND owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.cabins WHERE id = cabin_id AND owner_id = auth.uid()));

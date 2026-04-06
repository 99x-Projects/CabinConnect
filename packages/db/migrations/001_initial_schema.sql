-- Enable PostGIS extension for geo queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- USERS (extends Supabase Auth users)
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'supplier', 'admin')),
  locale      TEXT NOT NULL DEFAULT 'no' CHECK (locale IN ('no', 'en')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SUPPLIER DIRECTORY
-- ============================================================
CREATE TABLE public.suppliers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  categories    TEXT[] NOT NULL DEFAULT '{}',
  service_areas TEXT[] NOT NULL DEFAULT '{}',
  location      GEOGRAPHY(Point, 4326),
  phone         TEXT,
  email         TEXT,
  website       TEXT,
  description   JSONB NOT NULL DEFAULT '{"no": "", "en": ""}',
  photos        TEXT[] NOT NULL DEFAULT '{}',
  nominated_by  UUID NOT NULL REFERENCES public.profiles(id),
  claimed_by    UUID REFERENCES public.profiles(id),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  avg_rating    NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count  INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_suppliers_status ON public.suppliers(status);
CREATE INDEX idx_suppliers_categories ON public.suppliers USING GIN(categories);
CREATE INDEX idx_suppliers_service_areas ON public.suppliers USING GIN(service_areas);
CREATE INDEX idx_suppliers_location ON public.suppliers USING GIST(location);

-- ============================================================
-- SUPPLIER REVIEWS
-- ============================================================
CREATE TABLE public.supplier_reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id  UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id),
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  job_date     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (supplier_id, user_id)
);

CREATE INDEX idx_reviews_supplier ON public.supplier_reviews(supplier_id);

-- ============================================================
-- SUPPLIER REPLIES
-- ============================================================
CREATE TABLE public.supplier_replies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id    UUID NOT NULL REFERENCES public.supplier_reviews(id) ON DELETE CASCADE,
  supplier_id  UUID NOT NULL REFERENCES public.suppliers(id),
  comment      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (review_id)
);

-- ============================================================
-- TRIGGER: update avg_rating on review insert/delete
-- ============================================================
CREATE OR REPLACE FUNCTION update_supplier_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.suppliers
  SET
    avg_rating   = (SELECT COALESCE(AVG(rating), 0) FROM public.supplier_reviews WHERE supplier_id = COALESCE(NEW.supplier_id, OLD.supplier_id)),
    review_count = (SELECT COUNT(*) FROM public.supplier_reviews WHERE supplier_id = COALESCE(NEW.supplier_id, OLD.supplier_id)),
    updated_at   = now()
  WHERE id = COALESCE(NEW.supplier_id, OLD.supplier_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_supplier_rating
AFTER INSERT OR DELETE ON public.supplier_reviews
FOR EACH ROW EXECUTE FUNCTION update_supplier_rating();

-- Row Level Security policies for CabinConnect
-- Run after 001_initial_schema.sql

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read any profile
CREATE POLICY "profiles_read_all" ON public.profiles
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- SUPPLIERS
-- ============================================================
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved suppliers
CREATE POLICY "suppliers_read_approved" ON public.suppliers
  FOR SELECT USING (status = 'approved' OR auth.uid() = nominated_by OR auth.uid() = claimed_by);

-- Authenticated users can nominate suppliers
CREATE POLICY "suppliers_insert_auth" ON public.suppliers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Claimed supplier or admin can update
CREATE POLICY "suppliers_update_claimed_or_admin" ON public.suppliers
  FOR UPDATE USING (
    auth.uid() = claimed_by
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- REVIEWS
-- ============================================================
ALTER TABLE public.supplier_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews of approved suppliers
CREATE POLICY "reviews_read_all" ON public.supplier_reviews
  FOR SELECT USING (true);

-- Authenticated users can insert (UNIQUE constraint enforces 1 per user/supplier)
CREATE POLICY "reviews_insert_auth" ON public.supplier_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SUPPLIER REPLIES
-- ============================================================
ALTER TABLE public.supplier_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "replies_read_all" ON public.supplier_replies
  FOR SELECT USING (true);

-- Only the claimed supplier can reply
CREATE POLICY "replies_insert_claimed" ON public.supplier_replies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.suppliers
      WHERE id = supplier_id AND claimed_by = auth.uid()
    )
  );

-- ============================================================
-- TRIGGER: auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN others THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

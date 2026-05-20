CREATE TABLE grocery_items (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT            NOT NULL,
    description TEXT,
    unit_price  NUMERIC(10, 2)  NOT NULL,
    category    TEXT            NOT NULL,
    unit        TEXT            NOT NULL,
    available   BOOLEAN         NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;

-- Authenticated users (Hosts) can read only available items
CREATE POLICY "authenticated_read_available_items"
    ON grocery_items
    FOR SELECT
    TO authenticated
    USING (available = true);

-- service_role (used by .NET API for admin operations) bypasses RLS by default;
-- no explicit policy is needed for admin writes

-- CabinConnect Database Migration
-- Run this in the Supabase SQL Editor

-- Create cabins table
CREATE TABLE IF NOT EXISTS cabins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity >= 1),
    amenities TEXT[] DEFAULT '{}',
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for owner lookups
CREATE INDEX IF NOT EXISTS idx_cabins_owner_id ON cabins(owner_id);

-- Enable Row Level Security
ALTER TABLE cabins ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own cabins
CREATE POLICY "Users can view own cabins"
    ON cabins
    FOR SELECT
    USING (auth.uid() = owner_id);

-- RLS Policy: Users can only insert their own cabins
CREATE POLICY "Users can insert own cabins"
    ON cabins
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- RLS Policy: Users can only update their own cabins
CREATE POLICY "Users can update own cabins"
    ON cabins
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- RLS Policy: Users can only delete their own cabins
CREATE POLICY "Users can delete own cabins"
    ON cabins
    FOR DELETE
    USING (auth.uid() = owner_id);

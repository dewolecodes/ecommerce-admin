-- Migration: create staff table for ecommerce-admin admin users
-- Date: 2025-12-26
-- Run this on your Supabase Postgres database (psql or Supabase SQL editor)

-- Enable pgcrypto for gen_random_uuid (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create `staff` table
CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  role text DEFAULT 'admin',
  phone text,
  avatar_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Optional index to speed lookups by email (unique already implies index)
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff (email);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_staff_updated_at ON public.staff;
CREATE TRIGGER trg_staff_updated_at
BEFORE UPDATE ON public.staff
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Grant minimal privileges for an admin role if you use a dedicated role
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO my_admin_role;

-- Migration: create staff table for ecommerce-admin admin users
-- Date: 2025-12-26
-- Run this on your Supabase Postgres database (psql or Supabase SQL editor)

-- Enable pgcrypto for gen_random_uuid (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create `staff` table
CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The staff member's email address (used for invites/login)
  email text NOT NULL,
  full_name text,
  -- Role within the merchant/team: 'owner','admin','manager','viewer', etc.
  role text DEFAULT 'admin',
  phone text,
  avatar_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  -- Multi-tenant fields
  merchant_id uuid NOT NULL,
  -- Optional link to the Supabase Auth user (auth.uid)
  auth_user_id uuid,
  -- Invitation/status management
  status text DEFAULT 'invited', -- invited | active | disabled
  invited_at timestamptz,
  invite_token text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Optional index to speed lookups by email (unique already implies index)
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff (email);
CREATE INDEX IF NOT EXISTS idx_staff_merchant_id ON public.staff (merchant_id);

-- If you have a `merchants` table, you may want to add a foreign key:
-- ALTER TABLE public.staff ADD CONSTRAINT fk_staff_merchant FOREIGN KEY (merchant_id) REFERENCES public.merchants(id) ON DELETE CASCADE;

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

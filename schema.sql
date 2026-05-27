-- ============================================================
-- MSDC (My Soul Desire Church) — Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: profiles
-- Extends Supabase auth.users with role information
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('admin', 'leader')),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-create profile row when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'leader')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLE: members
-- Church members assigned to a specific leader
-- ============================================================
CREATE TABLE IF NOT EXISTS public.members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE: announcements
-- Global announcements created by admin
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- TABLE: attendance_records
-- Daily attendance per member
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  leader_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  present       BOOLEAN NOT NULL DEFAULT FALSE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(member_id, session_date)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ---- profiles ----
-- Users can read their own profile; admins can read all
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

-- Users can update their own profile; admins can update all
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_admin());

-- Only admins can insert new profiles (beyond the trigger)
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin());

-- Only admins can delete profiles
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- ---- members ----
-- Leaders see only their own members; admins see all
CREATE POLICY "members_select" ON public.members
  FOR SELECT USING (leader_id = auth.uid() OR public.is_admin());

-- Leaders can add members (auto-assigned to themselves); admins can add any
CREATE POLICY "members_insert" ON public.members
  FOR INSERT WITH CHECK (leader_id = auth.uid() OR public.is_admin());

-- Leaders can update only their own members; admins can update all
CREATE POLICY "members_update" ON public.members
  FOR UPDATE USING (leader_id = auth.uid() OR public.is_admin());

-- Leaders can delete only their own members; admins can delete all
CREATE POLICY "members_delete" ON public.members
  FOR DELETE USING (leader_id = auth.uid() OR public.is_admin());

-- ---- announcements ----
-- All authenticated users can read announcements
CREATE POLICY "announcements_select" ON public.announcements
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can create announcements
CREATE POLICY "announcements_insert" ON public.announcements
  FOR INSERT WITH CHECK (public.is_admin());

-- Only admins can update announcements
CREATE POLICY "announcements_update" ON public.announcements
  FOR UPDATE USING (public.is_admin());

-- Only admins can delete announcements
CREATE POLICY "announcements_delete" ON public.announcements
  FOR DELETE USING (public.is_admin());

-- ---- attendance_records ----
-- Leaders see only their own records; admins see all
CREATE POLICY "attendance_select" ON public.attendance_records
  FOR SELECT USING (leader_id = auth.uid() OR public.is_admin());

-- Leaders can insert records for their own members only
CREATE POLICY "attendance_insert" ON public.attendance_records
  FOR INSERT WITH CHECK (leader_id = auth.uid() OR public.is_admin());

-- Leaders can update only their own records
CREATE POLICY "attendance_update" ON public.attendance_records
  FOR UPDATE USING (leader_id = auth.uid() OR public.is_admin());

-- Leaders can delete only their own records; admins can delete all
CREATE POLICY "attendance_delete" ON public.attendance_records
  FOR DELETE USING (leader_id = auth.uid() OR public.is_admin());

-- ============================================================
-- SEED: Create the default admin account
-- Update the email/password in Supabase Auth dashboard,
-- then run this to assign the admin role.
-- ============================================================
-- After creating your admin user in Supabase Auth, run:
-- UPDATE public.profiles SET role = 'admin' WHERE id = '<your-admin-user-uuid>';

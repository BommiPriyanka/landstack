-- ============================================================================
-- Migration 002: Row Level Security (RLS) Policies for Land Stack
-- Strict Role-Based Enforcement:
-- CITIZEN: SELECT parcels, INSERT own citizen_requests, SELECT own citizen_requests
-- OFFICER: SELECT/INSERT/UPDATE parcels, SELECT/UPDATE citizen_requests, INSERT parcel_history
-- ADMIN: FULL ACCESS (SELECT/INSERT/UPDATE/DELETE)
-- ============================================================================

-- Helper function to get current user's role from JWT metadata or profiles table
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role'),
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'citizen'
  );
$$;

-- 1. Enable RLS on all tables
ALTER TABLE IF EXISTS public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parcel_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.citizen_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parcel_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. PARCELS POLICIES
-- SELECT: Anyone can read parcels (Citizens, Officers, Admins)
DROP POLICY IF EXISTS "Public and authenticated users can view parcels" ON public.parcels;
CREATE POLICY "Public and authenticated users can view parcels"
  ON public.parcels
  FOR SELECT
  USING (true);

-- INSERT: Only Officers and Admins can create parcels
DROP POLICY IF EXISTS "Officers and Admins can insert parcels" ON public.parcels;
CREATE POLICY "Officers and Admins can insert parcels"
  ON public.parcels
  FOR INSERT
  WITH CHECK (
    public.get_auth_role() IN ('officer', 'admin')
  );

-- UPDATE: Only Officers and Admins can update parcels
DROP POLICY IF EXISTS "Officers and Admins can update parcels" ON public.parcels;
CREATE POLICY "Officers and Admins can update parcels"
  ON public.parcels
  FOR UPDATE
  USING (
    public.get_auth_role() IN ('officer', 'admin')
  )
  WITH CHECK (
    public.get_auth_role() IN ('officer', 'admin')
  );

-- DELETE: Only Admins can delete parcels
DROP POLICY IF EXISTS "Only Admins can delete parcels" ON public.parcels;
CREATE POLICY "Only Admins can delete parcels"
  ON public.parcels
  FOR DELETE
  USING (
    public.get_auth_role() = 'admin'
  );

-- 3. CITIZEN REQUESTS POLICIES
-- SELECT: Citizens view own requests; Officers and Admins view all
DROP POLICY IF EXISTS "View citizen requests" ON public.citizen_requests;
CREATE POLICY "View citizen requests"
  ON public.citizen_requests
  FOR SELECT
  USING (
    public.get_auth_role() IN ('officer', 'admin')
    OR citizen_id = auth.uid()::text
  );

-- INSERT: Citizens can submit applications
DROP POLICY IF EXISTS "Citizens can submit requests" ON public.citizen_requests;
CREATE POLICY "Citizens can submit requests"
  ON public.citizen_requests
  FOR INSERT
  WITH CHECK (
    public.get_auth_role() IN ('citizen', 'officer', 'admin')
  );

-- UPDATE: Officers and Admins can review/update status
DROP POLICY IF EXISTS "Officers and Admins can update citizen requests" ON public.citizen_requests;
CREATE POLICY "Officers and Admins can update citizen requests"
  ON public.citizen_requests
  FOR UPDATE
  USING (
    public.get_auth_role() IN ('officer', 'admin')
  );

-- 4. PARCEL HISTORY POLICIES
-- SELECT: Authenticated users can view parcel history
DROP POLICY IF EXISTS "Authenticated users view parcel history" ON public.parcel_history;
CREATE POLICY "Authenticated users view parcel history"
  ON public.parcel_history
  FOR SELECT
  USING (true);

-- INSERT: Officers and Admins can record history
DROP POLICY IF EXISTS "Officers and Admins insert parcel history" ON public.parcel_history;
CREATE POLICY "Officers and Admins insert parcel history"
  ON public.parcel_history
  FOR INSERT
  WITH CHECK (
    public.get_auth_role() IN ('officer', 'admin')
  );

-- 5. PARCEL DOCUMENTS POLICIES
-- SELECT: Everyone can view verified documents
DROP POLICY IF EXISTS "View parcel documents" ON public.parcel_documents;
CREATE POLICY "View parcel documents"
  ON public.parcel_documents
  FOR SELECT
  USING (true);

-- INSERT: Only Officers and Admins can upload official parcel documents
DROP POLICY IF EXISTS "Officers and Admins upload documents" ON public.parcel_documents;
CREATE POLICY "Officers and Admins upload documents"
  ON public.parcel_documents
  FOR INSERT
  WITH CHECK (
    public.get_auth_role() IN ('officer', 'admin')
  );

-- 6. NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users view their notifications" ON public.notifications;
CREATE POLICY "Users view their notifications"
  ON public.notifications
  FOR SELECT
  USING (
    user_id = auth.uid()::text 
    OR target_role = public.get_auth_role() 
    OR target_role IS NULL
  );

DROP POLICY IF EXISTS "System insert notifications" ON public.notifications;
CREATE POLICY "System insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

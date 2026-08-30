-- ============================================================================
-- Migration 001: Officer Dashboard & Land Governance Schema Extensions
-- Tables: parcel_history, citizen_requests, parcel_documents, notifications
-- ============================================================================

-- 1. Extend profiles table if needed
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS officer_id TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS designation TEXT,
  ADD COLUMN IF NOT EXISTS jurisdiction TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- 2. Extend parcels table with workflow status and officer audit fields
ALTER TABLE IF EXISTS public.parcels 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'VERIFIED',
  ADD COLUMN IF NOT EXISTS verification_remarks TEXT,
  ADD COLUMN IF NOT EXISTS verified_by TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by TEXT;

-- 3. Create parcel_history table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.parcel_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcel_id UUID REFERENCES public.parcels(id) ON DELETE CASCADE,
    ulpin TEXT,
    survey_no TEXT,
    action TEXT NOT NULL, -- PARCEL_CREATED, PARCEL_UPDATED, PARCEL_VERIFIED, PARCEL_REJECTED, etc.
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_role TEXT NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create citizen_requests table (Applications & Petitions)
CREATE TABLE IF NOT EXISTS public.citizen_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number TEXT UNIQUE NOT NULL, -- e.g. REQ-TN-2025-0012
    citizen_id TEXT NOT NULL,
    citizen_name TEXT NOT NULL,
    citizen_email TEXT,
    citizen_phone TEXT,
    parcel_id UUID REFERENCES public.parcels(id) ON DELETE SET NULL,
    ulpin TEXT,
    survey_no TEXT,
    village_name TEXT,
    taluk_name TEXT,
    district_name TEXT,
    request_type TEXT NOT NULL, -- Patta Transfer, Boundary Resurvey, Subdivision, Mutation, Dispute Redressal
    description TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    priority TEXT DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    status TEXT DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, ADDITIONAL_INFORMATION_REQUIRED, APPROVED, REJECTED
    assigned_officer_id TEXT,
    officer_remarks TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create parcel_documents table
CREATE TABLE IF NOT EXISTS public.parcel_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcel_id UUID REFERENCES public.parcels(id) ON DELETE CASCADE,
    ulpin TEXT,
    document_type TEXT NOT NULL, -- Patta / Chitta, A-Register Extract, FMB Sketch, Sale Deed, Encumbrance Certificate
    document_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size_kb INTEGER DEFAULT 120,
    uploaded_by TEXT NOT NULL,
    uploaded_by_name TEXT,
    uploaded_by_role TEXT DEFAULT 'officer',
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT, -- Target user/officer ID, or NULL for all officers
    target_role TEXT, -- 'officer', 'citizen', 'admin'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO', -- 'PARCEL_SUBMITTED', 'VERIFICATION_PENDING', 'REQUEST_NEW', 'CORRECTION_REQ', 'DOC_UPLOADED'
    reference_id TEXT, -- e.g. ULPIN or Request Number
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. High performance indexes for searching & filtering
CREATE INDEX IF NOT EXISTS idx_parcels_survey_no ON public.parcels(survey_no);
CREATE INDEX IF NOT EXISTS idx_parcels_ulpin ON public.parcels(ulpin);
CREATE INDEX IF NOT EXISTS idx_parcels_village_name ON public.parcels(village_name);
CREATE INDEX IF NOT EXISTS idx_parcels_taluk_name ON public.parcels(taluk_name);
CREATE INDEX IF NOT EXISTS idx_parcels_district_name ON public.parcels(district_name);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON public.parcels(status);

CREATE INDEX IF NOT EXISTS idx_parcel_history_parcel_id ON public.parcel_history(parcel_id);
CREATE INDEX IF NOT EXISTS idx_parcel_history_created_at ON public.parcel_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_citizen_requests_status ON public.citizen_requests(status);
CREATE INDEX IF NOT EXISTS idx_citizen_requests_citizen_id ON public.citizen_requests(citizen_id);
CREATE INDEX IF NOT EXISTS idx_citizen_requests_created_at ON public.citizen_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_parcel_documents_parcel_id ON public.parcel_documents(parcel_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON public.notifications(target_role);

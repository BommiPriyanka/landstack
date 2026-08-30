-- ====================================================================
-- LAND STACK - Unified Land Governance Platform (Tamil Nadu)
-- Supabase PostgreSQL + PostGIS Schema
-- ====================================================================

-- 1. Enable PostGIS Extension for geospatial boundary queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Districts Table (38 Districts of Tamil Nadu)
CREATE TABLE IF NOT EXISTS public.districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Taluks Table
CREATE TABLE IF NOT EXISTS public.taluks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(district_id, name)
);

-- 4. Villages Table
CREATE TABLE IF NOT EXISTS public.villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    taluk_id UUID REFERENCES public.taluks(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(taluk_id, name)
);

-- 5. Land Parcels Table (ULPIN Linked)
CREATE TABLE IF NOT EXISTS public.parcels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ulpin VARCHAR(50) NOT NULL UNIQUE,
    survey_no VARCHAR(50) NOT NULL,
    sub_division VARCHAR(50) NOT NULL,
    village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
    district_name VARCHAR(100) NOT NULL,
    taluk_name VARCHAR(100) NOT NULL,
    village_name VARCHAR(100) NOT NULL,
    area_acres NUMERIC(10, 4) NOT NULL,
    land_use VARCHAR(50) DEFAULT 'Dry Land', -- 'Wet Land', 'Dry Land', 'Commercial', 'Residential'
    owner_name VARCHAR(200) NOT NULL,
    aadhaar_hash VARCHAR(64),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Polygon, 4326),
    status VARCHAR(50) DEFAULT 'Clear', -- 'Clear', 'Disputed', 'Mortgaged'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Petitions & Citizen Requests
CREATE TABLE IF NOT EXISTS public.petitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_no VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID,
    citizen_name VARCHAR(200) NOT NULL,
    citizen_email VARCHAR(150),
    parcel_ulpin VARCHAR(50) REFERENCES public.parcels(ulpin) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL, -- 'Patta Transfer', 'RoR Extract', 'Land Ownership Verification', etc.
    status VARCHAR(50) DEFAULT 'Under Review', -- 'Submitted', 'Under Review', 'In Progress', 'Approved', 'Rejected'
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Seed Sample Tamil Nadu Parcels for Erode / Perundurai
INSERT INTO public.districts (name, code, center_lat, center_lng)
VALUES ('Erode', 'ERD', 11.3410, 77.7172)
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
    erode_id UUID;
    perundurai_id UUID;
    village_id UUID;
BEGIN
    SELECT id INTO erode_id FROM public.districts WHERE name = 'Erode' LIMIT 1;

    INSERT INTO public.taluks (district_id, name, center_lat, center_lng)
    VALUES (erode_id, 'Perundurai', 11.2750, 77.5880)
    ON CONFLICT (district_id, name) DO NOTHING
    RETURNING id INTO perundurai_id;

    IF perundurai_id IS NULL THEN
        SELECT id INTO perundurai_id FROM public.taluks WHERE district_id = erode_id AND name = 'Perundurai' LIMIT 1;
    END IF;

    INSERT INTO public.villages (taluk_id, name, center_lat, center_lng)
    VALUES (perundurai_id, 'Ayegoundanpalayam', 11.2740, 77.5870)
    ON CONFLICT (taluk_id, name) DO NOTHING
    RETURNING id INTO village_id;

    IF village_id IS NULL THEN
        SELECT id INTO village_id FROM public.villages WHERE taluk_id = perundurai_id AND name = 'Ayegoundanpalayam' LIMIT 1;
    END IF;

    -- Insert Sample Parcels
    INSERT INTO public.parcels (ulpin, survey_no, sub_division, village_id, district_name, taluk_name, village_name, area_acres, land_use, owner_name, lat, lng, status)
    VALUES 
    ('TN-ERD-125-4A-0001', '125/4A', '125/4A1', village_id, 'Erode', 'Perundurai', 'Ayegoundanpalayam', 1.2500, 'Wet Land', 'Ramasamy G', 11.2740, 77.5870, 'Clear'),
    ('TN-ERD-125-S-0002',  '125/5',  '125/5B',  village_id, 'Erode', 'Perundurai', 'Ayegoundanpalayam', 0.8000, 'Dry Land', 'Murugan P', 11.2745, 77.5875, 'Clear'),
    ('TN-ERD-126-1-0003',  '126/1',  '126/1A',  village_id, 'Erode', 'Perundurai', 'Ayegoundanpalayam', 2.0500, 'Dry Land', 'Lakshmi Ammal', 11.2750, 77.5880, 'Clear')
    ON CONFLICT (ulpin) DO NOTHING;
END $$;

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taluks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petitions ENABLE ROW LEVEL SECURITY;

-- 9. Public Read Policies for transparent public land registry
CREATE POLICY "Allow public read access on districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Allow public read access on taluks" ON public.taluks FOR SELECT USING (true);
CREATE POLICY "Allow public read access on villages" ON public.villages FOR SELECT USING (true);
CREATE POLICY "Allow public read access on parcels" ON public.parcels FOR SELECT USING (true);
CREATE POLICY "Allow public read access on petitions" ON public.petitions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on petitions" ON public.petitions FOR INSERT WITH CHECK (true);

-- ================================================================
-- LAND STACK: PostGIS Parcel Geometry & Ayigoundanpalayam Seed
-- SIH 2026 Problem Statement SIH26014
-- ================================================================

-- 1. Enable PostGIS Extension if not already active
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Ensure parcels table exists with PostGIS geometry column and JSONB fallback
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
    area_sq_meters NUMERIC(12, 2),
    land_use VARCHAR(50) DEFAULT 'Dry Land',
    classification VARCHAR(100) DEFAULT 'Private Land (Ryotwari)',
    owner_name VARCHAR(200) NOT NULL,
    father_husband_name VARCHAR(200) DEFAULT 'Gopalasamy K',
    ownership_type VARCHAR(50) DEFAULT 'Single Owner',
    patta_no VARCHAR(100) DEFAULT 'PATTA-ERD-4521',
    market_value VARCHAR(50) DEFAULT '₹ 45,50,000',
    aadhaar_hash VARCHAR(64) DEFAULT 'XXXX-XXXX-8921',
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    geom geometry(Polygon, 4326),
    coordinates JSONB,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist if table was already created
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS area_sq_meters NUMERIC(12, 2);
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS classification VARCHAR(100) DEFAULT 'Private Land (Ryotwari)';
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS father_husband_name VARCHAR(200) DEFAULT 'Gopalasamy K';
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS ownership_type VARCHAR(50) DEFAULT 'Single Owner';
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS patta_no VARCHAR(100) DEFAULT 'PATTA-ERD-4521';
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS market_value VARCHAR(50) DEFAULT '₹ 45,50,000';
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS aadhaar_hash VARCHAR(64) DEFAULT 'XXXX-XXXX-8921';
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS center_lat DOUBLE PRECISION DEFAULT 11.2740;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS center_lng DOUBLE PRECISION DEFAULT 77.5870;
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS geom geometry(Polygon, 4326);
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS coordinates JSONB;

-- 3. Create GiST Spatial Index on geom column
CREATE INDEX IF NOT EXISTS idx_parcels_geom ON public.parcels USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_parcels_village_name ON public.parcels (village_name);
CREATE INDEX IF NOT EXISTS idx_parcels_survey_no ON public.parcels (survey_no);
CREATE INDEX IF NOT EXISTS idx_parcels_ulpin ON public.parcels (ulpin);

-- 4. Enable Row Level Security & Public Read Policy
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read parcels" ON public.parcels;
CREATE POLICY "Allow public read parcels" ON public.parcels FOR SELECT TO anon, authenticated, public USING (true);

-- 5. Seed Mock Cadastral Parcels for Ayigoundanpalayam (Perundurai / Erode)
DO $$
DECLARE
    v_id UUID;
BEGIN
    -- Find village id from villages table if present
    SELECT id INTO v_id FROM public.villages WHERE name ILIKE '%goundanpalayam%' AND taluk_id IN (
        SELECT id FROM public.taluks WHERE name ILIKE 'Perundurai' LIMIT 1
    ) LIMIT 1;

    -- Parcel 1: 125/4A
    INSERT INTO public.parcels (
        ulpin, survey_no, sub_division, village_id, district_name, taluk_name, village_name,
        area_acres, area_sq_meters, land_use, classification, owner_name, father_husband_name,
        ownership_type, patta_no, market_value, aadhaar_hash, center_lat, center_lng, status,
        coordinates, geom
    ) VALUES (
        'TN-ERD-125-4A-0001', '125/4A', '125/4A1', v_id, 'Erode', 'Perundurai', 'Ayigoundanpalayam',
        1.2500, 5059.00, 'Wet Land (நஞ்சை)', 'Ryotwari Manai / Private Land', 'Ramasamy G', 'Gopalasamy K',
        'Single Owner', 'PATTA-ERD-4521', '₹ 45,50,000', 'XXXX-XXXX-8921', 11.2740, 77.5870, 'Active',
        '[[11.2748, 77.5862], [11.2743, 77.5882], [11.2731, 77.5876], [11.2736, 77.5857]]'::jsonb,
        ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[77.5862,11.2748],[77.5882,11.2743],[77.5876,11.2731],[77.5857,11.2736],[77.5862,11.2748]]]}'), 4326)
    ) ON CONFLICT (ulpin) DO UPDATE SET
        coordinates = EXCLUDED.coordinates,
        geom = EXCLUDED.geom,
        owner_name = EXCLUDED.owner_name,
        area_acres = EXCLUDED.area_acres;

    -- Parcel 2: 125/4
    INSERT INTO public.parcels (
        ulpin, survey_no, sub_division, village_id, district_name, taluk_name, village_name,
        area_acres, area_sq_meters, land_use, classification, owner_name, father_husband_name,
        ownership_type, patta_no, market_value, aadhaar_hash, center_lat, center_lng, status,
        coordinates, geom
    ) VALUES (
        'TN-ERD-125-4-0099', '125/4', '125/4', v_id, 'Erode', 'Perundurai', 'Ayigoundanpalayam',
        1.1000, 4451.54, 'Dry Land (புஞ்சை)', 'Ryotwari / Private Land', 'N. Kandasamy', 'Nachimuthu Gounder',
        'Single Owner', 'PATTA-ERD-4529', '₹ 38,20,000', 'XXXX-XXXX-4102', 11.2752, 77.5855, 'Active',
        '[[11.2758, 77.5845], [11.2755, 77.5866], [11.2746, 77.5861], [11.2749, 77.5840]]'::jsonb,
        ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[77.5845,11.2758],[77.5866,11.2755],[77.5861,11.2746],[77.5840,11.2749],[77.5845,11.2758]]]}'), 4326)
    ) ON CONFLICT (ulpin) DO UPDATE SET
        coordinates = EXCLUDED.coordinates,
        geom = EXCLUDED.geom;

    -- Parcel 3: 125/2
    INSERT INTO public.parcels (
        ulpin, survey_no, sub_division, village_id, district_name, taluk_name, village_name,
        area_acres, area_sq_meters, land_use, classification, owner_name, father_husband_name,
        ownership_type, patta_no, market_value, aadhaar_hash, center_lat, center_lng, status,
        coordinates, geom
    ) VALUES (
        'TN-ERD-125-2-0098', '125/2', '125/2', v_id, 'Erode', 'Perundurai', 'Ayigoundanpalayam',
        0.9500, 3844.52, 'Wet Land (நஞ்சை)', 'Ryotwari / Private Land', 'S. Muthusamy', 'Subramaniam P',
        'Single Owner', 'PATTA-ERD-4518', '₹ 33,00,000', 'XXXX-XXXX-9941', 11.2756, 77.5875, 'Active',
        '[[11.2764, 77.5868], [11.2759, 77.5888], [11.2748, 77.5882], [11.2753, 77.5862]]'::jsonb,
        ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[77.5868,11.2764],[77.5888,11.2759],[77.5882,11.2748],[77.5862,11.2753],[77.5868,11.2764]]]}'), 4326)
    ) ON CONFLICT (ulpin) DO UPDATE SET
        coordinates = EXCLUDED.coordinates,
        geom = EXCLUDED.geom;

    -- Parcel 4: 124/2
    INSERT INTO public.parcels (
        ulpin, survey_no, sub_division, village_id, district_name, taluk_name, village_name,
        area_acres, area_sq_meters, land_use, classification, owner_name, father_husband_name,
        ownership_type, patta_no, market_value, aadhaar_hash, center_lat, center_lng, status,
        coordinates, geom
    ) VALUES (
        'TN-ERD-124-2-0097', '124/2', '124/2', v_id, 'Erode', 'Perundurai', 'Ayigoundanpalayam',
        1.4500, 5867.95, 'Dry Land (புஞ்சை)', 'Ryotwari / Private Land', 'V. Palanisamy', 'Velappa Gounder',
        'Joint Owner', 'PATTA-ERD-4490', '₹ 48,00,000', 'XXXX-XXXX-3382', 11.2754, 77.5898, 'Active',
        '[[11.2762, 77.5890], [11.2757, 77.5910], [11.2745, 77.5904], [11.2750, 77.5884]]'::jsonb,
        ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[77.5890,11.2762],[77.5910,11.2757],[77.5904,11.2745],[77.5884,11.2750],[77.5890,11.2762]]]}'), 4326)
    ) ON CONFLICT (ulpin) DO UPDATE SET
        coordinates = EXCLUDED.coordinates,
        geom = EXCLUDED.geom;

    -- Parcel 5: 125/5
    INSERT INTO public.parcels (
        ulpin, survey_no, sub_division, village_id, district_name, taluk_name, village_name,
        area_acres, area_sq_meters, land_use, classification, owner_name, father_husband_name,
        ownership_type, patta_no, market_value, aadhaar_hash, center_lat, center_lng, status,
        coordinates, geom
    ) VALUES (
        'TN-ERD-125-5-0002', '125/5', '125/5B', v_id, 'Erode', 'Perundurai', 'Ayigoundanpalayam',
        0.8000, 3237.49, 'Dry Land (புஞ்சை)', 'Ryotwari / Private Land', 'Murugan P', 'Periasamy A',
        'Single Owner', 'PATTA-ERD-4522', '₹ 28,80,000', 'XXXX-XXXX-6619', 11.2735, 77.5850, 'Active',
        '[[11.2742, 77.5840], [11.2738, 77.5860], [11.2727, 77.5855], [11.2731, 77.5835]]'::jsonb,
        ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[77.5840,11.2742],[77.5860,11.2738],[77.5855,11.2727],[77.5835,11.2731],[77.5840,11.2742]]]}'), 4326)
    ) ON CONFLICT (ulpin) DO UPDATE SET
        coordinates = EXCLUDED.coordinates,
        geom = EXCLUDED.geom;

    -- Parcel 6: 126/1
    INSERT INTO public.parcels (
        ulpin, survey_no, sub_division, village_id, district_name, taluk_name, village_name,
        area_acres, area_sq_meters, land_use, classification, owner_name, father_husband_name,
        ownership_type, patta_no, market_value, aadhaar_hash, center_lat, center_lng, status,
        coordinates, geom
    ) VALUES (
        'TN-ERD-126-1-0003', '126/1', '126/1A', v_id, 'Erode', 'Perundurai', 'Ayigoundanpalayam',
        2.0500, 8296.06, 'Dry Land (புஞ்சை)', 'Ryotwari / Private Land', 'Lakshmi Ammal', 'Rangasamy Naidu',
        'Joint Owner', 'PATTA-ERD-4890', '₹ 72,00,000', 'XXXX-XXXX-5521', 11.2738, 77.5892, 'Active',
        '[[11.2746, 77.5884], [11.2741, 77.5905], [11.2729, 77.5899], [11.2734, 77.5878]]'::jsonb,
        ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[77.5884,11.2746],[77.5905,11.2741],[77.5899,11.2729],[77.5878,11.2734],[77.5884,11.2746]]]}'), 4326)
    ) ON CONFLICT (ulpin) DO UPDATE SET
        coordinates = EXCLUDED.coordinates,
        geom = EXCLUDED.geom;

    -- Parcel 7: 126/3
    INSERT INTO public.parcels (
        ulpin, survey_no, sub_division, village_id, district_name, taluk_name, village_name,
        area_acres, area_sq_meters, land_use, classification, owner_name, father_husband_name,
        ownership_type, patta_no, market_value, aadhaar_hash, center_lat, center_lng, status,
        coordinates, geom
    ) VALUES (
        'TN-ERD-126-3-0004', '126/3', '126/3A', v_id, 'Erode', 'Perundurai', 'Ayigoundanpalayam',
        0.6000, 2428.12, 'Garden Land (தோட்டம்)', 'Ryotwari / Private Land', 'K. Palanisamy', 'Karuppana Gounder',
        'Single Owner', 'PATTA-ERD-5102', '₹ 65,20,000', 'XXXX-XXXX-7714', 11.2727, 77.5868, 'Active',
        '[[11.2734, 77.5858], [11.2730, 77.5878], [11.2718, 77.5873], [11.2722, 77.5853]]'::jsonb,
        ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[77.5858,11.2734],[77.5878,11.2730],[77.5873,11.2718],[77.5853,11.2722],[77.5858,11.2734]]]}'), 4326)
    ) ON CONFLICT (ulpin) DO UPDATE SET
        coordinates = EXCLUDED.coordinates,
        geom = EXCLUDED.geom;

    -- Parcel 8: 127/1
    INSERT INTO public.parcels (
        ulpin, survey_no, sub_division, village_id, district_name, taluk_name, village_name,
        area_acres, area_sq_meters, land_use, classification, owner_name, father_husband_name,
        ownership_type, patta_no, market_value, aadhaar_hash, center_lat, center_lng, status,
        coordinates, geom
    ) VALUES (
        'TN-ERD-127-1-0096', '127/1', '127/1', v_id, 'Erode', 'Perundurai', 'Ayigoundanpalayam',
        1.7500, 7082.01, 'Dry Land (புஞ்சை)', 'Ryotwari / Private Land', 'M. Chinnasamy', 'Marappa Gounder',
        'Single Owner', 'PATTA-ERD-4512', '₹ 56,00,000', 'XXXX-XXXX-1109', 11.2720, 77.5860, 'Active',
        '[[11.2726, 77.5849], [11.2722, 77.5870], [11.2710, 77.5864], [11.2714, 77.5843]]'::jsonb,
        ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[77.5849,11.2726],[77.5870,11.2722],[77.5864,11.2710],[77.5843,11.2714],[77.5849,11.2726]]]}'), 4326)
    ) ON CONFLICT (ulpin) DO UPDATE SET
        coordinates = EXCLUDED.coordinates,
        geom = EXCLUDED.geom;

END $$;

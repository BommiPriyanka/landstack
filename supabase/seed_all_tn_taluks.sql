-- ====================================================================
-- SEED COMPLETE TALUKS FOR ALL DISTRICTS IN TAMIL NADU
-- Run this in Supabase SQL Editor to populate all taluks into your database!
-- ====================================================================

DO $$
DECLARE
    d_id UUID;
BEGIN
    -- 1. ERODE (All 10 Taluks)
    SELECT id INTO d_id FROM public.districts WHERE name = 'Erode';
    IF d_id IS NOT NULL THEN
        INSERT INTO public.taluks (district_id, name, center_lat, center_lng) VALUES
        (d_id, 'Erode', 11.3410, 77.7172),
        (d_id, 'Bhavani', 11.4440, 77.6820),
        (d_id, 'Gobichettipalayam', 11.4550, 77.4430),
        (d_id, 'Perundurai', 11.2750, 77.5880),
        (d_id, 'Nambiyur', 11.4910, 77.2000),
        (d_id, 'Chennimalai', 11.1680, 77.6000),
        (d_id, 'Modakkurichi', 11.2400, 77.7500),
        (d_id, 'Kodumudi', 11.0800, 77.8800),
        (d_id, 'Anthiyur', 11.5800, 77.5900),
        (d_id, 'Thalavadi', 11.7800, 77.0100)
        ON CONFLICT (district_id, name) DO NOTHING;
    END IF;

    -- 2. COIMBATORE (All 11 Taluks)
    SELECT id INTO d_id FROM public.districts WHERE name = 'Coimbatore';
    IF d_id IS NOT NULL THEN
        INSERT INTO public.taluks (district_id, name, center_lat, center_lng) VALUES
        (d_id, 'Coimbatore North', 11.0400, 76.9800),
        (d_id, 'Coimbatore South', 10.9900, 76.9200),
        (d_id, 'Pollachi', 10.6500, 77.0000),
        (d_id, 'Mettupalayam', 11.2980, 76.9370),
        (d_id, 'Sulur', 11.0300, 77.1400),
        (d_id, 'Annur', 11.1850, 77.1020),
        (d_id, 'Kinathukadavu', 10.8200, 77.0200),
        (d_id, 'Valparai', 10.3200, 76.9500),
        (d_id, 'Madukkarai', 10.9000, 76.9600),
        (d_id, 'Perur', 10.9700, 76.9000),
        (d_id, 'Anaimalai', 10.5800, 76.9300)
        ON CONFLICT (district_id, name) DO NOTHING;
    END IF;

    -- 3. CHENNAI (All 16 Taluks)
    SELECT id INTO d_id FROM public.districts WHERE name = 'Chennai';
    IF d_id IS NOT NULL THEN
        INSERT INTO public.taluks (district_id, name, center_lat, center_lng) VALUES
        (d_id, 'Tondiarpet', 13.1250, 80.2870),
        (d_id, 'Royapuram', 13.1100, 80.2950),
        (d_id, 'Perambur', 13.1100, 80.2300),
        (d_id, 'Purasaivakkam', 13.0850, 80.2500),
        (d_id, 'Egmore', 13.0780, 80.2600),
        (d_id, 'Mylapore', 13.0368, 80.2676),
        (d_id, 'Mambalam', 13.0350, 80.2250),
        (d_id, 'Guindy', 13.0067, 80.2000),
        (d_id, 'Velachery', 12.9800, 80.2200),
        (d_id, 'Alandur', 13.0030, 80.2050),
        (d_id, 'Sholinganallur', 12.9000, 80.2270),
        (d_id, 'Aminjikarai', 13.0700, 80.2150),
        (d_id, 'Ayanavaram', 13.1000, 80.2350),
        (d_id, 'Madhavaram', 13.1480, 80.2310),
        (d_id, 'Ambattur', 13.1140, 80.1548),
        (d_id, 'Tiruvottiyur', 13.1600, 80.3000)
        ON CONFLICT (district_id, name) DO NOTHING;
    END IF;

    -- 4. TIRUPPUR (All 9 Taluks)
    SELECT id INTO d_id FROM public.districts WHERE name = 'Tiruppur';
    IF d_id IS NOT NULL THEN
        INSERT INTO public.taluks (district_id, name, center_lat, center_lng) VALUES
        (d_id, 'Tiruppur North', 11.1300, 77.3400),
        (d_id, 'Tiruppur South', 11.0800, 77.3500),
        (d_id, 'Avinashi', 11.1900, 77.2600),
        (d_id, 'Udumalaipettai', 10.5800, 77.2500),
        (d_id, 'Dharapuram', 10.7300, 77.5300),
        (d_id, 'Kangeyam', 11.0050, 77.5600),
        (d_id, 'Madathukulam', 10.5500, 77.3800),
        (d_id, 'Uthukuli', 11.1600, 77.4500),
        (d_id, 'Kundadam', 10.8700, 77.5300)
        ON CONFLICT (district_id, name) DO NOTHING;
    END IF;

    -- 5. SALEM (All 10 Taluks)
    SELECT id INTO d_id FROM public.districts WHERE name = 'Salem';
    IF d_id IS NOT NULL THEN
        INSERT INTO public.taluks (district_id, name, center_lat, center_lng) VALUES
        (d_id, 'Salem', 11.6643, 78.1460),
        (d_id, 'Salem South', 11.6100, 78.1500),
        (d_id, 'Salem West', 11.6600, 78.0900),
        (d_id, 'Attur', 11.5800, 78.5960),
        (d_id, 'Mettur', 11.7870, 77.8000),
        (d_id, 'Omalur', 11.7400, 78.0400),
        (d_id, 'Sangagiri', 11.5620, 77.8840),
        (d_id, 'Edappadi', 11.5800, 77.8400),
        (d_id, 'Valapady', 11.6500, 78.4000),
        (d_id, 'Yercaud', 11.7700, 78.2000)
        ON CONFLICT (district_id, name) DO NOTHING;
    END IF;

    -- 6. MADURAI (All 11 Taluks)
    SELECT id INTO d_id FROM public.districts WHERE name = 'Madurai';
    IF d_id IS NOT NULL THEN
        INSERT INTO public.taluks (district_id, name, center_lat, center_lng) VALUES
        (d_id, 'Madurai North', 9.9400, 78.1200),
        (d_id, 'Madurai South', 9.9000, 78.1100),
        (d_id, 'Madurai East', 9.9200, 78.1600),
        (d_id, 'Madurai West', 9.9300, 78.0800),
        (d_id, 'Melur', 10.0310, 78.3350),
        (d_id, 'Peraiyur', 9.7890, 78.3000),
        (d_id, 'Thirumangalam', 9.8200, 77.9800),
        (d_id, 'Thiruparankundram', 9.8800, 78.0700),
        (d_id, 'Usilampatti', 9.9600, 77.7900),
        (d_id, 'Vadipatti', 10.0800, 77.9400),
        (d_id, 'Kalligudi', 9.7100, 77.9500)
        ON CONFLICT (district_id, name) DO NOTHING;
    END IF;
END $$;

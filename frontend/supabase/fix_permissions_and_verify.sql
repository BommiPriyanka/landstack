-- ================================================================
-- RUN THIS IN SUPABASE SQL EDITOR TO UNLOCK READ PERMISSIONS
-- ================================================================

-- Option A: Allow public read via Row Level Security (Recommended)
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taluks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read districts" ON public.districts;
DROP POLICY IF EXISTS "Allow public read taluks" ON public.taluks;
DROP POLICY IF EXISTS "Allow public read villages" ON public.villages;

CREATE POLICY "Allow public read districts" ON public.districts FOR SELECT TO anon, authenticated, public USING (true);
CREATE POLICY "Allow public read taluks" ON public.taluks FOR SELECT TO anon, authenticated, public USING (true);
CREATE POLICY "Allow public read villages" ON public.villages FOR SELECT TO anon, authenticated, public USING (true);

-- Check counts
SELECT 'districts' as table_name, count(*) FROM public.districts
UNION ALL
SELECT 'taluks' as table_name, count(*) FROM public.taluks
UNION ALL
SELECT 'villages' as table_name, count(*) FROM public.villages;

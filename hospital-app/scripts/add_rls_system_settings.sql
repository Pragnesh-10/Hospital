ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read system_settings"
ON public.system_settings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admin service role can write"
ON public.system_settings FOR ALL
TO service_role
USING (true);

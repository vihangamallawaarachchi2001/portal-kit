-- upsert() needs INSERT permission even when the row already exists,
-- because PostgreSQL checks the INSERT path for ON CONFLICT DO UPDATE.
CREATE POLICY "profiles: insert own"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

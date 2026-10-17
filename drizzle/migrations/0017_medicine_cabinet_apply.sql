-- Applies the medicine cabinet schema from 0016_medicine_cabinet.sql (written idempotently so it is safe to run on top of that file).
-- Personal cabinets stay on each woman's device; nothing here identifies a person.

CREATE TABLE IF NOT EXISTS public.medicines (
  id text PRIMARY KEY,
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  also_called text[] NOT NULL DEFAULT '{}',
  form text NOT NULL DEFAULT 'tablet',
  tags text[] NOT NULL DEFAULT '{}',
  default_schedule jsonb NOT NULL DEFAULT '{"pattern":"daily","times":["08:00"]}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved')),
  approved_by uuid,
  approved_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.medicine_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  form text CHECK (form IS NULL OR char_length(form) <= 40),
  for_what text CHECK (for_what IS NULL OR char_length(for_what) <= 60),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','added','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.medicines TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicines TO authenticated;
GRANT INSERT ON public.medicine_suggestions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medicine_suggestions TO authenticated;
GRANT ALL ON public.medicines, public.medicine_suggestions TO service_role;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read approved medicines" ON public.medicines;
DROP POLICY IF EXISTS "admin writes medicines" ON public.medicines;
DROP POLICY IF EXISTS "anyone can suggest a medicine" ON public.medicine_suggestions;
DROP POLICY IF EXISTS "admin reads suggestions" ON public.medicine_suggestions;
DROP POLICY IF EXISTS "admin updates suggestions" ON public.medicine_suggestions;
DROP POLICY IF EXISTS "admin deletes suggestions" ON public.medicine_suggestions;

CREATE POLICY "read approved medicines" ON public.medicines FOR SELECT TO anon, authenticated USING (status = 'approved' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin writes medicines" ON public.medicines FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "anyone can suggest a medicine" ON public.medicine_suggestions FOR INSERT TO anon, authenticated WITH CHECK (status = 'new');
CREATE POLICY "admin reads suggestions" ON public.medicine_suggestions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin updates suggestions" ON public.medicine_suggestions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin deletes suggestions" ON public.medicine_suggestions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
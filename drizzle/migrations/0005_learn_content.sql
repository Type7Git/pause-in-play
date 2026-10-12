CREATE TABLE public.learn_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('article','video','quiz')),
  title text NOT NULL CHECK (char_length(title) <= 160),
  summary text NOT NULL DEFAULT '' CHECK (char_length(summary) <= 400),
  body text NOT NULL DEFAULT '' CHECK (char_length(body) <= 20000),
  video_url text CHECK (video_url IS NULL OR video_url ~ '^https://'),
  quiz jsonb NOT NULL DEFAULT '[]'::jsonb,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free','plus')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_by uuid,
  approved_at timestamptz
);
GRANT SELECT ON public.learn_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learn_content TO authenticated;
GRANT ALL ON public.learn_content TO service_role;
ALTER TABLE public.learn_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads approved learn" ON public.learn_content FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Admins read learn" ON public.learn_content FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert learn" ON public.learn_content FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update learn" ON public.learn_content FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete learn" ON public.learn_content FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
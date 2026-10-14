CREATE TABLE public.wyr_characters (
  code text PRIMARY KEY CHECK (char_length(code) <= 4),
  name text NOT NULL,
  result_text text NOT NULL,
  portrait_svg text NOT NULL DEFAULT ''
);
GRANT SELECT ON public.wyr_characters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wyr_characters TO authenticated;
GRANT ALL ON public.wyr_characters TO service_role;
ALTER TABLE public.wyr_characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads characters" ON public.wyr_characters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write characters" ON public.wyr_characters FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.wyr_questions (
  id serial PRIMARY KEY,
  category text NOT NULL,
  option_a text NOT NULL CHECK (char_length(option_a) <= 200),
  option_b text NOT NULL CHECK (char_length(option_b) <= 200),
  character_a text NOT NULL REFERENCES public.wyr_characters(code),
  character_b text NOT NULL REFERENCES public.wyr_characters(code),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','live'))
);
GRANT SELECT ON public.wyr_questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wyr_questions TO authenticated;
GRANT USAGE ON SEQUENCE public.wyr_questions_id_seq TO authenticated;
GRANT ALL ON public.wyr_questions TO service_role;
ALTER TABLE public.wyr_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads live questions" ON public.wyr_questions FOR SELECT TO anon, authenticated USING (status = 'live');
CREATE POLICY "Admins read questions" ON public.wyr_questions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write questions" ON public.wyr_questions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.wyr_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  character_code text NOT NULL REFERENCES public.wyr_characters(code),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.wyr_results TO authenticated;
GRANT ALL ON public.wyr_results TO service_role;
ALTER TABLE public.wyr_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own results select" ON public.wyr_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own results insert" ON public.wyr_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own results delete" ON public.wyr_results FOR DELETE TO authenticated USING (auth.uid() = user_id);
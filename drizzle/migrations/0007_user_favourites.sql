CREATE TABLE public.user_favourites (
  user_id uuid NOT NULL,
  activity_key text NOT NULL CHECK (char_length(activity_key) <= 40),
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, activity_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_favourites TO authenticated;
GRANT ALL ON public.user_favourites TO service_role;
ALTER TABLE public.user_favourites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own favourites select" ON public.user_favourites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own favourites insert" ON public.user_favourites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own favourites update" ON public.user_favourites FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own favourites delete" ON public.user_favourites FOR DELETE TO authenticated USING (auth.uid() = user_id);
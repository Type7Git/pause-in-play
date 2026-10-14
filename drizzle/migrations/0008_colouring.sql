CREATE TABLE public.colouring_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  svg text NOT NULL,
  layer_order jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_plus boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  sort int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.colouring_scenes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.colouring_scenes TO authenticated;
GRANT ALL ON public.colouring_scenes TO service_role;
ALTER TABLE public.colouring_scenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published scenes" ON public.colouring_scenes FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Admins read scenes" ON public.colouring_scenes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write scenes" ON public.colouring_scenes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.colouring_saves (
  user_id uuid NOT NULL,
  scene_id uuid NOT NULL REFERENCES public.colouring_scenes(id) ON DELETE CASCADE,
  layer_colours jsonb NOT NULL DEFAULT '{}'::jsonb,
  image_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, scene_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.colouring_saves TO authenticated;
GRANT ALL ON public.colouring_saves TO service_role;
ALTER TABLE public.colouring_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saves select" ON public.colouring_saves FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own saves insert" ON public.colouring_saves FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own saves update" ON public.colouring_saves FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own saves delete" ON public.colouring_saves FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "own gallery read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'gallery' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own gallery insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own gallery update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own gallery delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND (storage.foldername(name))[1] = auth.uid()::text);
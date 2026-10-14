CREATE TABLE public.movement_sessions (
  key text PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('Stretch','Yoga','Pilates','Strength','Walk & balance')),
  energy text NOT NULL CHECK (energy IN ('gentle','steady','energetic')),
  minutes integer NOT NULL CHECK (minutes > 0),
  benefit_tags text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  video_url text,
  is_plus boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved')),
  sort integer NOT NULL DEFAULT 0
);
CREATE TABLE public.session_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key text NOT NULL REFERENCES public.movement_sessions(key) ON DELETE CASCADE,
  "order" integer NOT NULL,
  move text NOT NULL,
  seconds integer NOT NULL CHECK (seconds > 0),
  how text NOT NULL DEFAULT '',
  easier_version text,
  caution_flag text CHECK (caution_flag IS NULL OR caution_flag IN ('spine','impact')),
  caution_text text,
  video_url text,
  UNIQUE (session_key, "order")
);
CREATE TABLE public.food_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  focus text NOT NULL,
  title text NOT NULL UNIQUE,
  text text NOT NULL,
  try_these text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved')),
  sort integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.movement_sessions, public.session_moves, public.food_tips TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movement_sessions, public.session_moves, public.food_tips TO authenticated;
GRANT ALL ON public.movement_sessions, public.session_moves, public.food_tips TO service_role;
ALTER TABLE public.movement_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read approved sessions" ON public.movement_sessions FOR SELECT TO anon, authenticated USING (status = 'approved' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin writes sessions" ON public.movement_sessions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "read moves of approved sessions" ON public.session_moves FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.movement_sessions s WHERE s.key = session_key AND (s.status = 'approved' OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "admin writes moves" ON public.session_moves FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "read approved tips" ON public.food_tips FOR SELECT TO anon, authenticated USING (status = 'approved' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin writes tips" ON public.food_tips FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
ALTER TABLE public.learn_content DROP CONSTRAINT IF EXISTS learn_content_section_check;
ALTER TABLE public.learn_content ADD CONSTRAINT learn_content_section_check CHECK (section IN ('general','intimacy','body'));
ALTER TABLE public.library_entries DROP CONSTRAINT library_entries_linked_tool_check;
ALTER TABLE public.library_entries ADD CONSTRAINT library_entries_linked_tool_check CHECK (linked_tool IS NULL OR linked_tool = ANY (ARRAY['side-quest','remember','tabs','wind-down','little-win','laugh','erin','panel','medicines','mood','learn','cycle','settings','sprout','tell-sprout','home','favourites','colour','would-you-rather','peripals','intimacy','reflect','talk-cards','say-it-kindly','partner-guide','intimacy-library','move','pelvic','food']));
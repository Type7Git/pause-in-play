create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users see own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create table public.library_entries (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'General' check (char_length(category) between 1 and 60),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 4000),
  keywords text[] not null default '{}',
  linked_tool text check (linked_tool in ('side-quest','remember','tabs','wind-down','little-win','laugh','erin')),
  status text not null default 'draft' check (status in ('draft','approved')),
  updated_at timestamptz not null default now(),
  approved_by uuid,
  approved_at timestamptz
);
grant select on public.library_entries to anon, authenticated;
grant insert, update, delete on public.library_entries to authenticated;
grant all on public.library_entries to service_role;
alter table public.library_entries enable row level security;
create policy "Anyone reads approved" on public.library_entries for select to anon, authenticated using (status = 'approved');
create policy "Admins read all" on public.library_entries for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins insert" on public.library_entries for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Admins update" on public.library_entries for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins delete" on public.library_entries for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.search_library(q text)
returns setof public.library_entries language sql stable set search_path = public
as $$ with d as (
    select e.*, setweight(to_tsvector('english', e.title || ' ' || array_to_string(e.keywords,' ')), 'A') ||
      setweight(to_tsvector('english', e.body), 'B') as v
    from public.library_entries e where e.status = 'approved')
  select id, category, title, body, keywords, linked_tool, status, updated_at, approved_by, approved_at
  from d where v @@ to_tsquery('english', q)
  order by ts_rank(v, to_tsquery('english', q)) desc limit 3 $$;

create table public.unanswered_questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null check (char_length(question_text) between 1 and 500),
  created_at timestamptz not null default now(),
  handled boolean not null default false
);
grant select, update, delete on public.unanswered_questions to authenticated;
grant all on public.unanswered_questions to service_role;
alter table public.unanswered_questions enable row level security;
create policy "Admins read questions" on public.unanswered_questions for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins update questions" on public.unanswered_questions for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins delete questions" on public.unanswered_questions for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.sprout_usage (
  bucket text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (bucket, window_start)
);
grant all on public.sprout_usage to service_role;
alter table public.sprout_usage enable row level security;

create or replace function public.sprout_hit(_bucket text)
returns int language sql security definer set search_path = public
as $$ insert into public.sprout_usage(bucket, window_start, count)
  values (_bucket, date_trunc('hour', now()), 1)
  on conflict (bucket, window_start) do update set count = sprout_usage.count + 1
  returning count $$;
revoke execute on function public.sprout_hit(text) from public, anon, authenticated;
grant execute on function public.sprout_hit(text) to service_role;

insert into public.library_entries (category, title, body, keywords, linked_tool, status) values
('Sleep & rest','Sleep and the 3am mind','Waking at 3am with a busy mind is really common in perimenopause. Erin''s library suggests not fighting it: keep the lights low, skip the clock-checking, and give your mind something gentle to hold onto instead of the to-do list. The wind-down sessions are made for exactly this moment, with no screens to scroll and nothing to win.', array['sleep','3am','awake','insomnia','night','tired','wake','waking','bed'], 'wind-down','approved'),
('Brain & memory','Brain fog and memory','Walking into a room and forgetting why, or losing your keys for the third time today, is one of the most common things women describe in perimenopause. Erin''s library says it helps to take the pressure off your memory by giving important things a fixed home and writing down where they went. The VIT Department is a little place to file exactly that.', array['forget','forgetting','memory','fog','keys','glasses','lose','losing','brain','remember'], 'remember','approved'),
('Big feelings','When it all feels like too much','When everything feels urgent at once, the brain can freeze. Erin''s library suggests a short pause to settle your body first, then choosing just one next action and letting the rest wait. 37 tabs open walks you through both, in about two minutes.', array['overwhelm','overwhelmed','too much','stress','stressed','busy','cant think','frazzled','tabs'], 'tabs','approved'),
('Brain & memory','Losing your place','Getting pulled off course halfway through a task happens to everyone, and it can feel like it happens more often lately. Erin''s library suggests parking the original task somewhere outside your head, with the very next step, so coming back is easy. Side Quest Saver does exactly that.', array['distracted','interrupted','focus','task','place','side quest','sidetracked','concentrate'], 'side-quest','approved'),
('Big feelings','The flat days','Some days just feel flat and heavy, and that is a very human part of this stage. Erin''s library suggests starting with one very small, finishable thing, because a tiny win can shift the day a little. If low days are sticking around for weeks, it is worth talking with your GP.', array['flat','low','sad','down','meh','unmotivated','heavy','blah'], 'little-win','approved'),
('Big feelings','Irritability and the short fuse','Feeling snappier than usual is something many women notice in perimenopause, and it does not make you a bad person. Erin''s library suggests catching the moment with a slow breath before responding, and noticing what your body needs. A one-minute pause in 37 tabs open can help.', array['angry','irritable','snappy','rage','short fuse','cranky','annoyed','temper'], 'tabs','approved'),
('About the program','The Pause in Play program','Pause in Play is a small collection of quick, playful tools created by Dr Erin Kelly, Clinical Psychologist (PhD). Each one is built on her clinical work and takes only a minute or two. It is education and skills, not medical advice or treatment.', array['program','pause in play','app','erin','about','who made'], 'erin','approved'),
('About the program','About Sprout','I''m Sprout, an AI guide. I''m not a person, and I''m not a therapist. I can only answer from a library of information written and approved by Dr Erin Kelly, and help you find the right tool in the app.', array['sprout','who are you','ai','bot','robot','are you real','are you erin','person'], null,'approved');
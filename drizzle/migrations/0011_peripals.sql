CREATE TABLE public.pal_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  pal_id uuid NOT NULL,
  relationship text NOT NULL DEFAULT 'Friend',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','paused','removed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, pal_id),
  CHECK (owner_id <> pal_id)
);
CREATE TABLE public.pal_permissions (
  link_id uuid PRIMARY KEY REFERENCES public.pal_links(id) ON DELETE CASCADE,
  garden boolean NOT NULL DEFAULT false,
  status boolean NOT NULL DEFAULT false,
  med_checkins boolean NOT NULL DEFAULT false CHECK (NOT med_checkins),
  miss_alert boolean NOT NULL DEFAULT false CHECK (NOT miss_alert),
  shared_reminders boolean NOT NULL DEFAULT false,
  cycle_summary boolean NOT NULL DEFAULT false CHECK (NOT cycle_summary),
  messages boolean NOT NULL DEFAULT true
);
COMMENT ON COLUMN public.pal_permissions.med_checkins IS 'Locked false until personal health saving is enabled';
COMMENT ON COLUMN public.pal_permissions.cycle_summary IS 'Locked false until personal health saving is enabled';
CREATE TABLE public.pal_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  code text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(9), 'hex'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  relationship text NOT NULL DEFAULT 'Friend',
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  used_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.pal_settings (
  user_id uuid PRIMARY KEY,
  paused_all boolean NOT NULL DEFAULT false,
  adult_confirmed_at timestamptz
);
CREATE TABLE public.pal_status (
  user_id uuid PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('sunny','mixed','rainy','empty')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.pal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL DEFAULT auth.uid(),
  recipient_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  kind text NOT NULL DEFAULT 'text' CHECK (kind IN ('text','nudge')),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  reported boolean NOT NULL DEFAULT false
);
CREATE INDEX pal_messages_pair ON public.pal_messages (least(sender_id, recipient_id), greatest(sender_id, recipient_id), created_at);
CREATE TABLE public.pal_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.pal_messages(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL DEFAULT auth.uid(),
  reason text NOT NULL DEFAULT '' CHECK (char_length(reason) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  handled_at timestamptz
);
CREATE TABLE public.pal_blocks (
  blocker_id uuid NOT NULL DEFAULT auth.uid(),
  blocked_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

GRANT SELECT, UPDATE ON public.pal_links TO authenticated;
GRANT SELECT, UPDATE ON public.pal_permissions TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.pal_invites TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.pal_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pal_status TO authenticated;
GRANT SELECT, INSERT ON public.pal_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.pal_reports TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.pal_blocks TO authenticated;
GRANT ALL ON public.pal_links, public.pal_permissions, public.pal_invites, public.pal_settings, public.pal_status, public.pal_messages, public.pal_reports, public.pal_blocks TO service_role;

ALTER TABLE public.pal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pal_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pal_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pal_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pal_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pal_blocks ENABLE ROW LEVEL SECURITY;

-- helpers
CREATE OR REPLACE FUNCTION public.pal_blocked(_a uuid, _b uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select exists (select 1 from pal_blocks where (blocker_id=_a and blocked_id=_b) or (blocker_id=_b and blocked_id=_a)) $$;

CREATE OR REPLACE FUNCTION public.pal_can_see(_owner uuid, _viewer uuid, _perm text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select _viewer is not null and exists (
    select 1 from pal_links l join pal_permissions p on p.link_id = l.id
    where l.owner_id = _owner and l.pal_id = _viewer and l.status = 'active'
      and case _perm when 'garden' then p.garden when 'status' then p.status when 'shared_reminders' then p.shared_reminders
                     when 'med_checkins' then p.med_checkins when 'cycle_summary' then p.cycle_summary when 'messages' then p.messages else false end)
  and not coalesce((select paused_all from pal_settings where user_id = _owner), false)
  and not pal_blocked(_owner, _viewer) $$;

CREATE OR REPLACE FUNCTION public.pal_can_message(_a uuid, _b uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select _a is not null and _b is not null and not pal_blocked(_a, _b) and exists (
    select 1 from pal_links l join pal_permissions p on p.link_id = l.id
    where p.messages and l.status in ('active','paused')
      and ((l.owner_id=_a and l.pal_id=_b) or (l.owner_id=_b and l.pal_id=_a))) $$;

-- policies
CREATE POLICY "owner or pal reads link" ON public.pal_links FOR SELECT TO authenticated USING (auth.uid() = owner_id OR auth.uid() = pal_id);
CREATE POLICY "owner updates link" ON public.pal_links FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "owner reads permissions" ON public.pal_permissions FOR SELECT TO authenticated
  USING (exists (select 1 from public.pal_links l where l.id = link_id and (l.owner_id = auth.uid() or (l.pal_id = auth.uid() and l.status = 'active'))));
CREATE POLICY "owner updates permissions" ON public.pal_permissions FOR UPDATE TO authenticated
  USING (exists (select 1 from public.pal_links l where l.id = link_id and l.owner_id = auth.uid()))
  WITH CHECK (exists (select 1 from public.pal_links l where l.id = link_id and l.owner_id = auth.uid()));

CREATE POLICY "own invites read" ON public.pal_invites FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "own invites insert" ON public.pal_invites FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id AND used_at IS NULL AND used_by IS NULL AND expires_at <= now() + interval '7 days 1 minute');
CREATE POLICY "own invites delete" ON public.pal_invites FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "own settings read" ON public.pal_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own settings insert" ON public.pal_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own settings update" ON public.pal_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own or permitted status read" ON public.pal_status FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.pal_can_see(user_id, auth.uid(), 'status'));
CREATE POLICY "own status insert" ON public.pal_status FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own status update" ON public.pal_status FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own status delete" ON public.pal_status FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "pair reads messages" ON public.pal_messages FOR SELECT TO authenticated
  USING ((auth.uid() = sender_id OR auth.uid() = recipient_id) AND public.pal_can_message(sender_id, recipient_id));
CREATE POLICY "send to connected pal" ON public.pal_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND read_at IS NULL AND NOT reported AND public.pal_can_message(sender_id, recipient_id));

CREATE POLICY "reporter reads reports" ON public.pal_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "report a message I received" ON public.pal_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id AND exists (select 1 from public.pal_messages m where m.id = message_id and m.recipient_id = auth.uid()));
CREATE POLICY "admins handle reports" ON public.pal_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "own blocks read" ON public.pal_blocks FOR SELECT TO authenticated USING (auth.uid() = blocker_id);
CREATE POLICY "own blocks insert" ON public.pal_blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "own blocks delete" ON public.pal_blocks FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

-- guards
CREATE OR REPLACE FUNCTION public.pal_links_guard() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.owner_id <> OLD.owner_id OR NEW.pal_id <> OLD.pal_id THEN RAISE EXCEPTION 'cannot change people on a link'; END IF;
  IF OLD.status = 'removed' AND NEW.status <> 'removed' THEN RAISE EXCEPTION 'removed links need a new invite'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER pal_links_guard BEFORE UPDATE ON public.pal_links FOR EACH ROW EXECUTE FUNCTION public.pal_links_guard();

CREATE OR REPLACE FUNCTION public.pal_messages_rate() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (select count(*) from pal_messages where sender_id = NEW.sender_id and created_at > now() - interval '1 minute') >= 30 THEN
    RAISE EXCEPTION 'rate_limited: slow down a little' USING ERRCODE = 'P0001'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER pal_messages_rate BEFORE INSERT ON public.pal_messages FOR EACH ROW EXECUTE FUNCTION public.pal_messages_rate();

CREATE OR REPLACE FUNCTION public.pal_invites_rate() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (select count(*) from pal_invites where owner_id = NEW.owner_id and created_at > now() - interval '1 day') >= 10 THEN
    RAISE EXCEPTION 'rate_limited: 10 invites a day' USING ERRCODE = 'P0001'; END IF;
  NEW.permissions := jsonb_build_object('garden', coalesce((NEW.permissions->>'garden')::boolean,false), 'status', coalesce((NEW.permissions->>'status')::boolean,false),
    'shared_reminders', coalesce((NEW.permissions->>'shared_reminders')::boolean,false), 'messages', coalesce((NEW.permissions->>'messages')::boolean,true));
  RETURN NEW;
END $$;
CREATE TRIGGER pal_invites_rate BEFORE INSERT ON public.pal_invites FOR EACH ROW EXECUTE FUNCTION public.pal_invites_rate();

CREATE OR REPLACE FUNCTION public.pal_reports_flag() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN UPDATE pal_messages SET reported = true WHERE id = NEW.message_id; RETURN NEW; END $$;
CREATE TRIGGER pal_reports_flag AFTER INSERT ON public.pal_reports FOR EACH ROW EXECUTE FUNCTION public.pal_reports_flag();

-- RPCs
CREATE OR REPLACE FUNCTION public.pal_invite_preview(_code text) RETURNS TABLE(owner_name text, pal_name text, relationship text, permissions jsonb, valid boolean, is_mine boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select coalesce(nullif(pr.display_name,''), 'A friend'), i.name, i.relationship, i.permissions,
         (i.used_at is null and i.expires_at > now()), i.owner_id = auth.uid()
  from pal_invites i left join profiles pr on pr.id = i.owner_id where i.code = _code $$;

CREATE OR REPLACE FUNCTION public.pal_accept_invite(_code text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i pal_invites; lid uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'sign in first'; END IF;
  IF NOT EXISTS (select 1 from pal_settings where user_id = auth.uid() and adult_confirmed_at is not null) THEN RAISE EXCEPTION 'confirm you are 18 or over'; END IF;
  SELECT * INTO i FROM pal_invites WHERE code = _code FOR UPDATE;
  IF i.id IS NULL OR i.used_at IS NOT NULL OR i.expires_at <= now() THEN RAISE EXCEPTION 'This invite has expired or was already used'; END IF;
  IF i.owner_id = auth.uid() THEN RAISE EXCEPTION 'This is your own invite'; END IF;
  IF pal_blocked(i.owner_id, auth.uid()) THEN RAISE EXCEPTION 'This invite has expired or was already used'; END IF;
  UPDATE pal_invites SET used_at = now(), used_by = auth.uid() WHERE id = i.id;
  DELETE FROM pal_links WHERE owner_id = i.owner_id AND pal_id = auth.uid() AND status = 'removed';
  INSERT INTO pal_links(owner_id, pal_id, relationship, status) VALUES (i.owner_id, auth.uid(), i.relationship, 'pending')
    ON CONFLICT (owner_id, pal_id) DO UPDATE SET relationship = excluded.relationship RETURNING id INTO lid;
  INSERT INTO pal_permissions(link_id, garden, status, shared_reminders, messages)
    VALUES (lid, (i.permissions->>'garden')::boolean, (i.permissions->>'status')::boolean, (i.permissions->>'shared_reminders')::boolean, coalesce((i.permissions->>'messages')::boolean, true))
    ON CONFLICT (link_id) DO UPDATE SET garden = excluded.garden, status = excluded.status, shared_reminders = excluded.shared_reminders, messages = excluded.messages;
  RETURN lid;
END $$;

CREATE OR REPLACE FUNCTION public.pal_overview() RETURNS TABLE(other_id uuid, other_name text, relationship text, i_share_link uuid, i_share_status text, they_share_link uuid, they_share_status text, their_status text, last_body text, last_at timestamptz, unread integer, blocked boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  with mine as (select * from pal_links where owner_id = auth.uid() and status <> 'removed'),
       theirs as (select * from pal_links where pal_id = auth.uid() and status <> 'removed'),
       others as (select pal_id as oid from mine union select owner_id from theirs)
  select o.oid, coalesce(nullif(pr.display_name,''), (select name from pal_invites where used_by = o.oid and owner_id = auth.uid() order by used_at desc limit 1), 'PeriPal'),
    coalesce(m.relationship, t.relationship), m.id, m.status, t.id, t.status,
    (select s.status from pal_status s where s.user_id = o.oid and pal_can_see(o.oid, auth.uid(), 'status')),
    lm.body, lm.created_at,
    (select count(*)::int from pal_messages x where x.sender_id = o.oid and x.recipient_id = auth.uid() and x.read_at is null and pal_can_message(o.oid, auth.uid())),
    exists (select 1 from pal_blocks b where b.blocker_id = auth.uid() and b.blocked_id = o.oid)
  from others o left join mine m on m.pal_id = o.oid left join theirs t on t.owner_id = o.oid left join profiles pr on pr.id = o.oid
  left join lateral (select body, created_at from pal_messages x where pal_can_message(auth.uid(), o.oid) and ((x.sender_id = o.oid and x.recipient_id = auth.uid()) or (x.sender_id = auth.uid() and x.recipient_id = o.oid)) order by created_at desc limit 1) lm on true
  where not exists (select 1 from pal_blocks b where b.blocker_id = o.oid and b.blocked_id = auth.uid()) $$;

CREATE OR REPLACE FUNCTION public.pal_garden(_owner uuid) RETURNS TABLE(petals integer, badges text[]) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select (select coalesce(sum(amount),0)::int from petal_events where user_id = _owner), (select coalesce(array_agg(badge_key), '{}') from badges_earned where user_id = _owner)
  where _owner = auth.uid() or pal_can_see(_owner, auth.uid(), 'garden') $$;

CREATE OR REPLACE FUNCTION public.pal_mark_read(_other uuid) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  update pal_messages set read_at = now() where recipient_id = auth.uid() and sender_id = _other and read_at is null $$;

REVOKE EXECUTE ON FUNCTION public.pal_invite_preview(text), public.pal_accept_invite(text), public.pal_overview(), public.pal_garden(uuid), public.pal_mark_read(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.pal_invite_preview(text), public.pal_accept_invite(text), public.pal_overview(), public.pal_garden(uuid), public.pal_mark_read(uuid) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.pal_messages, public.pal_permissions, public.pal_links;
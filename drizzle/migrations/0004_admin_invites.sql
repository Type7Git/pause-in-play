CREATE TABLE public.admin_invites (email text PRIMARY KEY);
GRANT ALL ON public.admin_invites TO service_role;
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;
INSERT INTO public.admin_invites(email) VALUES ('al@type7.com.au'),('elkelly83@gmail.com');
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role);

CREATE OR REPLACE FUNCTION public.grant_invited_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND EXISTS (SELECT 1 FROM public.admin_invites WHERE email = lower(NEW.email)) THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.grant_invited_admin() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_admin_invite
AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_invited_admin();
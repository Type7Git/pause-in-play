-- Petals and badges are written only through checked functions, never directly by the browser.
REVOKE INSERT, UPDATE, DELETE ON public.petal_events FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.badges_earned FROM authenticated, anon;
DROP POLICY IF EXISTS "own rows insert" ON public.petal_events;
DROP POLICY IF EXISTS "own rows update" ON public.petal_events;
DROP POLICY IF EXISTS "own rows delete" ON public.petal_events;
DROP POLICY IF EXISTS "own rows insert" ON public.badges_earned;
DROP POLICY IF EXISTS "own rows update" ON public.badges_earned;
DROP POLICY IF EXISTS "own rows delete" ON public.badges_earned;

CREATE OR REPLACE FUNCTION public.reward_badge_ok(_key text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT _key = ANY (ARRAY['first_seedling','side_quest_saver','tab_closer','small_victories','glasses_detective','vit_head','calm_colourist','decisive_queen','moving_gently','peripal'])
$$;

-- One activity: at most 5 petals, at most 150 petals a day, known badges only.
CREATE OR REPLACE FUNCTION public.award_reward(_amount integer, _reason text, _badge text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _today integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not signed in' USING ERRCODE = '42501'; END IF;
  IF _amount IS NULL OR _amount < 0 OR _amount > 5 THEN RAISE EXCEPTION 'invalid amount' USING ERRCODE = '22023'; END IF;
  IF _badge IS NOT NULL AND NOT public.reward_badge_ok(_badge) THEN RAISE EXCEPTION 'unknown badge' USING ERRCODE = '22023'; END IF;
  IF _amount > 0 THEN
    SELECT coalesce(sum(amount), 0) INTO _today FROM public.petal_events
      WHERE user_id = _uid AND created_at > now() - interval '1 day' AND reason <> 'Brought over from this device';
    IF _today + _amount <= 150 THEN
      INSERT INTO public.petal_events(user_id, amount, reason) VALUES (_uid, _amount, left(coalesce(_reason, ''), 120));
    END IF;
  END IF;
  IF _badge IS NOT NULL THEN
    INSERT INTO public.badges_earned(user_id, badge_key) VALUES (_uid, _badge) ON CONFLICT (user_id, badge_key) DO NOTHING;
  END IF;
END $$;

-- Device garden brought into an account: known badges only, at most 250 petals ever brought over.
CREATE OR REPLACE FUNCTION public.bring_over_rewards(_petals integer, _badges text[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _already integer;
  _add integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not signed in' USING ERRCODE = '42501'; END IF;
  SELECT coalesce(sum(amount), 0) INTO _already FROM public.petal_events
    WHERE user_id = _uid AND reason = 'Brought over from this device';
  _add := least(greatest(coalesce(_petals, 0), 0), greatest(250 - _already, 0));
  IF _add > 0 THEN
    INSERT INTO public.petal_events(user_id, amount, reason) VALUES (_uid, _add, 'Brought over from this device');
  END IF;
  INSERT INTO public.badges_earned(user_id, badge_key)
    SELECT DISTINCT _uid, b FROM unnest(coalesce(_badges, '{}'::text[])) AS b WHERE public.reward_badge_ok(b)
    ON CONFLICT (user_id, badge_key) DO NOTHING;
END $$;

REVOKE EXECUTE ON FUNCTION public.award_reward(integer, text, text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.bring_over_rewards(integer, text[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.award_reward(integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bring_over_rewards(integer, text[]) TO authenticated;
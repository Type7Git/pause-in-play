DROP POLICY IF EXISTS "Anyone reads characters" ON public.wyr_characters;

-- Characters are visible only when they appear in a published question,
-- or when the signed-in person has already found them. Admins keep full
-- access through the existing "Admins write characters" policy.
CREATE POLICY "Read characters in live questions"
ON public.wyr_characters
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.wyr_questions q
    WHERE q.status = 'live'
      AND (q.character_a = wyr_characters.code OR q.character_b = wyr_characters.code)
  )
);

CREATE POLICY "Read characters you found"
ON public.wyr_characters
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.wyr_results r
    WHERE r.user_id = auth.uid() AND r.character_code = wyr_characters.code
  )
);
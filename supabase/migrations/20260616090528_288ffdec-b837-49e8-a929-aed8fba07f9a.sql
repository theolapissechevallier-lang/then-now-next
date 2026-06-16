
-- Restrict SECURITY DEFINER function to triggers only
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;

-- Tighten analytics insert policy: require user_id match (or null for anonymous)
DROP POLICY IF EXISTS "analytics_insert_any" ON public.analytics_events;
CREATE POLICY "analytics_insert_own" ON public.analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analytics_insert_anon" ON public.analytics_events
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

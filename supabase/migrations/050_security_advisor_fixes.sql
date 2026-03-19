-- Security Advisor fixes
-- Addresses:
-- 1. RLS disabled on public tables
-- 2. Security definer views
-- 3. Functions with mutable search_path

-- =====================================================
-- 1. Fix security invoker settings for public views
-- =====================================================

CREATE OR REPLACE VIEW public.active_users
WITH (security_invoker = true) AS
SELECT *
FROM public.users
WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW public.active_contents
WITH (security_invoker = true) AS
SELECT *
FROM public.contents
WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW public.active_comments
WITH (security_invoker = true) AS
SELECT *
FROM public.comments
WHERE deleted_at IS NULL;

GRANT SELECT ON public.active_users TO authenticated;
GRANT SELECT ON public.active_contents TO authenticated;
GRANT SELECT ON public.active_comments TO authenticated;

-- =====================================================
-- 2. Enable RLS for public tables lacking policies
-- =====================================================

ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slow_query_logs ENABLE ROW LEVEL SECURITY;

-- Content categories: public reads active user-facing categories, admins manage all
DROP POLICY IF EXISTS "Public can view active content categories" ON public.content_categories;
CREATE POLICY "Public can view active content categories"
  ON public.content_categories
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND (
      required_role = 'user'
      OR EXISTS (
        SELECT 1
        FROM public.users
        WHERE users.id = auth.uid()
          AND users.role = 'admin'
      )
    )
  );

DROP POLICY IF EXISTS "Admins can manage content categories" ON public.content_categories;
CREATE POLICY "Admins can manage content categories"
  ON public.content_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- API metrics: only admins can query through the app; writes use service role server-side
DROP POLICY IF EXISTS "Admins can view api metrics" ON public.api_metrics;
CREATE POLICY "Admins can view api metrics"
  ON public.api_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Slow query logs: only admins can query through the app; writes use service role server-side
DROP POLICY IF EXISTS "Admins can view slow query logs" ON public.slow_query_logs;
CREATE POLICY "Admins can view slow query logs"
  ON public.slow_query_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- =====================================================
-- 3. Fix mutable search_path warnings
-- =====================================================

ALTER FUNCTION public.add_creator_as_moderator() SET search_path = public, pg_temp;
ALTER FUNCTION public.can_manage_community(uuid, uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_agent_limit() SET search_path = public, pg_temp;
ALTER FUNCTION public.cleanup_old_api_metrics() SET search_path = public, pg_temp;
ALTER FUNCTION public.cleanup_old_slow_query_logs() SET search_path = public, pg_temp;
ALTER FUNCTION public.create_content_version() SET search_path = public, pg_temp;


-- 1. Fix profiles: replace overly permissive SELECT with scoped policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (user_id = auth.uid());

-- Admins can view all profiles (needed for user management)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Gestors can view all profiles (needed for OKR assignment)
CREATE POLICY "Gestors can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'gestor'::app_role));

-- 2. Fix imported_metrics: restrict SELECT to admin/gestor only
DROP POLICY IF EXISTS "Anyone can view imported_metrics" ON public.imported_metrics;

CREATE POLICY "Admins and gestors can view imported_metrics"
ON public.imported_metrics
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'gestor'::app_role)
);

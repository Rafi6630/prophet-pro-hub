-- Fix: users cannot insert their own roles because user_roles has RLS
-- enabled with only a SELECT policy. Rather than opening a broad INSERT
-- policy, we expose a SECURITY DEFINER function that runs as the DB owner
-- and enforces that:
--   1. Only the authenticated user can assign a role to themselves.
--   2. The 'admin' role can never be self-assigned.
--   3. Duplicate inserts are silently ignored (ON CONFLICT DO NOTHING).

CREATE OR REPLACE FUNCTION public.grant_self_role(_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _role = 'admin' THEN
    RAISE EXCEPTION 'Cannot self-assign the admin role';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Grant execute to every authenticated Supabase user
GRANT EXECUTE ON FUNCTION public.grant_self_role(public.app_role) TO authenticated;

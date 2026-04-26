import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/property";
import { useAuth } from "@/hooks/useAuth";

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    setRoles((data ?? []).map(r => r.role));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (cancelled) return;
        setRoles((data ?? []).map(r => r.role));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  // Call after addRole to avoid a full page reload
  const refetchRoles = useCallback(() => {
    if (user) fetchRoles(user.id);
  }, [user, fetchRoles]);

  return {
    roles,
    loading,
    isAdmin: roles.includes("admin"),
    isSeller: roles.includes("seller"),
    isBuyer: roles.includes("buyer"),
    refetchRoles,
  };
}

/**
 * Grant a role to the currently signed-in user via a SECURITY DEFINER
 * RPC function. This bypasses the RLS INSERT restriction on user_roles
 * while still preventing self-assignment of the admin role server-side.
 *
 * The `userId` param is kept for call-site compatibility but the actual
 * identity is always taken from auth.uid() inside the DB function.
 */
export async function addRole(_userId: string, role: AppRole) {
  const { error } = await supabase.rpc("grant_self_role", { _role: role });
  // Treat "duplicate" / unique-violation as success (role already exists)
  if (error && !error.message.includes("duplicate") && !error.code?.includes("23505")) {
    return { error };
  }
  return { error: null };
}

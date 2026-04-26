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

export async function addRole(userId: string, role: AppRole) {
  return supabase.from("user_roles").insert({ user_id: userId, role });
}

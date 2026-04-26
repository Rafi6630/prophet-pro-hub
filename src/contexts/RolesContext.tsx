import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/property";
import { useAuth } from "@/hooks/useAuth";

interface RolesState {
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isBuyer: boolean;
  refetchRoles: () => Promise<void>;
}

const RolesContext = createContext<RolesState | null>(null);

export function RolesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async (userId: string): Promise<void> => {
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

  const refetchRoles = useCallback((): Promise<void> => {
    if (user) return fetchRoles(user.id);
    return Promise.resolve();
  }, [user, fetchRoles]);

  return (
    <RolesContext.Provider value={{
      roles,
      loading,
      isAdmin: roles.includes("admin"),
      isSeller: roles.includes("seller"),
      isBuyer: roles.includes("buyer"),
      refetchRoles,
    }}>
      {children}
    </RolesContext.Provider>
  );
}

export function useRoles() {
  const ctx = useContext(RolesContext);
  if (!ctx) throw new Error("useRoles must be used inside <RolesProvider>");
  return ctx;
}

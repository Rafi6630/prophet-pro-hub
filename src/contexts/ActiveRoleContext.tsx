import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "./RolesContext";

export type ActiveRole = "buyer" | "seller";
const STORAGE_KEY = "iq_active_role";

interface ActiveRoleState {
  activeRole: ActiveRole;
  switchRole: (role: ActiveRole) => void;
}

const ActiveRoleContext = createContext<ActiveRoleState | null>(null);

export function ActiveRoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isSeller, loading: rolesLoading } = useRoles();

  const [activeRole, setActiveRoleState] = useState<ActiveRole>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ActiveRole | null;
      return stored === "seller" ? "seller" : "buyer";
    } catch { return "buyer"; }
  });

  // Correct stored role if user no longer has the seller role
  useEffect(() => {
    if (rolesLoading) return;
    if (activeRole === "seller" && !isSeller) {
      setActiveRoleState("buyer");
      try { localStorage.setItem(STORAGE_KEY, "buyer"); } catch { /* noop */ }
    }
  }, [rolesLoading, isSeller, activeRole]);

  const switchRole = useCallback((role: ActiveRole) => {
    setActiveRoleState(role);
    try { localStorage.setItem(STORAGE_KEY, role); } catch { /* noop */ }
    // Best-effort persist to profiles (column may not exist yet)
    if (user) {
      supabase
        .from("profiles")
        .update({ active_role: role } as never)
        .eq("user_id", user.id)
        .then(() => { /* ignore error */ });
    }
  }, [user]);

  return (
    <ActiveRoleContext.Provider value={{ activeRole, switchRole }}>
      {children}
    </ActiveRoleContext.Provider>
  );
}

const SAFE_DEFAULT_ACTIVE = {
  activeRole: "buyer" as ActiveRole,
  switchRole: (_role: ActiveRole) => {},
};

export function useActiveRoleCtx() {
  return useContext(ActiveRoleContext) ?? SAFE_DEFAULT_ACTIVE;
}

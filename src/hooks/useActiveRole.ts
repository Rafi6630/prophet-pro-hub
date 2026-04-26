import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";

export type ActiveRole = "buyer" | "seller";

const STORAGE_KEY = "iq_active_role";

/**
 * Manages the user's currently active UI role (buyer ↔ seller).
 *
 * Persistence priority:
 *   1. Supabase profiles.active_role (if column exists and user is authenticated)
 *   2. localStorage fallback (works without schema migration)
 *
 * The switch is instant — no page reload.
 */
export function useActiveRole() {
  const { user } = useAuth();
  const { isSeller, loading: rolesLoading } = useUserRoles();

  const [activeRole, setActiveRoleState] = useState<ActiveRole>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ActiveRole | null;
    return stored === "seller" ? "seller" : "buyer";
  });

  // Once roles are known, correct the active role if needed.
  // E.g. if stored as "seller" but user no longer has seller role, fall back to buyer.
  useEffect(() => {
    if (rolesLoading) return;
    if (activeRole === "seller" && !isSeller) {
      setActiveRoleState("buyer");
      localStorage.setItem(STORAGE_KEY, "buyer");
    }
  }, [rolesLoading, isSeller, activeRole]);

  const switchRole = useCallback(async (role: ActiveRole) => {
    setActiveRoleState(role);
    localStorage.setItem(STORAGE_KEY, role);

    // Best-effort persist to Supabase profiles.active_role.
    // The column may not exist yet — we swallow the error silently.
    if (user) {
      await supabase
        .from("profiles")
        .update({ active_role: role } as never)
        .eq("user_id", user.id)
        .then(() => { /* ignore error — column optional */ });
    }
  }, [user]);

  return { activeRole, switchRole };
}

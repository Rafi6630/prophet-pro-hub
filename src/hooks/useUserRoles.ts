import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "buyer" | "seller" | "developer" | "admin";

/**
 * Fetch all roles assigned to the current user.
 * Note: roles are stored as multiple rows (UNIQUE (user_id, role)).
 */
export function useUserRoles() {
  return useQuery({
    queryKey: ["user-roles"],
    queryFn: async (): Promise<AppRole[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;
      return (data ?? []).map((r: any) => r.role) as AppRole[];
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function getBestHomeRoute(roles: AppRole[]) {
  if (roles.includes("admin")) return "/admin";
  if (roles.includes("developer")) return "/developer";
  if (roles.includes("seller")) return "/seller";
  return "/buyer";
}

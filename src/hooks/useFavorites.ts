import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DbProperty } from "@/types/database";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from("favorites").select("*, property:properties(*)").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((f: any) => f.property).filter(Boolean) as DbProperty[];
    },
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      // Check if already favorited
      const { data: existing } = await supabase.from("favorites").select("id").eq("user_id", user.id).eq("property_id", propertyId).maybeSingle();
      if (existing) {
        await supabase.from("favorites").delete().eq("id", existing.id);
        return { action: "removed" as const };
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, property_id: propertyId } as any);
        return { action: "added" as const };
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["favorites"] }); },
  });
}

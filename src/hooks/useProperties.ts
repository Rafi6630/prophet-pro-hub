import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DbProperty } from "@/types/database";

export function useProperties(filters?: { city?: string; type?: string; search?: string }) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: async () => {
      let q = supabase.from("properties").select("*").eq("status", "active").order("created_at", { ascending: false });
      if (filters?.city && filters.city !== "all") q = q.eq("city", filters.city);
      if (filters?.type && filters.type !== "all") q = q.eq("property_type", filters.type);
      if (filters?.search) q = q.or(`title.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as DbProperty[];
    },
  });
}

export function useMyProperties() {
  return useQuery({
    queryKey: ["my-properties"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from("properties").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DbProperty[];
    },
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ["property", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*, property_images(*)").eq("id", id!).single();
      if (error) throw error;
      return data as DbProperty;
    },
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (property: Partial<DbProperty>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("properties").insert({ ...property, user_id: user.id } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["properties"] }); qc.invalidateQueries({ queryKey: ["my-properties"] }); },
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbProperty> & { id: string }) => {
      const { data, error } = await supabase.from("properties").update(updates as any).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["properties"] }); qc.invalidateQueries({ queryKey: ["my-properties"] }); },
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["properties"] }); qc.invalidateQueries({ queryKey: ["my-properties"] }); },
  });
}

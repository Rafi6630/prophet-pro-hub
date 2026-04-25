import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DbOffer } from "@/types/database";

export function useMyOffers() {
  return useQuery({
    queryKey: ["my-offers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from("offers").select("*").eq("buyer_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DbOffer[];
    },
  });
}

export function useSellerOffers() {
  return useQuery({
    queryKey: ["seller-offers"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from("offers").select("*").eq("seller_id", user.id).order("seriousness_score", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DbOffer[];
    },
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offer: Partial<DbOffer>) => {
      // IMPORTANT: offer creation is enforced server-side (tier limits, elite-only options)
      const { data, error } = await supabase.functions.invoke("create-offer", {
        body: offer,
      });
      if (error) throw error;
      if (!data?.offer) throw new Error("Offer creation failed");
      return data.offer as DbOffer;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-offers"] }); qc.invalidateQueries({ queryKey: ["seller-offers"] }); },
  });
}

export function useUpdateOfferStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, seller_note, counter_price }: { id: string; status: string; seller_note?: string; counter_price?: number }) => {
      const { data, error } = await supabase.from("offers").update({ status, seller_note, counter_price } as any).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["seller-offers"] }); qc.invalidateQueries({ queryKey: ["my-offers"] }); },
  });
}

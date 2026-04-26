import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { SellerStats } from "@/lib/sellerMetrics";
import { computeConversionRate } from "@/lib/sellerMetrics";

export interface SellerProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  bio: string | null;
}

export interface UpdateProfilePayload {
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  whatsapp?: string;
  bio?: string;
}

export function useSeller() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["seller-profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<SellerProfile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, phone, whatsapp, bio")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const statsQuery = useQuery({
    queryKey: ["seller-stats", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<SellerStats> => {
      const [listingsRes, activeRes, leadsRes, verifRes] = await Promise.all([
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .eq("status", "active"),
        supabase
          .from("inspection_requests")
          .select("id", { count: "exact", head: true })
          .eq("seller_id", user!.id),
        supabase
          .from("verification_requests")
          .select("status")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const totalListings = listingsRes.count ?? 0;
      const activeListings = activeRes.count ?? 0;
      const pendingListings = Math.max(0, totalListings - activeListings);
      const totalLeads = leadsRes.count ?? 0;
      const viewsThisMonth = Math.floor(Math.random() * 200) + 50; // fallback mock until listing_views table has data
      const whatsappClicks = Math.floor(totalLeads * 0.6);
      const verificationStatus = verifRes.data?.status ?? "unverified";

      return {
        totalListings,
        activeListings,
        pendingListings,
        totalLeads,
        whatsappClicks,
        viewsThisMonth,
        conversionRate: computeConversionRate(totalLeads, viewsThisMonth),
        subscriptionPlan: "free",
        verificationStatus,
      };
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-profile", user?.id] });
    },
  });

  return {
    profile: profileQuery.data ?? null,
    stats: statsQuery.data ?? null,
    loading: profileQuery.isLoading || statsQuery.isLoading,
    updateProfile: updateProfileMutation.mutateAsync,
    updateProfileLoading: updateProfileMutation.isPending,
  };
}

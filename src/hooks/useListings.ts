import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { DbProperty } from "@/lib/property";

export type ListingFilter = "all" | "active" | "pending" | "sold" | "draft";

export type ListingWithImages = DbProperty & {
  property_images: { id: string; url: string; position: number | null }[];
};

export interface CreateListingPayload {
  title: string;
  property_kind: DbProperty["property_kind"];
  price: number;
  currency?: string;
  city: string;
  district?: string;
  address?: string;
  area_m2: number;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  image_url?: string;
  legal_status?: string;
  features?: string[];
  status?: DbProperty["status"];
}

export interface UpdateListingPayload extends Partial<CreateListingPayload> {
  id: string;
}

export function useListings(filter: ListingFilter = "all") {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const listingsQuery = useQuery({
    queryKey: ["seller-listings", user?.id, filter],
    enabled: !!user,
    queryFn: async (): Promise<ListingWithImages[]> => {
      let query = supabase
        .from("properties")
        .select("*, property_images(id, url, position)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (filter === "active") {
        query = query.eq("status", "active");
      } else if (filter === "draft") {
        query = query.eq("status", "draft");
      } else if (filter === "sold") {
        query = query.eq("status", "sold");
      } else if (filter === "pending") {
        // "pending" = archived in the DB (listing awaiting review)
        query = query.eq("status", "archived");
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ListingWithImages[];
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (payload: CreateListingPayload) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("properties")
        .insert({
          ...payload,
          user_id: user.id,
          status: payload.status ?? "draft",
          features: payload.features ?? [],
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["seller-stats", user?.id] });
    },
  });

  const updateListingMutation = useMutation({
    mutationFn: async ({ id, ...payload }: UpdateListingPayload) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("properties")
        .update(payload)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings", user?.id] });
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["seller-stats", user?.id] });
    },
  });

  return {
    listings: listingsQuery.data ?? [],
    loading: listingsQuery.isLoading,
    error: listingsQuery.error,
    createListing: createListingMutation.mutateAsync,
    updateListing: updateListingMutation.mutateAsync,
    deleteListing: deleteListingMutation.mutateAsync,
    isCreating: createListingMutation.isPending,
    isUpdating: updateListingMutation.isPending,
    isDeleting: deleteListingMutation.isPending,
  };
}

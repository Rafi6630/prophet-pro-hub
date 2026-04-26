import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useListings } from "@/hooks/useListings";
import ListingForm from "@/components/seller/ListingForm";
import type { FullListingData } from "@/lib/listingValidation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { updateListing } = useListings("all");

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listing-detail", id],
    enabled: !!id && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id!)
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  async function handleUpdate(data: FullListingData) {
    if (!id) return;
    try {
      await updateListing({
        id,
        title: data.title,
        property_kind: data.kind,
        price: data.price,
        currency: data.currency,
        city: data.city,
        district: data.district,
        address: data.address,
        area_m2: data.area_m2,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        description: data.description,
        legal_status: data.legal_status,
      });
      toast({ title: "Listing updated successfully!" });
      navigate("/seller/listings");
    } catch (err) {
      toast({
        title: "Failed to update listing",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    }
  }

  const initialData: Partial<FullListingData> | undefined = listing
    ? {
        title: listing.title,
        kind: listing.property_kind,
        price: listing.price,
        currency: (listing.currency as "USD" | "IQD") ?? "USD",
        city: listing.city,
        district: listing.district ?? undefined,
        address: listing.address ?? undefined,
        area_m2: listing.area_m2,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        description: listing.description ?? undefined,
        legal_status: (listing.legal_status as "clear" | "disputed" | "unknown") ?? "unknown",
      }
    : undefined;

  return (
    <>
      <PageMeta
        title="Edit Listing | IraqProperty Seller"
        description="Edit your property listing"
        noIndex
      />

      <div className="px-4 pt-8 pb-12 max-w-2xl mx-auto lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl gap-1 text-slate-500"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">Seller Portal</p>
            <h1 className="text-xl font-extrabold text-slate-900">Edit Listing</h1>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="space-y-4 animate-pulse">
              <div className="h-5 w-48 bg-slate-100 rounded-lg" />
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-32 bg-slate-100 rounded-xl" />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700 font-medium">Failed to load listing.</p>
            <p className="text-red-500 text-sm mt-1">The listing may not exist or you don't have permission.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-xl"
              onClick={() => navigate("/seller/listings")}
            >
              Back to Listings
            </Button>
          </div>
        )}

        {!isLoading && !error && listing && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <ListingForm
              initialData={initialData}
              onSubmit={handleUpdate}
              isEditing
            />
          </div>
        )}
      </div>
    </>
  );
}

export default EditListingPage;

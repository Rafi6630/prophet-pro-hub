import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useListings, type ListingFilter } from "@/hooks/useListings";
import SellerListingCard from "@/components/seller/SellerListingCard";
import EmptyListingsState from "@/components/seller/EmptyListingsState";
import { useToast } from "@/hooks/use-toast";

const FILTER_TABS: { key: ListingFilter; label: string }[] = [
  { key: "all",     label: "All" },
  { key: "active",  label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "sold",    label: "Sold" },
  { key: "draft",   label: "Draft" },
];

export function MyListingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filter, setFilter] = useState<ListingFilter>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { listings, loading, deleteListing, isDeleting } = useListings(filter);

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deleteListing(deleteId);
      toast({ title: "Listing deleted successfully" });
    } catch {
      toast({ title: "Failed to delete listing", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  }

  function handlePromote() {
    toast({ title: "Promote feature coming soon!", description: "Featured listings will be available in Pro plan." });
  }

  return (
    <>
      <PageMeta
        title="My Listings | IraqProperty Seller"
        description="Manage your property listings"
        noIndex
      />

      <div className="px-4 pt-8 pb-8 max-w-7xl mx-auto lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">Seller Portal</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">My Listings</h1>
          </div>
          <Button
            asChild
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white gap-2"
          >
            <Link to="/seller/create">
              <Plus className="h-4 w-4" />
              New Listing
            </Link>
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-6">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listing grid */}
        {loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white h-64 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyListingsState />
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <SellerListingCard
                key={listing.id}
                property={listing}
                onEdit={() => navigate(`/seller/listings/${listing.id}/edit`)}
                onDelete={() => setDeleteId(listing.id)}
                onPromote={handlePromote}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Listing?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The listing and all its data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 sm:hidden z-50">
        <Button
          asChild
          size="lg"
          className="h-14 w-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-xl p-0"
        >
          <Link to="/seller/create">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </>
  );
}

export default MyListingsPage;

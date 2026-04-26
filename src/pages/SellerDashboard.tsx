import { Link, useNavigate } from "react-router-dom";
import { Plus, CheckCircle, Circle, ArrowRight } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import { Button } from "@/components/ui/button";
import { useSeller } from "@/hooks/useSeller";
import { useListings } from "@/hooks/useListings";
import { useLeads } from "@/hooks/useLeads";
import { generateMockChartData } from "@/lib/sellerMetrics";
import SellerStatsCards from "@/components/seller/SellerStatsCards";
import PerformanceChart from "@/components/seller/PerformanceChart";
import LeadCard from "@/components/seller/LeadCard";
import VerificationBanner from "@/components/seller/VerificationBanner";
import UpgradePlanCard from "@/components/seller/UpgradePlanCard";
import SellerListingCard from "@/components/seller/SellerListingCard";
import { useToast } from "@/hooks/use-toast";

function getVerifStatus(s: string): "unverified" | "pending" | "verified" | "trusted" {
  if (s === "approved") return "verified";
  if (s === "pending")  return "pending";
  if (s === "premium")  return "trusted";
  return "unverified";
}

export function SellerDashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, stats, loading: sellerLoading } = useSeller();
  const { listings, loading: listingsLoading, deleteListing } = useListings("all");
  const { leads, loading: leadsLoading, updateLeadStatus, archiveLead } = useLeads();

  const chartData = generateMockChartData();
  const recentListings = listings.slice(0, 3);
  const recentLeads = leads.slice(0, 3);

  const verifStatus = getVerifStatus(stats?.verificationStatus ?? "unverified");
  const isOnFreePlan = !stats || stats.subscriptionPlan === "free";

  const profileComplete = !!(profile?.display_name && profile?.phone && profile?.whatsapp && profile?.bio);
  const tasks = [
    { label: "Complete your profile",       done: profileComplete },
    { label: "Upload your first listing",   done: listings.length > 0 },
    { label: "Add a cover photo",           done: listings.some(l => l.property_images?.length > 0) },
    { label: "Verify your identity",        done: verifStatus === "verified" || verifStatus === "trusted" },
    { label: "Get your first lead",         done: leads.length > 0 },
  ];

  async function handleDelete(id: string) {
    try {
      await deleteListing(id);
      toast({ title: "Listing deleted" });
    } catch {
      toast({ title: "Error deleting listing", variant: "destructive" });
    }
  }

  function handlePromote() {
    toast({ title: "Coming Soon", description: "Promoted listings will be available shortly." });
  }

  function handleWhatsapp(leadId: string) {
    const lead = leads.find(l => l.id === leadId);
    if (lead?.phone) {
      window.open(`https://wa.me/${lead.phone.replace(/\D/g, "")}`, "_blank");
    } else {
      toast({ title: "No phone number available" });
    }
  }

  function handleCall(leadId: string) {
    const lead = leads.find(l => l.id === leadId);
    if (lead?.phone) {
      window.open(`tel:${lead.phone}`, "_self");
    } else {
      toast({ title: "No phone number available" });
    }
  }

  const displayName = profile?.display_name ?? "Seller";

  return (
    <>
      <PageMeta
        title="Seller Dashboard | IraqProperty"
        description="Manage your property listings, leads, and analytics."
        noIndex
      />

      <div className="px-4 pt-8 pb-4 max-w-7xl mx-auto lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">Seller Portal</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900 lg:text-3xl">
              Welcome back, {displayName}
            </h1>
          </div>
          <Button
            asChild
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white gap-2 hidden sm:flex"
          >
            <Link to="/seller/create">
              <Plus className="h-4 w-4" />
              New Listing
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          {/* Stats */}
          {sellerLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 h-28 animate-pulse" />
              ))}
            </div>
          ) : stats ? (
            <SellerStatsCards stats={stats} />
          ) : null}

          {/* Performance Chart */}
          <PerformanceChart data={chartData} loading={false} />

          {/* Verification Banner */}
          {verifStatus !== "trusted" && verifStatus !== "verified" && (
            <VerificationBanner
              status={verifStatus}
              onStartVerification={() => navigate("/seller/verification")}
            />
          )}

          {/* Two-column layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Listings (2/3 width) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Recent Listings</h2>
                <Button asChild variant="ghost" size="sm" className="text-amber-600 gap-1 text-xs">
                  <Link to="/seller/listings">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              {listingsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white h-64 animate-pulse" />
                  ))}
                </div>
              ) : recentListings.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentListings.map((listing) => (
                    <SellerListingCard
                      key={listing.id}
                      property={listing}
                      onEdit={() => navigate(`/seller/listings/${listing.id}/edit`)}
                      onDelete={() => handleDelete(listing.id)}
                      onPromote={handlePromote}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                  <p className="text-slate-500 text-sm">No listings yet.</p>
                  <Button asChild size="sm" className="mt-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
                    <Link to="/seller/create">Create First Listing</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Tasks Checklist + Recent Leads (1/3 width) */}
            <div className="space-y-4">
              {/* Onboarding tasks */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Getting Started</h3>
                <ul className="space-y-2.5">
                  {tasks.map((task) => (
                    <li key={task.label} className="flex items-center gap-2.5 text-sm">
                      {task.done ? (
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="h-4.5 w-4.5 text-slate-300 shrink-0" />
                      )}
                      <span className={task.done ? "line-through text-slate-400" : "text-slate-700"}>
                        {task.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Leads */}
          {recentLeads.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Recent Leads</h2>
                <Button asChild variant="ghost" size="sm" className="text-amber-600 gap-1 text-xs">
                  <Link to="/seller/leads">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {leadsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white h-48 animate-pulse" />
                  ))
                ) : (
                  recentLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onStatusChange={(id, status) => updateLeadStatus({ id, status })}
                      onWhatsapp={handleWhatsapp}
                      onCall={handleCall}
                      onArchive={(id) => archiveLead(id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Upgrade Plan (if free) */}
          {isOnFreePlan && (
            <UpgradePlanCard
              currentPlan={stats?.subscriptionPlan ?? "free"}
              onUpgrade={() => navigate("/seller/subscription")}
            />
          )}
        </div>
      </div>

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

export default SellerDashboardPage;

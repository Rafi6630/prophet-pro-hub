import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BadgeCheck, Plus } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sampleProperties } from "@/data/sampleProperties";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// SellerLayout already ensures the user is authenticated + has the seller role.
// No SellerAccessGate needed here.

export function SellerDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const listings = sampleProperties.slice(0, 4);

  const { data: counts } = useQuery({
    queryKey: ["seller-dashboard-counts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [myListings, leads, verif] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("inspection_requests").select("id", { count: "exact", head: true }).eq("seller_id", user!.id),
        supabase.from("verification_requests").select("status").eq("user_id", user!.id)
          .order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      return {
        listings: myListings.count ?? listings.length,
        leads: leads.count ?? 41,
        verifStatus: verif.data?.status ?? null,
      };
    },
  });

  return (
    <>
      <PageMeta title={`${t("sellerPortal.overview")} | IraqProperty`} noIndex />

      {/* Page header */}
      <div className="px-4 pt-8 pb-4 max-w-3xl mx-auto lg:px-8 lg:pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">
          {t("sellerPortal.title")}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900 lg:text-3xl">
          {t("sellerPortal.overview")}
        </h1>
      </div>

      <div className="px-4 pb-8 space-y-6 max-w-3xl mx-auto lg:px-8">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [t("sellerPortal.statsListings"),  `${counts?.listings ?? listings.length}`],
            [t("sellerPortal.statsLeads"),      `${counts?.leads ?? 41}`],
            [t("sellerPortal.statsScore"),      "92/100"],
            [t("sellerPortal.verification"),    counts?.verifStatus ? t(`verification.${counts.verifStatus === "approved" ? "approved" : counts.verifStatus === "rejected" ? "rejected" : "pending"}`) : t("verification.pending")],
          ].map(([label, value]) => (
            <Card key={label} className="shadow-sm border-slate-200">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My listings */}
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">
                {t("sellerPortal.myListings")}
              </p>
              <Button asChild size="sm" className="rounded-xl text-xs h-8 gap-1">
                <Link to="/seller/listings/new">
                  <Plus className="h-3.5 w-3.5" />
                  {t("sellerPortal.newListing")}
                </Link>
              </Button>
            </div>
            {listings.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm text-muted-foreground">{t("sellerPortal.noListings")}</p>
                <p className="text-xs text-muted-foreground max-w-xs">{t("sellerPortal.noListingsDesc")}</p>
                <Button asChild size="sm" className="rounded-xl mt-2">
                  <Link to="/seller/listings/new">{t("sellerPortal.createFirst")}</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {listings.map(property => (
                  <div key={property.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-sm text-slate-800">{property.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {property.visibility} · {property.ownershipStatus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Onboarding checklist */}
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600 mb-4">
              {t("sellerPortal.onboarding")}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                t("sellerPortal.step1"),
                t("sellerPortal.step2"),
                t("sellerPortal.step3"),
                t("sellerPortal.step4"),
              ].map((step, i) => (
                <div key={step} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                    {i + 1}
                  </span>
                  <span className="text-slate-700 leading-snug">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Verification CTA */}
        <Card className="shadow-sm border-emerald-200 bg-emerald-50">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" />
              <div>
                <h3 className="font-bold text-emerald-900">{t("sellerPortal.verificationCTA")}</h3>
                <p className="mt-1 text-sm text-emerald-700">{t("sellerPortal.verificationDesc")}</p>
              </div>
            </div>
            <Button asChild className="shrink-0 bg-emerald-700 hover:bg-emerald-800 rounded-xl">
              <Link to="/seller/verification">{t("sellerPortal.verificationCTA")}</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">
              {t("sellerPortal.subscription")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t("sellerPortal.subscriptionDesc")}</p>
            <Button asChild variant="outline" className="mt-4 rounded-xl border-slate-200 w-full sm:w-auto">
              <Link to="/dashboard/subscription">{t("dashboard.viewPlans")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default SellerDashboardPage;

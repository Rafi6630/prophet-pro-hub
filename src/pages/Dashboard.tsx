import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart, Send, Eye, Bell, Building2, Plus, ShieldCheck,
  Users, BarChart3, FileCheck, LogOut, Search, Settings, UserCircle2, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles, addRole } from "@/hooks/useUserRoles";
import { useActiveRole } from "@/hooks/useActiveRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getSearchAlerts, getSavedSearches, type SavedSearch, type SearchAlert } from "@/lib/savedSearches";
import { useMemo, useState } from "react";
import { getSeededPublicProperties } from "@/lib/sampleInventory";

function StatCard({ icon: Icon, label, value, to }: {
  icon: React.ElementType; label: string; value: number | string; to?: string;
}) {
  const inner = (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card card-hover">
      <Icon className="w-6 h-6 text-primary mb-3" />
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { isAdmin, isSeller, refetchRoles } = useUserRoles();
  const { switchRole } = useActiveRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [alerts, setAlerts] = useState<SearchAlert[]>([]);
  useEffect(() => { document.title = `${t("dashboard.title")} — ${t("common.appName")}`; }, [t]);
  useEffect(() => {
    setSavedSearches(getSavedSearches());
    setAlerts(getSearchAlerts());
  }, []);

  const recommendedMatches = useMemo(() => {
    const seeded = getSeededPublicProperties();
    return savedSearches.flatMap((search) =>
      seeded.filter((property) => {
        const cityMatch = search.cityId === "all" || property.city === search.cityId;
        const priceMatch = property.price >= search.minPrice && property.price <= search.maxPrice;
        const verifiedMatch = !search.verifiedOnly || ["verified", "premium"].includes(property.verification_level);
        return cityMatch && priceMatch && verifiedMatch;
      }).slice(0, 2),
    );
  }, [savedSearches]);

  const { data: counts } = useQuery({
    queryKey: ["dashboard-counts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [favs, offersBuyer, offersSeller, listings, leads, verif] = await Promise.all([
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("offers").select("id", { count: "exact", head: true }).eq("buyer_id", user!.id),
        supabase.from("offers").select("id", { count: "exact", head: true }).eq("seller_id", user!.id),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("inspection_requests").select("id", { count: "exact", head: true }).eq("seller_id", user!.id),
        supabase.from("verification_requests").select("status").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      return {
        favs: favs.count ?? 0,
        offersBuyer: offersBuyer.count ?? 0,
        offersSeller: offersSeller.count ?? 0,
        listings: listings.count ?? 0,
        leads: leads.count ?? 0,
        verifStatus: verif.data?.status ?? null,
      };
    },
  });

  const becomeSeller = async () => {
    if (!user) return;
    const { error } = await addRole(user.id, "seller");
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      return;
    }
    await refetchRoles();
    switchRole("seller");
    toast({ title: t("dashboard.sellerActivated") });
    navigate("/seller/dashboard");
  };

  const tabs = [
    { id: "buyer", show: true, label: t("dashboard.buyer.title") },
    { id: "seller", show: isSeller, label: t("dashboard.seller.title") },
    { id: "admin", show: isAdmin, label: t("dashboard.admin.title") },
  ].filter(tab => tab.show);

  return (
    <div className="container-app py-6 lg:py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
        </div>
        <Button variant="outline" onClick={signOut} className="gap-2">
          <LogOut className="w-4 h-4 flip-rtl" />
          <span className="hidden sm:inline">{t("common.signOut")}</span>
        </Button>
      </div>

      <Tabs defaultValue={tabs[0]?.id ?? "buyer"}>
        <TabsList className="mb-6">
          {tabs.map(tab => <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="buyer">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Heart} label={t("dashboard.buyer.saved")} value={counts?.favs ?? 0} to="/favorites" />
            <StatCard icon={Send} label={t("dashboard.buyer.offers")} value={counts?.offersBuyer ?? 0} />
            <StatCard icon={Eye} label={t("dashboard.buyer.viewed")} value={"—"} />
            <StatCard icon={Bell} label={t("dashboard.buyer.alerts")} value={alerts.length} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Link to="/dashboard/profile" className="content-panel p-5">
              <UserCircle2 className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-bold">{t("dashboard.profile")}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("dashboard.profileDesc")}</p>
            </Link>
            <Link to="/dashboard/settings" className="content-panel p-5">
              <Settings className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-bold">{t("dashboard.settings")}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("dashboard.settingsDesc")}</p>
            </Link>
            <Link to="/dashboard/subscription" className="content-panel p-5">
              <CreditCard className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-bold">{t("dashboard.subscription")}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("dashboard.subscriptionDesc")}</p>
            </Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="content-panel p-5">
              <div className="flex items-center gap-2 text-primary">
                <Search className="h-4 w-4" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em]">Saved Searches</p>
              </div>
              <div className="mt-5 space-y-3">
                {savedSearches.length ? savedSearches.map((search) => (
                  <div key={search.id} className="rounded-2xl border border-border bg-secondary/30 p-4">
                    <p className="font-semibold">{search.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {search.verifiedOnly ? "Verified only" : "All listings"} • {new Date(search.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
                    No saved searches yet. Create one from Map Search to start tracking verified inventory.
                  </div>
                )}
              </div>
            </div>
            <div className="content-panel p-5">
              <div className="flex items-center gap-2 text-primary">
                <Bell className="h-4 w-4" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em]">Alerts</p>
              </div>
              <div className="mt-5 space-y-3">
                {alerts.length ? alerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-border bg-secondary/30 p-4">
                    <p className="font-semibold">{alert.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{new Date(alert.createdAt).toLocaleDateString()}</p>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
                    No alerts yet. Save a verified search to start receiving match notifications.
                  </div>
                )}
              </div>
            </div>
          </div>
          {recommendedMatches.length > 0 && (
            <div className="content-panel mt-6 p-5">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-sm font-semibold uppercase tracking-[0.24em]">New verified matches</p>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {recommendedMatches.slice(0, 4).map((property) => (
                  <Link key={`${property.id}-match`} to={`/property/${property.id}`} className="rounded-2xl border border-border bg-secondary/30 p-4">
                    <p className="font-semibold">{property.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{property.city}{property.district ? ` • ${property.district}` : ""}</p>
                    <p className="mt-2 text-sm font-bold text-primary">${property.price.toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {!isSeller && (
            <div className="mt-8 bg-gradient-navy text-white rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">{t("dashboard.becomeSeller")}</h3>
                <p className="text-white/70 text-sm mt-1">{t("dashboard.becomeSellerDesc")}</p>
              </div>
              <Button onClick={becomeSeller} className="bg-gold text-accent-foreground hover:bg-gold/90">{t("dashboard.becomeSeller")}</Button>
            </div>
          )}
        </TabsContent>

        {isSeller && (
          <TabsContent value="seller">
            <div className="mb-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="content-panel p-5">
                <h3 className="text-lg font-bold">{t("dashboard.subscription")}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("dashboard.subscriptionDesc")}</p>
              </div>
              <div className="flex gap-3">
                <Link to="/dashboard/subscription">
                  <Button variant="outline" className="gap-2"><CreditCard className="w-4 h-4" />{t("dashboard.viewPlans")}</Button>
                </Link>
                <Link to="/listings/new">
                  <Button className="gap-2"><Plus className="w-4 h-4" />{t("dashboard.seller.newListing")}</Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Building2} label={t("dashboard.seller.listings")} value={counts?.listings ?? 0} />
              <StatCard icon={Send} label={t("dashboard.buyer.offers")} value={counts?.offersSeller ?? 0} />
              <StatCard icon={Users} label={t("dashboard.seller.leads")} value={counts?.leads ?? 0} />
              <StatCard icon={ShieldCheck} label={t("dashboard.seller.verification")} value={counts?.verifStatus ? t(`verification.${counts.verifStatus === "approved" ? "approved" : counts.verifStatus === "rejected" ? "rejected" : "pending"}`) : "—"} to="/verification" />
            </div>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="admin">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Building2} label={t("dashboard.admin.moderation")} value={"—"} />
              <StatCard icon={FileCheck} label={t("dashboard.admin.verifications")} value={"—"} />
              <StatCard icon={ShieldCheck} label={t("dashboard.admin.reports")} value={"—"} />
              <StatCard icon={BarChart3} label={t("dashboard.admin.analytics")} value={"—"} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

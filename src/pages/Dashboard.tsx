import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart, Send, Eye, Bell, Building2, Plus, ShieldCheck,
  Users, BarChart3, FileCheck, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles, addRole } from "@/hooks/useUserRoles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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
  const { isAdmin, isSeller, isBuyer } = useUserRoles();
  const { toast } = useToast();
  useEffect(() => { document.title = `${t("dashboard.title")} — ${t("common.appName")}`; }, [t]);

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
    if (error && !error.message.includes("duplicate")) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("common.success") });
      window.location.reload();
    }
  };

  const tabs = [
    { id: "buyer", show: true, label: t("dashboard.buyer.title") },
    { id: "seller", show: isSeller, label: t("dashboard.seller.title") },
    { id: "admin", show: isAdmin, label: t("dashboard.admin.title") },
  ].filter(t => t.show);

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
            <StatCard icon={Bell} label={t("dashboard.buyer.alerts")} value={"—"} />
          </div>
          {!isSeller && (
            <div className="mt-8 bg-gradient-navy text-white rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">{t("dashboard.becomeSeller")}</h3>
                <p className="text-white/70 text-sm mt-1">{t("home.cta.list")}</p>
              </div>
              <Button onClick={becomeSeller} className="bg-gold text-accent-foreground hover:bg-gold/90">{t("dashboard.becomeSeller")}</Button>
            </div>
          )}
        </TabsContent>

        {isSeller && (
          <TabsContent value="seller">
            <div className="flex justify-end mb-4">
              <Link to="/listings/new">
                <Button className="gap-2"><Plus className="w-4 h-4" />{t("dashboard.seller.newListing")}</Button>
              </Link>
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

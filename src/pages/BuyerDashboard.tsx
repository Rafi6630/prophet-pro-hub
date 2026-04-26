import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Heart, Send, Bell, Search, Settings, UserCircle2, CreditCard,
  Building2, ChevronRight, ShieldCheck, Sparkles, LogOut,
  Map, TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles, addRole } from "@/hooks/useUserRoles";
import { useActiveRole } from "@/hooks/useActiveRole";
import { useToast } from "@/hooks/use-toast";
import PageMeta from "@/components/common/PageMeta";
import { getSearchAlerts, getSavedSearches } from "@/lib/savedSearches";
import { getSeededPublicProperties } from "@/lib/sampleInventory";

/* ── Stat pill ───────────────────────────────────────────── */
function StatPill({ icon: Icon, label, value, to }: {
  icon: React.ElementType; label: string; value: number | string; to?: string;
}) {
  const inner = (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border/60 bg-white px-4 py-4 shadow-sm transition hover:border-primary/30 hover:shadow-md active:scale-95">
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-xl font-extrabold tabular-nums">{value}</span>
      <span className="text-[11px] font-medium text-muted-foreground leading-tight text-center">{label}</span>
    </div>
  );
  return to ? <Link to={to} className="contents">{inner}</Link> : inner;
}

/* ── Quick action button ─────────────────────────────────── */
function QuickAction({ icon: Icon, label, to, accent = false }: {
  icon: React.ElementType; label: string; to: string; accent?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-sm font-semibold shadow-sm transition active:scale-95 hover:shadow-md ${
        accent
          ? "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
          : "border-border/60 bg-white text-foreground hover:border-primary/20 hover:bg-primary/3"
      }`}
    >
      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${accent ? "bg-primary/10" : "bg-secondary/50"}`}>
        <Icon className={`h-5 w-5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 flip-rtl" />
    </Link>
  );
}

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { isSeller, loading: rolesLoading, refetchRoles } = useUserRoles();
  const { switchRole } = useActiveRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState<ReturnType<typeof getSavedSearches>>([]);
  const [alerts, setAlerts] = useState<ReturnType<typeof getSearchAlerts>>([]);

  useEffect(() => {
    document.title = `${t("buyerDashboard.title")} — IraqProperty`;
    setSavedSearches(getSavedSearches());
    setAlerts(getSearchAlerts());
  }, [t]);

  const { data: counts } = useQuery({
    queryKey: ["buyer-dashboard-counts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [favs, offers] = await Promise.all([
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("offers").select("id", { count: "exact", head: true }).eq("buyer_id", user!.id),
      ]);
      return { favs: favs.count ?? 0, offers: offers.count ?? 0 };
    },
  });

  const recommendedMatches = useMemo(() => {
    const seeded = getSeededPublicProperties();
    return savedSearches.flatMap(search =>
      seeded.filter(p => {
        const cityOk = search.cityId === "all" || p.city === search.cityId;
        const priceOk = p.price >= search.minPrice && p.price <= search.maxPrice;
        const verifOk = !search.verifiedOnly || ["verified","premium"].includes(p.verification_level);
        return cityOk && priceOk && verifOk;
      }).slice(0, 2),
    ).slice(0, 4);
  }, [savedSearches]);

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

  const displayName = user?.email?.split("@")[0] ?? t("buyerDashboard.welcome");

  return (
    <>
      <PageMeta title={`${t("buyerDashboard.title")} | IraqProperty`} description="Your IraqProperty buyer dashboard." noIndex />

      {/* ── Hero welcome strip ──────────────────────────────── */}
      <div className="hero-shell px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6 lg:px-8">
        <div className="flex items-start justify-between gap-3 max-w-2xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300/80">
              IraqProperty
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-white lg:text-3xl">
              {t("buyerDashboard.welcome")}, {displayName}
            </h1>
            <p className="mt-1 text-sm text-white/60">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/8 text-white/60 hover:text-white transition-colors"
            aria-label={t("common.signOut")}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Stat pills */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          <StatPill icon={Heart} label={t("dashboard.buyer.saved")} value={counts?.favs ?? 0} to="/favorites" />
          <StatPill icon={Send} label={t("dashboard.buyer.offers")} value={counts?.offers ?? 0} />
          <StatPill icon={Bell} label={t("dashboard.buyer.alerts")} value={alerts.length} />
          <StatPill icon={Search} label={t("buyerDashboard.savedSearches")} value={savedSearches.length} />
        </div>
      </div>

      <div className="px-4 pt-6 pb-2 space-y-6 max-w-2xl mx-auto lg:max-w-3xl lg:px-8">

        {/* ── Quick actions ───────────────────────────────────── */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("buyerDashboard.quickActions")}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <QuickAction icon={Search}     label={t("buyerDashboard.browse")}      to="/buy"        accent />
            <QuickAction icon={Map}        label={t("nav.map")}                    to="/map" />
            <QuickAction icon={TrendingUp} label={t("nav.investment")}             to="/investment" />
            <QuickAction icon={Heart}      label={t("buyerDashboard.myFavorites")} to="/favorites" />
          </div>
        </section>

        {/* ── Account cards ────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("dashboard.overview")}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: UserCircle2, label: t("buyerDashboard.profile"),       desc: t("buyerDashboard.profileDesc"),       to: "/dashboard/profile" },
              { icon: Settings,    label: t("buyerDashboard.settings"),      desc: t("buyerDashboard.settingsDesc"),      to: "/dashboard/settings" },
              { icon: CreditCard,  label: t("buyerDashboard.subscription"),  desc: t("buyerDashboard.subscriptionDesc"),  to: "/dashboard/subscription" },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="content-panel flex flex-col gap-3 p-5 transition hover:shadow-lg active:scale-[0.98]"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-bold text-sm">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 ms-auto flip-rtl" />
              </Link>
            ))}
          </div>
        </section>

        {/* ── Saved searches ───────────────────────────────────── */}
        <section className="content-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary">
              <Search className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">{t("buyerDashboard.savedSearches")}</p>
            </div>
            <Link to="/map" className="text-xs font-semibold text-primary hover:underline">
              {t("common.viewAll")} →
            </Link>
          </div>
          <div className="space-y-2">
            {savedSearches.length ? savedSearches.slice(0, 3).map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 px-4 py-3">
                <p className="text-sm font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</p>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-4">
                {t("buyerDashboard.noSavedSearches")}
              </p>
            )}
          </div>
        </section>

        {/* ── Verified matches ─────────────────────────────────── */}
        {recommendedMatches.length > 0 && (
          <section className="content-panel p-5">
            <div className="flex items-center gap-2 text-primary mb-4">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">{t("buyerDashboard.verifiedMatches")}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {recommendedMatches.map(p => (
                <Link
                  key={`${p.id}-match`}
                  to={`/property/${p.id}`}
                  className="rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 transition hover:border-primary/25 hover:bg-primary/3 active:scale-[0.98]"
                >
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.city}{p.district ? ` · ${p.district}` : ""}</p>
                  <p className="mt-1 text-sm font-bold text-primary">${p.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Become seller CTA ────────────────────────────────── */}
        {!rolesLoading && !isSeller && (
          <section className="rounded-[1.75rem] overflow-hidden shadow-lg">
            <div className="hero-shell px-6 py-7 text-white">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/20">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg leading-snug">{t("buyerDashboard.becomeSellerCTA")}</h3>
                  <p className="mt-1.5 text-sm text-white/70 leading-relaxed">{t("buyerDashboard.becomeSellerDesc")}</p>
                </div>
              </div>
              <Button
                onClick={becomeSeller}
                className="mt-5 w-full rounded-xl bg-amber-500 text-[#080e1c] hover:bg-amber-400 font-bold text-sm h-11"
              >
                <Building2 className="h-4 w-4" />
                {t("buyerDashboard.activateSeller")}
              </Button>
            </div>
          </section>
        )}

        {/* Bottom breathing room for mobile nav */}
        <div className="h-4" />
      </div>
    </>
  );
}

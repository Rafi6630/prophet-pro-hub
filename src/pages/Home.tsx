import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Home as HomeIcon, TreePine, TrendingUp, Building2,
  ShieldCheck, Coins, FileCheck, BarChart3, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyCard, { PropertyCardSkeleton } from "@/components/PropertyCard";
import type { PropertyWithMedia, PropertyKind } from "@/lib/property";

const QUICK = [
  { kind: "house" as PropertyKind, icon: HomeIcon, key: "buyHouse" },
  { kind: "land" as PropertyKind, icon: TreePine, key: "buyLand" },
  { kind: null, icon: TrendingUp, key: "investmentDeals", route: "/investment" },
  { kind: "commercial" as PropertyKind, icon: Building2, key: "commercial" },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, key: "verified", color: "text-trust" },
  { icon: Coins, key: "fairPrice", color: "text-gold" },
  { icon: FileCheck, key: "ownership", color: "text-info" },
  { icon: BarChart3, key: "intelligence", color: "text-primary" },
] as const;

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [kind, setKind] = useState<PropertyKind | "">("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    document.title = `${t("common.appName")} — ${t("common.tagline")}`;
  }, [t]);

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data } = await supabase.from("cities").select("*").eq("active", true).order("sort_order");
      return data ?? [];
    },
  });

  const { data: featured = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ["home-featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*, property_images(*)")
        .eq("status", "active")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(6);
      return (data ?? []) as PropertyWithMedia[];
    },
  });

  const { data: deals = [], isLoading: loadingDeals } = useQuery({
    queryKey: ["home-deals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*, property_images(*)")
        .eq("status", "active")
        .eq("investment_deal", true)
        .order("created_at", { ascending: false })
        .limit(6);
      return (data ?? []) as PropertyWithMedia[];
    },
  });

  // Stats: real counts where possible
  const { data: stats } = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const [verified, citiesCount] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true })
          .in("verification_level", ["verified", "premium"]),
        supabase.from("cities").select("id", { count: "exact", head: true }).eq("active", true),
      ]);
      return {
        verifiedListings: verified.count ?? 0,
        citiesCovered: citiesCount.count ?? 0,
      };
    },
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (kind) params.set("kind", kind);
    if (budget) params.set("max", budget);
    navigate(`/buy?${params.toString()}`);
  };

  const statValues = useMemo(() => [
    { value: stats?.verifiedListings ?? 0, key: "verifiedListings", suffix: "+" },
    { value: stats?.citiesCovered ?? 11, key: "citiesCovered", suffix: "" },
    { value: 1280, key: "activeBuyers", suffix: "+" },
    { value: 340, key: "dealsClosed", suffix: "+" },
  ], [stats]);

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(circle at 20% 30%, hsl(var(--gold) / 0.5), transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--trust) / 0.4), transparent 50%)" }} />
        <div className="container-app relative pt-12 pb-8 lg:pt-20 lg:pb-16">
          <div className="max-w-3xl">
            <span className="gold-badge mb-4">{t("common.appName")}</span>
            <h1 className="text-hero text-gradient-gold mb-4">
              {t("home.tagline")}
            </h1>
            <p className="text-base sm:text-lg text-white/80 mb-8 max-w-2xl">
              {t("home.subtitle")}
            </p>
          </div>

          {/* Search bar */}
          <div className="bg-card text-foreground rounded-2xl shadow-xl p-3 lg:p-4 max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="h-12 px-3 rounded-xl bg-secondary border-0 font-medium"
              >
                <option value="">{t("home.hero.anyCity")}</option>
                {cities.map(c => (
                  <option key={c.id} value={c.name_en}>
                    {c.name_ar} · {c.name_en}
                  </option>
                ))}
              </select>
              <select
                value={kind}
                onChange={e => setKind(e.target.value as PropertyKind)}
                className="h-12 px-3 rounded-xl bg-secondary border-0 font-medium"
              >
                <option value="">{t("home.hero.anyType")}</option>
                {(["house","apartment","villa","land","commercial","office","shop"] as const).map(k => (
                  <option key={k} value={k}>{t(`property.kind.${k}`)}</option>
                ))}
              </select>
              <select
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="h-12 px-3 rounded-xl bg-secondary border-0 font-medium"
              >
                <option value="">{t("home.hero.anyBudget")}</option>
                <option value="50000">$50K</option>
                <option value="100000">$100K</option>
                <option value="250000">$250K</option>
                <option value="500000">$500K</option>
                <option value="1000000">$1M</option>
              </select>
              <Button
                onClick={handleSearch}
                size="lg"
                className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2"
              >
                <Search className="w-4 h-4" />
                {t("home.hero.search")}
              </Button>
            </div>

            {/* Quick action chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {QUICK.map(q => (
                <button
                  key={q.key}
                  onClick={() => q.route ? navigate(q.route) : navigate(`/buy?kind=${q.kind}`)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary hover:bg-gold/10 hover:text-gold border border-transparent hover:border-gold/20 text-sm font-semibold transition"
                >
                  <q.icon className="w-4 h-4" />
                  {t(`home.hero.${q.key}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8 lg:mt-12">
            {statValues.map(s => (
              <div key={s.key} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 lg:p-5">
                <div className="text-2xl lg:text-3xl font-extrabold text-gold-soft">
                  {s.value.toLocaleString()}{s.suffix}
                </div>
                <div className="text-xs lg:text-sm text-white/70 mt-1">{t(`home.stats.${s.key}`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured ── */}
      <section className="container-app py-12 lg:py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold">{t("home.featured.title")}</h2>
            <p className="text-muted-foreground mt-1">{t("home.featured.subtitle")}</p>
          </div>
          <Link to="/buy" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            {t("common.viewAll")} <ArrowRight className="w-4 h-4 flip-rtl" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {loadingFeatured
            ? Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : featured.length === 0
            ? <div className="col-span-full text-center py-12 text-muted-foreground">{t("buy.noListings")}</div>
            : featured.map(p => <PropertyCard key={p.id} p={p} />)
          }
        </div>
      </section>

      {/* ── Investment deals ── */}
      <section className="bg-secondary/40 py-12 lg:py-16">
        <div className="container-app">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="gold-badge mb-2">{t("nav.investment")}</span>
              <h2 className="text-2xl lg:text-3xl font-extrabold mt-2">{t("home.investment.title")}</h2>
              <p className="text-muted-foreground mt-1">{t("home.investment.subtitle")}</p>
            </div>
            <Link to="/investment" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              {t("common.viewAll")} <ArrowRight className="w-4 h-4 flip-rtl" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {loadingDeals
              ? Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : deals.length === 0
              ? <div className="col-span-full text-center py-12 text-muted-foreground">{t("investment.noDeals")}</div>
              : deals.map(p => <PropertyCard key={p.id} p={p} />)
            }
          </div>
        </div>
      </section>

      {/* ── Why trust us ── */}
      <section className="container-app py-12 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl lg:text-3xl font-extrabold">{t("home.trust.title")}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRUST_ITEMS.map(item => (
            <div key={item.key} className="bg-card rounded-2xl p-6 shadow-card border border-border card-hover">
              <div className={`w-12 h-12 rounded-xl bg-secondary grid place-items-center mb-4 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">{t(`home.trust.${item.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`home.trust.${item.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="bg-gradient-navy text-white py-12 lg:py-16">
        <div className="container-app text-center">
          <h2 className="text-2xl lg:text-4xl font-extrabold mb-3">{t("home.cta.title")}</h2>
          <p className="text-white/75 mb-6 max-w-xl mx-auto">{t("home.cta.subtitle")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/buy">
              <Button size="lg" className="bg-gold text-accent-foreground hover:bg-gold/90 font-bold">
                {t("home.cta.browse")}
              </Button>
            </Link>
            <Link to="/listings/new">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                {t("home.cta.list")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

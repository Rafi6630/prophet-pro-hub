import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Home as HomeIcon, TreePine, TrendingUp, Building2,
  ShieldCheck, Coins, FileCheck, BarChart3, ArrowRight, BadgeCheck, MapPinned, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyCard, { PropertyCardSkeleton } from "@/components/PropertyCard";
import type { PropertyWithMedia, PropertyKind } from "@/lib/property";
import { featuredSeededProperties, getSeededPublicProperties, investmentSeededProperties } from "@/lib/sampleInventory";

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

const HERO_BENEFITS = [
  { icon: BadgeCheck, label: "Verified sellers first" },
  { icon: Coins, label: "Fair-price context" },
  { icon: MapPinned, label: "Area intelligence" },
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
      return ((data?.length ? data : featuredSeededProperties()) ?? []) as PropertyWithMedia[];
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
      return ((data?.length ? data : investmentSeededProperties()) ?? []) as PropertyWithMedia[];
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
        verifiedListings: verified.count ?? getSeededPublicProperties().filter((property) => ["verified", "premium"].includes(property.verification_level)).length,
        citiesCovered: citiesCount.count ?? new Set(getSeededPublicProperties().map((property) => property.city)).size,
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
      <section className="hero-shell relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="container-app relative py-10 lg:py-16">
          <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="pt-4 lg:pt-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/88 backdrop-blur">
                <Sparkles className="h-4 w-4 text-amber-300" />
                Iraq property decisions with trust signals built in
              </div>
              <div className="max-w-3xl">
                <span className="gold-badge mb-4">{t("common.appName")}</span>
                <h1 className="mb-4 text-hero text-gradient-gold">{t("home.tagline")}</h1>
                <p className="mb-8 max-w-2xl text-base text-white/78 sm:text-lg">{t("home.subtitle")}</p>
              </div>

              <div className="mb-8 flex flex-wrap gap-3">
                {HERO_BENEFITS.map((item) => (
                  <div key={item.label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/88 backdrop-blur">
                    <item.icon className="h-4 w-4 text-amber-300" />
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {statValues.map(s => (
                  <div key={s.key} className="soft-panel p-4 lg:p-5">
                    <div className="text-2xl font-extrabold text-white lg:text-3xl">
                      {s.value.toLocaleString()}{s.suffix}
                    </div>
                    <div className="mt-1 text-xs text-white/66 lg:text-sm">{t(`home.stats.${s.key}`)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="content-panel p-4 text-foreground lg:p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary">{t("home.hero.search")}</p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Start with the right shortlist</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Narrow by city, property type, and budget, then move into verified results.
                  </p>
                </div>
                <div className="hidden rounded-2xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary sm:block">
                  Buyer-first flow
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {t("home.hero.city")}
                  </label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-border bg-background px-4 font-medium"
                  >
                    <option value="">{t("home.hero.anyCity")}</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.name_en}>
                        {c.name_ar} · {c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {t("home.hero.type")}
                  </label>
                  <select
                    value={kind}
                    onChange={e => setKind(e.target.value as PropertyKind)}
                    className="h-12 w-full rounded-2xl border border-border bg-background px-4 font-medium"
                  >
                    <option value="">{t("home.hero.anyType")}</option>
                    {(["house","apartment","villa","land","commercial","office","shop"] as const).map(k => (
                      <option key={k} value={k}>{t(`property.kind.${k}`)}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {t("home.hero.budget")}
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                    <select
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-border bg-background px-4 font-medium"
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
                      className="h-12 rounded-2xl px-6 font-bold shadow-[0_14px_36px_rgba(245,158,11,0.28)]"
                    >
                      <Search className="w-4 h-4" />
                      {t("home.hero.search")}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {QUICK.map(q => (
                  <button
                    key={q.key}
                    onClick={() => q.route ? navigate(q.route) : navigate(`/buy?kind=${q.kind}`)}
                    className="flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-3 text-left text-sm font-semibold transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
                  >
                    <q.icon className="h-4 w-4" />
                    {t(`home.hero.${q.key}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured ── */}
      <section className="container-app py-12 lg:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Curated now</p>
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
      <section className="bg-secondary/30 py-12 lg:py-16">
        <div className="container-app">
          <div className="mb-6 flex items-end justify-between gap-4">
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
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Why buyers trust it</p>
          <h2 className="text-2xl lg:text-3xl font-extrabold">{t("home.trust.title")}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRUST_ITEMS.map(item => (
            <div key={item.key} className="content-panel card-spotlight p-6">
              <div className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-secondary ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">{t(`home.trust.${item.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`home.trust.${item.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="hero-shell text-white py-12 lg:py-16">
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

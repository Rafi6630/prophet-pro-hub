import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Coins,
  Download,
  FileCheck,
  Home as HomeIcon,
  MapPinned,
  ShieldCheck,
  Sparkles,
  TreePine,
  TrendingUp,
  UserRoundPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import HeroSearch from "@/components/HeroSearch";
import MetricCard from "@/components/MetricCard";
import FeaturedPropertyCard from "@/components/FeaturedPropertyCard";
import PropertyCard, { PropertyCardSkeleton } from "@/components/PropertyCard";
import type { PropertyKind, PropertyWithMedia } from "@/lib/property";
import { featuredSeededProperties, getSeededPublicProperties, investmentSeededProperties } from "@/lib/sampleInventory";
import { marketInsights } from "@/data/marketInsights";
import { iraqCities } from "@/data/iraqCities";

const QUICK = [
  { kind: "house" as PropertyKind, icon: HomeIcon, label: "Buy House" },
  { kind: "land" as PropertyKind, icon: TreePine, label: "Buy Land" },
  { kind: null, icon: Building2, label: "Commercial" },
  { kind: "villa" as PropertyKind, icon: TrendingUp, label: "Investment Deals", route: "/investment" },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "Verified Seller", copy: "Start from who deserves trust before you commit time or money." },
  { icon: Coins, title: "Fair Price Estimate", copy: "Benchmark asking prices against grounded market context in seconds." },
  { icon: FileCheck, title: "Ownership Reviewed", copy: "Catch paperwork or legal gaps earlier in the decision journey." },
  { icon: MapPinned, title: "Growth Outlook", copy: "Read neighborhood momentum, roads, hospitals, and safety together." },
];

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [kind, setKind] = useState<PropertyKind | "">("");
  const [budget, setBudget] = useState("");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  useEffect(() => {
    document.title = `${t("common.appName")} — ${t("common.tagline")}`;
  }, [t]);

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => (await supabase.from("cities").select("*").eq("active", true).order("sort_order")).data ?? [],
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

  const { data: stats } = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const [verified, citiesCount] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }).in("verification_level", ["verified", "premium"]),
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
    if (area) params.set("district", area);
    if (bedrooms) params.set("bedrooms", bedrooms);
    navigate(`/buy?${params.toString()}`);
  };

  const statValues = useMemo(
    () => [
      { value: stats?.verifiedListings ?? 0, label: "Verified Listings", suffix: "+" },
      { value: 216, label: "Verified Agencies", suffix: "+" },
      { value: 340, label: "Deals Closed", suffix: "+" },
      { value: stats?.citiesCovered ?? 10, label: "Cities Covered", suffix: "" },
    ],
    [stats],
  );

  return (
    <div className="animate-fade-in">
      <section className="hero-shell relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="container-app relative py-10 lg:py-16">
          <div className="grid items-start gap-8 lg:grid-cols-[1.04fr_0.96fr]">
            <div className="pt-4 lg:pt-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/88 backdrop-blur">
                <Sparkles className="h-4 w-4 text-amber-300" />
                Luxury trust-first buying experience
              </div>
              <div className="max-w-4xl">
                <span className="gold-badge mb-4">{t("common.appName")}</span>
                <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white md:text-7xl">
                  Know Everything Before You Buy
                </h1>
                <p className="mb-8 max-w-2xl text-base text-white/78 sm:text-lg">
                  IraqProperty combines verified sellers, fair price context, ownership confidence, and investment intelligence for serious Iraqi buyers and investors.
                </p>
              </div>

              <div className="mb-8 flex flex-wrap gap-3">
                {[
                  { icon: BadgeCheck, label: "Verified sellers first" },
                  { icon: Coins, label: "Fair Price Estimate" },
                  { icon: MapPinned, label: "Area intelligence" },
                ].map((item) => (
                  <div key={item.label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/88 backdrop-blur">
                    <item.icon className="h-4 w-4 text-amber-300" />
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {statValues.map((item) => (
                  <MetricCard key={item.label} label={item.label} value={item.value} suffix={item.suffix} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <HeroSearch
                city={city}
                area={area}
                kind={kind}
                budget={budget}
                bedrooms={bedrooms}
                cities={cities}
                onCityChange={setCity}
                onAreaChange={setArea}
                onKindChange={setKind}
                onBudgetChange={setBudget}
                onBedroomsChange={setBedrooms}
                onSearch={handleSearch}
              />
              <div className="grid grid-cols-2 gap-2">
                {QUICK.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => item.route ? navigate(item.route) : navigate(`/buy?kind=${item.kind}`)}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-semibold text-foreground transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {featured[0] ? (
        <section className="container-app py-8 lg:py-12">
          <FeaturedPropertyCard property={featured[0]} />
        </section>
      ) : null}

      <section className="container-app py-12 lg:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Featured Listings</p>
            <h2 className="text-2xl lg:text-3xl font-extrabold">High-trust properties buyers can act on faster</h2>
          </div>
          <Link to="/buy" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Browse Properties <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingFeatured
            ? Array.from({ length: 3 }).map((_, index) => <PropertyCardSkeleton key={index} />)
            : featured.slice(0, 3).map((property) => <PropertyCard key={property.id} p={property} />)}
        </div>
      </section>

      <section className="bg-secondary/30 py-12 lg:py-16">
        <div className="container-app">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Investment Deals</p>
              <h2 className="text-2xl lg:text-3xl font-extrabold">Ranked opportunities with stronger exit logic</h2>
            </div>
            <Link to="/investment" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View all deals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loadingDeals
              ? Array.from({ length: 3 }).map((_, index) => <PropertyCardSkeleton key={index} />)
              : deals.slice(0, 3).map((property) => <PropertyCard key={property.id} p={property} />)}
          </div>
        </div>
      </section>

      <section className="container-app py-12 lg:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Market Prices</p>
            <h2 className="text-2xl lg:text-3xl font-extrabold">Latest benchmarks by city</h2>
          </div>
          <Link to="/market-prices" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View market prices <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {marketInsights.slice(0, 6).map((market) => (
            <div key={market.cityId} className="content-panel p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{market.city}</p>
                  <h3 className="mt-2 text-3xl font-extrabold">${market.averagePricePerSqm}</h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{market.demandTrend}</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-foreground/72">{market.growthOutlook}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {market.premiumDistricts.map((district) => (
                  <span key={district} className="filter-pill">{district}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-app py-4 lg:py-8">
        <div className="section-shell px-6 py-8 lg:px-8 lg:py-10">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Why IraqProperty</p>
            <h2 className="mt-2 text-2xl lg:text-3xl font-extrabold">Built for Iraqi buyer psychology, not generic marketplace traffic</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="content-panel p-5">
                <item.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 text-lg font-extrabold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-app py-12 lg:py-16">
        <div className="content-panel p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Join as Seller / Browse Properties</p>
              <h2 className="mt-2 text-2xl lg:text-4xl font-extrabold">Own the decision before the next buyer does</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground lg:text-base">
                Get instant alerts on verified listings or join as an agency to unlock premium placement, trust upgrades, lead capture, and performance analytics across Iraq.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg" className="rounded-2xl px-6">
                <Link to="/buy">
                  <Download className="h-4 w-4" />
                  Browse Properties
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl border-slate-200 bg-white px-6">
                <Link to="/seller/dashboard">
                  <UserRoundPlus className="h-4 w-4" />
                  Join as Seller
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {iraqCities.slice(0, 3).map((cityItem) => (
              <Link key={cityItem.id} to={`/${cityItem.id}-properties`} className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm font-medium transition hover:border-primary/30 hover:bg-primary/5">
                {cityItem.nameAr} · {cityItem.nameEn}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

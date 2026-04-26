import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { MapPinned, RotateCcw, ShieldCheck, Sparkles, X, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { PropertyKind, PropertyWithMedia } from "@/lib/property";
import PropertyCard, { PropertyCardSkeleton } from "@/components/PropertyCard";
import FilterDrawer from "@/components/FilterDrawer";
import { Button } from "@/components/ui/button";
import { parseSearchQuery, buildFilterFromParsedQuery, SUGGESTED_SEARCHES } from "@/lib/ai/searchParser";

const SORTS = ["newest", "priceLow", "priceHigh", "investmentScore", "verifiedFirst"] as const;
type Sort = typeof SORTS[number];

export default function Buy() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();

  const city = params.get("city") ?? "";
  const district = params.get("district") ?? "";
  const kind = (params.get("kind") ?? "") as PropertyKind | "";
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  const bedrooms = params.get("bedrooms") ?? "";
  const verifiedOnly = params.get("verified") === "1";
  const investmentMin = params.get("investmentMin") ?? "";
  const sort = (params.get("sort") as Sort) ?? "newest";

  useEffect(() => {
    document.title = `${t("buy.title")} — ${t("common.appName")}`;
  }, [t]);

  const update = useCallback((key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }, [params, setParams]);

  const clearAll = useCallback(() => {
    setParams(new URLSearchParams(), { replace: true });
  }, [setParams]);

  const [nlQuery, setNlQuery] = useState("");
  const [nlBusy, setNlBusy] = useState(false);

  const applyNlQuery = useCallback((query: string) => {
    if (!query.trim()) return;
    setNlBusy(true);
    try {
      const parsed = parseSearchQuery(query);
      const filters = buildFilterFromParsedQuery(parsed);
      const next = new URLSearchParams(params);
      if (filters.city) next.set("city", String(filters.city));
      if (filters.propertyType) next.set("kind", String(filters.propertyType));
      if (filters.priceMin) next.set("min", String(filters.priceMin));
      if (filters.priceMax) next.set("max", String(filters.priceMax));
      if (filters.bedrooms) next.set("bedrooms", String(filters.bedrooms));
      if (filters.verified) next.set("verified", "1");
      setParams(next, { replace: true });
    } finally {
      setTimeout(() => setNlBusy(false), 300);
    }
  }, [params, setParams]);

  const { data: cities = [] } = useQuery({
    queryKey: ["buy-cities"],
    queryFn: async () => (await supabase.from("cities").select("*").eq("active", true).order("sort_order")).data ?? [],
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["buy-properties", city, kind, min, max, verifiedOnly],
    queryFn: async () => {
      let query = supabase.from("properties").select("*, property_images(*)").eq("status", "active");
      if (city) query = query.eq("city", city);
      if (kind) query = query.eq("property_kind", kind);
      if (min) query = query.gte("price", Number(min));
      if (max) query = query.lte("price", Number(max));
      if (verifiedOnly) query = query.in("verification_level", ["verified", "premium"]);
      const { data } = await query.limit(120);
      return (data ?? []) as PropertyWithMedia[];
    },
  });

  const filteredProperties = useMemo(() => {
    const next = properties.filter((property) => {
      const districtMatch =
        !district ||
        [property.district, property.city, property.title, property.title_ar]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(district.toLowerCase());
      const bedroomsMatch = !bedrooms || property.bedrooms >= Number(bedrooms);
      const investmentMatch = !investmentMin || (property.investment_score ?? 0) >= Number(investmentMin);
      return districtMatch && bedroomsMatch && investmentMatch;
    });

    return [...next].sort((left, right) => {
      if (sort === "priceLow") return left.price - right.price;
      if (sort === "priceHigh") return right.price - left.price;
      if (sort === "investmentScore") return (right.investment_score ?? 0) - (left.investment_score ?? 0);
      if (sort === "verifiedFirst") {
        const leftVerified = ["verified", "premium"].includes(left.verification_level) ? 1 : 0;
        const rightVerified = ["verified", "premium"].includes(right.verification_level) ? 1 : 0;
        return rightVerified - leftVerified || right.created_at.localeCompare(left.created_at);
      }
      return right.created_at.localeCompare(left.created_at);
    });
  }, [properties, district, bedrooms, investmentMin, sort]);

  const activeFilters = [
    city ? { key: "city", label: city } : null,
    district ? { key: "district", label: district } : null,
    kind ? { key: "kind", label: kind } : null,
    min ? { key: "min", label: `From $${Number(min).toLocaleString()}` } : null,
    max ? { key: "max", label: `Up to $${Number(max).toLocaleString()}` } : null,
    bedrooms ? { key: "bedrooms", label: `${bedrooms}+ bedrooms` } : null,
    verifiedOnly ? { key: "verified", label: "Verified only" } : null,
    investmentMin ? { key: "investmentMin", label: `Score ${investmentMin}+` } : null,
  ].filter(Boolean) as { key: string; label: string }[];

  const filters = (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Top filter bar</p>
          <h2 className="mt-1 text-xl font-extrabold">Refine your buy flow</h2>
        </div>
        <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={clearAll}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">City</label>
        <select value={city} onChange={(event) => update("city", event.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm">
          <option value="">All cities</option>
          {cities.map((entry) => (
            <option key={entry.id} value={entry.name_en}>{entry.name_ar} · {entry.name_en}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">District</label>
        <input value={district} onChange={(event) => update("district", event.target.value)} placeholder="Mansour, Ankawa, Jadriya" className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm" />
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Type</label>
        <select value={kind} onChange={(event) => update("kind", event.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm">
          <option value="">Any type</option>
          {(["house", "apartment", "villa", "land", "commercial", "office", "shop"] as const).map((entry) => (
            <option key={entry} value={entry}>{entry}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Min Price</label>
          <select value={min} onChange={(event) => update("min", event.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm">
            <option value="">Any</option>
            <option value="50000">$50K</option>
            <option value="100000">$100K</option>
            <option value="250000">$250K</option>
            <option value="500000">$500K</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Max Price</label>
          <select value={max} onChange={(event) => update("max", event.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm">
            <option value="">Any</option>
            <option value="100000">$100K</option>
            <option value="250000">$250K</option>
            <option value="500000">$500K</option>
            <option value="1000000">$1M</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Bedrooms</label>
          <select value={bedrooms} onChange={(event) => update("bedrooms", event.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm">
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Investment Score min</label>
          <select value={investmentMin} onChange={(event) => update("investmentMin", event.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm">
            <option value="">Any</option>
            <option value="60">60+</option>
            <option value="70">70+</option>
            <option value="80">80+</option>
            <option value="90">90+</option>
          </select>
        </div>
      </div>
      <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Verified only
        </span>
        <input type="checkbox" checked={verifiedOnly} onChange={(event) => update("verified", event.target.checked ? "1" : null)} className="h-4 w-4 accent-emerald-600" />
      </label>
      <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground/72">
        Conversion-focused filters keep buyers in clean, high-confidence inventory faster.
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <section className="container-app py-6 lg:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="grid gap-5 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(24,38,67,0.92)_58%,rgba(245,158,11,0.15))] px-6 py-8 text-white lg:grid-cols-[1fr_auto] lg:px-8">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/86">
                <Sparkles className="h-4 w-4 text-amber-300" />
                Premium buy flow
              </div>
              <h1 className="text-3xl font-extrabold lg:text-5xl">{t("buy.title")}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/74 lg:text-base">
                Filter by trust, pricing, and investment quality before you spend time on the wrong inventory.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="soft-panel p-4">
                <div className="text-2xl font-extrabold">{filteredProperties.length}</div>
                <div className="mt-1 text-xs text-white/70">Live results</div>
              </div>
              <div className="soft-panel p-4">
                <div className="text-2xl font-extrabold">{activeFilters.length}</div>
                <div className="mt-1 text-xs text-white/70">Active filters</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-app pb-12 lg:pb-16">
        <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
          <FilterDrawer>{filters}</FilterDrawer>
          <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white">
            <Link to="/map-search">
              <MapPinned className="h-4 w-4" />
              Map
            </Link>
          </Button>
        </div>

        {activeFilters.length > 0 ? (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <button key={filter.key} type="button" onClick={() => update(filter.key, null)} className="filter-pill">
                {filter.label}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="filter-pill text-primary">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              {filters}
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-col gap-3 rounded-[1.75rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold">{filteredProperties.length} results</h2>
                <p className="text-sm text-muted-foreground">Luxury cards optimized for fast shortlist decisions.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <select value={sort} onChange={(event) => update("sort", event.target.value)} className="h-11 rounded-2xl border border-border bg-background px-4 text-sm">
                  <option value="newest">Newest</option>
                  <option value="priceLow">Price low-high</option>
                  <option value="priceHigh">Price high-low</option>
                  <option value="investmentScore">Best investment</option>
                  <option value="verifiedFirst">Verified first</option>
                </select>
                <Button asChild variant="outline" className="rounded-2xl border-slate-200 bg-white">
                  <Link to="/map-search">
                    <MapPinned className="h-4 w-4" />
                    Map toggle
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => <PropertyCardSkeleton key={index} />)
                : filteredProperties.length === 0
                  ? <div className="col-span-full rounded-[1.75rem] border border-slate-200 bg-white py-16 text-center text-muted-foreground shadow-[0_20px_60px_rgba(15,23,42,0.08)]">{t("buy.noListings")}</div>
                  : filteredProperties.map((property) => <PropertyCard key={property.id} p={property} />)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

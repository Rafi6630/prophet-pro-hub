import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPinned, RotateCcw, ShieldCheck, SlidersHorizontal, Sparkles, X } from "lucide-react";
import PropertyCard, { PropertyCardSkeleton } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import type { PropertyWithMedia, PropertyKind } from "@/lib/property";

const SORTS = ["newest", "priceLow", "priceHigh", "investmentScore", "verifiedFirst"] as const;
type Sort = typeof SORTS[number];

export default function Buy() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();

  const city = params.get("city") ?? "";
  const kind = (params.get("kind") ?? "") as PropertyKind | "";
  const district = params.get("district") ?? "";
  const bedrooms = params.get("bedrooms") ?? "";
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  const minSize = params.get("minSize") ?? "";
  const investmentMin = params.get("investmentMin") ?? "";
  const verifiedOnly = params.get("verified") === "1";
  const sort = (params.get("sort") as Sort) ?? "newest";
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => { document.title = `${t("buy.title")} — ${t("common.appName")}`; }, [t]);

  const update = useCallback((k: string, v: string | null) => {
    const n = new URLSearchParams(params);
    if (!v) n.delete(k); else n.set(k, v);
    setParams(n, { replace: true });
  }, [params, setParams]);

  const clearAll = useCallback(() => {
    setParams(new URLSearchParams(), { replace: true });
  }, [setParams]);

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => (await supabase.from("cities").select("*").eq("active", true).order("sort_order")).data ?? [],
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["buy", city, kind, district, bedrooms, min, max, minSize, investmentMin, verifiedOnly, sort],
    queryFn: async () => {
      let q = supabase
        .from("properties")
        .select("*, property_images(*)")
        .eq("status", "active");
      if (city) q = q.eq("city", city);
      if (kind) q = q.eq("property_kind", kind);
      if (min) q = q.gte("price", Number(min));
      if (max) q = q.lte("price", Number(max));
      if (verifiedOnly) q = q.in("verification_level", ["verified", "premium"]);
      const { data } = await q.limit(200);
      return (data ?? []) as PropertyWithMedia[];
    },
  });

  const filteredProperties = useMemo(() => {
    const next = properties.filter((property) => {
      const districtMatch =
        !district ||
        [property.district, property.title, property.title_ar]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(district.toLowerCase());
      const bedroomsMatch = !bedrooms || property.bedrooms >= Number(bedrooms);
      const sizeMatch = !minSize || property.area_m2 >= Number(minSize);
      const investmentMatch = !investmentMin || (property.investment_score ?? 0) >= Number(investmentMin);

      return districtMatch && bedroomsMatch && sizeMatch && investmentMatch;
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
  }, [properties, district, bedrooms, minSize, investmentMin, sort]);

  const activeFilters = [
    city ? { key: "city", label: city, onRemove: () => update("city", null) } : null,
    district ? { key: "district", label: district, onRemove: () => update("district", null) } : null,
    kind ? { key: "kind", label: t(`property.kind.${kind}`), onRemove: () => update("kind", null) } : null,
    bedrooms ? { key: "bedrooms", label: `${bedrooms}+ beds`, onRemove: () => update("bedrooms", null) } : null,
    min ? { key: "min", label: `From $${Number(min).toLocaleString()}`, onRemove: () => update("min", null) } : null,
    max ? { key: "max", label: `Up to $${Number(max).toLocaleString()}`, onRemove: () => update("max", null) } : null,
    minSize ? { key: "minSize", label: `${minSize}+ sqm`, onRemove: () => update("minSize", null) } : null,
    investmentMin ? { key: "investmentMin", label: `Score ${investmentMin}+`, onRemove: () => update("investmentMin", null) } : null,
    verifiedOnly ? { key: "verified", label: t("buy.verified"), onRemove: () => update("verified", null) } : null,
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

  const FilterPanel = useMemo(() => (
    <div className="content-panel space-y-4 p-4 lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">{t("buy.filters")}</p>
          <h2 className="mt-1 text-xl font-extrabold">Shape your shortlist</h2>
        </div>
        <Button type="button" variant="ghost" size="sm" className="h-9 rounded-full px-3 text-muted-foreground" onClick={clearAll}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">{t("home.hero.city")}</label>
        <select value={city} onChange={e => update("city", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-3 font-medium">
          <option value="">{t("home.hero.anyCity")}</option>
          {cities.map(c => <option key={c.id} value={c.name_en}>{c.name_ar} · {c.name_en}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">District / Area</label>
        <input
          value={district}
          onChange={e => update("district", e.target.value)}
          placeholder="Mansour, Ankawa, Jadriya"
          className="h-11 w-full rounded-2xl border border-border bg-background px-3 font-medium"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">{t("home.hero.type")}</label>
        <select value={kind} onChange={e => update("kind", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-3 font-medium">
          <option value="">{t("home.hero.anyType")}</option>
          {(["house","apartment","villa","land","commercial","office","shop"] as const).map(k => (
            <option key={k} value={k}>{t(`property.kind.${k}`)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Minimum price</label>
        <select value={min} onChange={e => update("min", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-3 font-medium">
          <option value="">No minimum</option>
          <option value="50000">$50K</option>
          <option value="100000">$100K</option>
          <option value="250000">$250K</option>
          <option value="500000">$500K</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">{t("home.hero.budget")}</label>
        <select value={max} onChange={e => update("max", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-3 font-medium">
          <option value="">{t("home.hero.anyBudget")}</option>
          <option value="50000">≤ $50K</option>
          <option value="100000">≤ $100K</option>
          <option value="250000">≤ $250K</option>
          <option value="500000">≤ $500K</option>
          <option value="1000000">≤ $1M</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Bedrooms</label>
        <select value={bedrooms} onChange={e => update("bedrooms", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-3 font-medium">
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Minimum size</label>
        <select value={minSize} onChange={e => update("minSize", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-3 font-medium">
          <option value="">Any size</option>
          <option value="100">100 sqm</option>
          <option value="150">150 sqm</option>
          <option value="250">250 sqm</option>
          <option value="400">400 sqm</option>
          <option value="800">800 sqm</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Investment score</label>
        <select value={investmentMin} onChange={e => update("investmentMin", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-3 font-medium">
          <option value="">Any score</option>
          <option value="60">60+</option>
          <option value="70">70+</option>
          <option value="80">80+</option>
          <option value="90">90+</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">{t("buy.sortBy")}</label>
        <select value={sort} onChange={e => update("sort", e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-3 font-medium">
          {SORTS.map((s) => (
            <option key={s} value={s}>
              {s === "verifiedFirst" ? "Verified first" : t(`buy.${s}`)}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 cursor-pointer pt-1">
        <input type="checkbox" checked={verifiedOnly} onChange={e => update("verified", e.target.checked ? "1" : null)} className="w-4 h-4 rounded accent-trust" />
        <span className="text-sm font-medium flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-trust" />
          {t("buy.verified")}
        </span>
      </label>
      <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground/72">
        Advanced search includes district, size, bedrooms, verified-only focus, and minimum investment score.
      </div>
      <Button asChild variant="outline" className="w-full rounded-2xl border-slate-200 bg-white">
        <Link to="/map-search">
          <MapPinned className="h-4 w-4" />
          Open split map view
        </Link>
      </Button>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Verified-only mode prioritizes cleaner listings and stronger trust signals.
      </div>
    </div>
  ), [city, kind, district, bedrooms, min, max, minSize, investmentMin, verifiedOnly, sort, cities, t, update, clearAll]);

  return (
    <div className="container-app py-6 lg:py-10">
      <div className="section-shell overflow-hidden">
        <div className="grid gap-5 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.9)_60%,rgba(245,158,11,0.16))] px-6 py-8 text-white lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/86">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Buyer-first property search with investment intelligence
            </div>
            <h1 className="text-3xl font-extrabold lg:text-4xl">{t("buy.title")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/72 lg:text-base">{t("buy.subtitle")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
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

      <div className="mb-4 mt-6 flex items-center gap-3 lg:hidden">
        <Button onClick={() => setFiltersOpen(o => !o)} variant="outline" className="gap-2 rounded-full">
          <SlidersHorizontal className="w-4 h-4" />
          {t("buy.filters")}
        </Button>
        <span className="text-sm text-muted-foreground">{filteredProperties.length} {t("buy.title")}</span>
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <button key={filter.key} type="button" onClick={filter.onRemove} className="filter-pill">
              {filter.label}
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
          <button type="button" onClick={clearAll} className="filter-pill text-primary">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px,1fr]">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>{FilterPanel}</aside>

        <div>
          <div className="content-panel mb-4 hidden items-center justify-between px-5 py-4 lg:flex">
            <div>
              <h2 className="text-lg font-extrabold">{filteredProperties.length} results</h2>
              <p className="text-sm text-muted-foreground">Sorted for browsing speed and shortlist clarity.</p>
            </div>
            <div className="text-sm font-medium text-foreground/66">
              {verifiedOnly ? "Verified focus on" : "All active listings"}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : filteredProperties.length === 0
              ? <div className="content-panel col-span-full py-16 text-center text-muted-foreground">{t("buy.noListings")}</div>
              : filteredProperties.map(p => <PropertyCard key={p.id} p={p} />)
            }
          </div>
        </div>
      </div>
    </div>
  );
}

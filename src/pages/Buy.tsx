import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, SlidersHorizontal } from "lucide-react";
import PropertyCard, { PropertyCardSkeleton } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import type { PropertyWithMedia, PropertyKind } from "@/lib/property";

const SORTS = ["newest", "priceLow", "priceHigh", "investmentScore"] as const;
type Sort = typeof SORTS[number];

export default function Buy() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();

  const city = params.get("city") ?? "";
  const kind = (params.get("kind") ?? "") as PropertyKind | "";
  const max = params.get("max") ?? "";
  const verifiedOnly = params.get("verified") === "1";
  const sort = (params.get("sort") as Sort) ?? "newest";
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => { document.title = `${t("buy.title")} — ${t("common.appName")}`; }, [t]);

  const update = (k: string, v: string | null) => {
    const n = new URLSearchParams(params);
    if (!v) n.delete(k); else n.set(k, v);
    setParams(n, { replace: true });
  };

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => (await supabase.from("cities").select("*").eq("active", true).order("sort_order")).data ?? [],
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["buy", city, kind, max, verifiedOnly, sort],
    queryFn: async () => {
      let q = supabase
        .from("properties")
        .select("*, property_images(*)")
        .eq("status", "active");
      if (city) q = q.eq("city", city);
      if (kind) q = q.eq("property_kind", kind);
      if (max) q = q.lte("price", Number(max));
      if (verifiedOnly) q = q.in("verification_level", ["verified", "premium"]);
      if (sort === "newest") q = q.order("created_at", { ascending: false });
      if (sort === "priceLow") q = q.order("price", { ascending: true });
      if (sort === "priceHigh") q = q.order("price", { ascending: false });
      if (sort === "investmentScore") q = q.order("investment_score", { ascending: false, nullsFirst: false });
      const { data } = await q.limit(60);
      return (data ?? []) as PropertyWithMedia[];
    },
  });

  const FilterPanel = useMemo(() => (
    <div className="space-y-4 p-4 bg-card rounded-2xl border border-border shadow-card">
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">{t("home.hero.city")}</label>
        <select value={city} onChange={e => update("city", e.target.value)} className="w-full h-11 px-3 rounded-xl bg-secondary border-0 font-medium">
          <option value="">{t("home.hero.anyCity")}</option>
          {cities.map(c => <option key={c.id} value={c.name_en}>{c.name_ar} · {c.name_en}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">{t("home.hero.type")}</label>
        <select value={kind} onChange={e => update("kind", e.target.value)} className="w-full h-11 px-3 rounded-xl bg-secondary border-0 font-medium">
          <option value="">{t("home.hero.anyType")}</option>
          {(["house","apartment","villa","land","commercial","office","shop"] as const).map(k => (
            <option key={k} value={k}>{t(`property.kind.${k}`)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">{t("home.hero.budget")}</label>
        <select value={max} onChange={e => update("max", e.target.value)} className="w-full h-11 px-3 rounded-xl bg-secondary border-0 font-medium">
          <option value="">{t("home.hero.anyBudget")}</option>
          <option value="50000">≤ $50K</option>
          <option value="100000">≤ $100K</option>
          <option value="250000">≤ $250K</option>
          <option value="500000">≤ $500K</option>
          <option value="1000000">≤ $1M</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">{t("buy.sortBy")}</label>
        <select value={sort} onChange={e => update("sort", e.target.value)} className="w-full h-11 px-3 rounded-xl bg-secondary border-0 font-medium">
          {SORTS.map(s => <option key={s} value={s}>{t(`buy.${s}`)}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-2 cursor-pointer pt-1">
        <input type="checkbox" checked={verifiedOnly} onChange={e => update("verified", e.target.checked ? "1" : null)} className="w-4 h-4 rounded accent-trust" />
        <span className="text-sm font-medium flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-trust" />
          {t("buy.verified")}
        </span>
      </label>
    </div>
  ), [city, kind, max, verifiedOnly, sort, cities, t]);

  return (
    <div className="container-app py-6 lg:py-10">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-extrabold">{t("buy.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("buy.subtitle")}</p>
      </div>

      <div className="flex items-center gap-3 mb-4 lg:hidden">
        <Button onClick={() => setFiltersOpen(o => !o)} variant="outline" className="gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          {t("buy.filters")}
        </Button>
        <span className="text-sm text-muted-foreground">{properties.length} {t("buy.title")}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>{FilterPanel}</aside>

        <div>
          <div className="hidden lg:flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{properties.length} results</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : properties.length === 0
              ? <div className="col-span-full text-center py-16 text-muted-foreground">{t("buy.noListings")}</div>
              : properties.map(p => <PropertyCard key={p.id} p={p} />)
            }
          </div>
        </div>
      </div>
    </div>
  );
}

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyKind } from "@/lib/property";

interface CityOption {
  id: string;
  name_en: string;
  name_ar: string;
}

interface HeroSearchProps {
  city: string;
  area: string;
  kind: PropertyKind | "";
  budget: string;
  bedrooms: string;
  cities: CityOption[];
  onCityChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onKindChange: (value: PropertyKind | "") => void;
  onBudgetChange: (value: string) => void;
  onBedroomsChange: (value: string) => void;
  onSearch: () => void;
}

export function HeroSearch({
  city,
  area,
  kind,
  budget,
  bedrooms,
  cities,
  onCityChange,
  onAreaChange,
  onKindChange,
  onBudgetChange,
  onBedroomsChange,
  onSearch,
}: HeroSearchProps) {
  return (
    <div className="content-panel p-4 text-foreground lg:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Premium search</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Start with the right shortlist</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Filter by city, area, type, budget, and bedrooms before you enter the buy flow.
          </p>
        </div>
        <div className="hidden rounded-2xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary sm:block">
          Trust-first
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">City</label>
          <select value={city} onChange={(event) => onCityChange(event.target.value)} className="h-12 w-full rounded-2xl border border-border bg-background px-4 font-medium">
            <option value="">All cities</option>
            {cities.map((entry) => (
              <option key={entry.id} value={entry.name_en}>
                {entry.name_ar} · {entry.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Area</label>
          <input
            value={area}
            onChange={(event) => onAreaChange(event.target.value)}
            placeholder="Mansour, Ankawa, Jadriya"
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 font-medium"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Property Type</label>
          <select value={kind} onChange={(event) => onKindChange(event.target.value as PropertyKind | "")} className="h-12 w-full rounded-2xl border border-border bg-background px-4 font-medium">
            <option value="">Any type</option>
            {(["house", "apartment", "villa", "land", "commercial", "office", "shop"] as const).map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Bedrooms</label>
          <select value={bedrooms} onChange={(event) => onBedroomsChange(event.target.value)} className="h-12 w-full rounded-2xl border border-border bg-background px-4 font-medium">
            <option value="">Any bedrooms</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Budget</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <select value={budget} onChange={(event) => onBudgetChange(event.target.value)} className="h-12 w-full rounded-2xl border border-border bg-background px-4 font-medium">
              <option value="">No limit</option>
              <option value="50000">$50K</option>
              <option value="100000">$100K</option>
              <option value="250000">$250K</option>
              <option value="500000">$500K</option>
              <option value="1000000">$1M</option>
            </select>
            <Button onClick={onSearch} size="lg" className="h-12 rounded-2xl px-6 font-bold shadow-[0_14px_36px_rgba(245,158,11,0.28)]">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSearch;

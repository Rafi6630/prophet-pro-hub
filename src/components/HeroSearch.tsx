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

const FIELD =
  "h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-12 sm:rounded-2xl sm:px-4";

const LABEL =
  "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]";

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
    <div className="rounded-2xl border border-slate-200/70 bg-white/98 p-4 text-foreground shadow-[0_20px_60px_rgba(8,15,38,0.18)] backdrop-blur sm:rounded-3xl sm:p-5 lg:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-xs">Premium search</p>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight sm:text-xl lg:text-2xl">
            Start with the right shortlist
          </h2>
        </div>
        <span className="hidden shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 sm:inline-flex sm:text-xs">
          Trust-first
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className={LABEL}>City</label>
          <select value={city} onChange={(event) => onCityChange(event.target.value)} className={FIELD}>
            <option value="">All cities</option>
            {cities.map((entry) => (
              <option key={entry.id} value={entry.name_en}>
                {entry.name_ar} · {entry.name_en}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={LABEL}>Area</label>
          <input
            value={area}
            onChange={(event) => onAreaChange(event.target.value)}
            placeholder="Mansour, Ankawa…"
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL}>Type</label>
          <select value={kind} onChange={(event) => onKindChange(event.target.value as PropertyKind | "")} className={FIELD}>
            <option value="">Any</option>
            {(["house", "apartment", "villa", "land", "commercial", "office", "shop"] as const).map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Bedrooms</label>
          <select value={bedrooms} onChange={(event) => onBedroomsChange(event.target.value)} className={FIELD}>
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className={LABEL}>Budget</label>
          <select value={budget} onChange={(event) => onBudgetChange(event.target.value)} className={FIELD}>
            <option value="">No limit</option>
            <option value="50000">Up to $50K</option>
            <option value="100000">Up to $100K</option>
            <option value="250000">Up to $250K</option>
            <option value="500000">Up to $500K</option>
            <option value="1000000">Up to $1M</option>
          </select>
        </div>
        <div className="col-span-2 mt-1">
          <Button
            onClick={onSearch}
            size="lg"
            className="h-12 w-full rounded-xl px-6 text-base font-bold shadow-[0_14px_36px_rgba(245,158,11,0.28)] sm:h-12 sm:rounded-2xl"
          >
            <Search className="h-4 w-4" />
            Search Properties
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HeroSearch;

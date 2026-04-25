import { useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import { PropertyCard } from "@/components/PropertyCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { iraqCities } from "@/data/iraqCities";
import { propertyTypes } from "@/data/propertyTypes";
import { publicProperties } from "@/data/sampleProperties";
import { getFavoriteIds } from "@/lib/favorites";
import { enrichProperty } from "@/lib/propertyMetrics";
import { filterProperties, sortProperties, type PropertySort } from "@/lib/propertySearch";
import { createOrganizationSchema } from "@/lib/structuredData";

interface SearchResultsPageProps {
  mode: "buy" | "investment" | "market" | "favorites";
}

const content = {
  buy: {
    title: "Buy Property",
    description: "Find verified homes, land, and commercial property in Iraq with clearer trust and pricing signals.",
  },
  investment: {
    title: "Investment Deals",
    description: "Ranked opportunities with Fair Price Estimate, Investment Score, and exit liquidity context.",
  },
  market: {
    title: "Market Prices",
    description: "Review city-level pricing and compare live listings against local market averages.",
  },
  favorites: {
    title: "Favorites",
    description: "Keep your strongest property options together and compare them before making an offer.",
  },
};

export function SearchResultsPage({ mode }: SearchResultsPageProps) {
  const [searchParams] = useSearchParams();
  const [cityId, setCityId] = useState(searchParams.get("city") ?? "all");
  const [district, setDistrict] = useState(searchParams.get("district") ?? "");
  const [priceMin, setPriceMin] = useState(Number(searchParams.get("budget") ?? 0));
  const [priceMax, setPriceMax] = useState(700000);
  const [sizeMin, setSizeMin] = useState(0);
  const [propertyTypeId, setPropertyTypeId] = useState(searchParams.get("type") ?? "all");
  const [bedrooms, setBedrooms] = useState(Number(searchParams.get("bedrooms") ?? 0));
  const [verifiedOnly, setVerifiedOnly] = useState(mode === "investment" || mode === "favorites");
  const [investmentScoreMin, setInvestmentScoreMin] = useState(mode === "investment" ? 75 : 0);
  const [mapBounds, setMapBounds] = useState<"all" | "north" | "central" | "south">("all");
  const [sort, setSort] = useState<PropertySort>(mode === "investment" ? "best-investment" : "newest");

  const properties = useMemo(() => publicProperties.map(enrichProperty), []);
  const favoriteIds = useMemo(() => getFavoriteIds(), []);

  const filtered = useMemo(() => {
    const base = mode === "favorites"
      ? properties.filter((property) => favoriteIds.includes(property.id))
      : properties;
    const next = filterProperties(base, {
      cityId,
      district,
      priceMin,
      priceMax,
      sizeMin,
      propertyTypeId,
      bedrooms,
      verifiedOnly,
      investmentScoreMin,
      mapBounds,
    });
    return sortProperties(next, sort);
  }, [
    properties,
    favoriteIds,
    mode,
    cityId,
    district,
    priceMin,
    priceMax,
    sizeMin,
    propertyTypeId,
    bedrooms,
    verifiedOnly,
    investmentScoreMin,
    mapBounds,
    sort,
  ]);

  const page = content[mode];

  return (
    <div className="container mx-auto px-4 pb-24 pt-28">
      <PageMeta
        title={`${page.title} | IraqProperty`}
        description={page.description}
        structuredData={createOrganizationSchema()}
      />
      <section className="section-shell px-6 py-10 md:px-8">
        <div className="flex flex-col gap-8 xl:flex-row">
          <aside className="xl:w-[320px]">
            <Card className="premium-card sticky top-24 border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-primary">
                  <SlidersHorizontal className="h-4 w-4" />
                  <p className="text-sm font-semibold uppercase tracking-[0.24em]">Advanced Search</p>
                </div>
                <div className="mt-6 space-y-4">
                  <Field label="City">
                    <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-white px-4 text-sm">
                      <option value="all">All Cities</option>
                      {iraqCities.map((city) => (
                        <option key={city.id} value={city.id}>{city.nameEn}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="District">
                    <input value={district} onChange={(e) => setDistrict(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-white px-4 text-sm" placeholder="Mansour, Ankawa, Al Ashar..." />
                  </Field>
                  <Field label="Property Type">
                    <select value={propertyTypeId} onChange={(e) => setPropertyTypeId(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-white px-4 text-sm">
                      <option value="all">All Types</option>
                      {propertyTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.labelEn}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={`Price Min $${priceMin.toLocaleString()}`}>
                    <input type="range" min={0} max={700000} step={10000} value={priceMin} onChange={(e) => setPriceMin(Number(e.target.value))} className="w-full" />
                  </Field>
                  <Field label={`Price Max $${priceMax.toLocaleString()}`}>
                    <input type="range" min={50000} max={900000} step={10000} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full" />
                  </Field>
                  <Field label={`Minimum Size ${sizeMin} sqm`}>
                    <input type="range" min={0} max={1000} step={20} value={sizeMin} onChange={(e) => setSizeMin(Number(e.target.value))} className="w-full" />
                  </Field>
                  <Field label="Bedrooms">
                    <select value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} className="h-11 w-full rounded-xl border border-input bg-white px-4 text-sm">
                      {[0, 1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>{value === 0 ? "Any" : `${value}+`}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={`Investment Score ${investmentScoreMin}+`}>
                    <input type="range" min={0} max={100} step={5} value={investmentScoreMin} onChange={(e) => setInvestmentScoreMin(Number(e.target.value))} className="w-full" />
                  </Field>
                  <Field label="Map Bounds">
                    <select value={mapBounds} onChange={(e) => setMapBounds(e.target.value as typeof mapBounds)} className="h-11 w-full rounded-xl border border-input bg-white px-4 text-sm">
                      <option value="all">All Iraq</option>
                      <option value="north">North</option>
                      <option value="central">Central</option>
                      <option value="south">South</option>
                    </select>
                  </Field>
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm">
                    <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
                    Verified only
                  </label>
                </div>
              </CardContent>
            </Card>
          </aside>
          <div className="flex-1">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">IraqProperty</p>
                <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{page.title}</h1>
                <p className="mt-3 max-w-2xl text-base leading-8 text-foreground/68">{page.description}</p>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <select value={sort} onChange={(e) => setSort(e.target.value as PropertySort)} className="h-11 rounded-xl border border-input bg-white px-4 text-sm">
                  <option value="newest">Newest</option>
                  <option value="lowest-price">Lowest Price</option>
                  <option value="highest-price">Highest Price</option>
                  <option value="best-investment">Best Investment</option>
                  <option value="verified-first">Verified First</option>
                </select>
                <Button asChild variant="outline" className="border-slate-200 bg-white">
                  <Link to="/map-search">Open Split Map View</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {filtered.length ? (
                filtered.map((property) => <PropertyCard key={property.id} property={property} />)
              ) : (
                <Card className="premium-card lg:col-span-2">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold">No properties match these filters</h2>
                    <p className="mt-3 text-sm leading-7 text-foreground/68">Try widening the budget or removing one filter to discover more verified opportunities.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

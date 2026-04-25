import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import { iraqCities } from "@/data/iraqCities";
import { publicProperties } from "@/data/sampleProperties";
import { geocodeIraqQuery, projectIraqCoordinates } from "@/lib/geocoding";
import { enrichProperty } from "@/lib/propertyMetrics";
import { pushSearchAlert, saveSearch } from "@/lib/savedSearches";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwnershipStatus } from "@/components/OwnershipStatus";
import { VerifiedBadge } from "@/components/VerifiedBadge";

const MIN_PRICE = 50000;
const MAX_PRICE = 700000;

export function MapSearchPage() {
  const [cityId, setCityId] = useState("all");
  const [minPrice, setMinPrice] = useState(90000);
  const [maxPrice, setMaxPrice] = useState(400000);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState("");

  const properties = useMemo(() => publicProperties.map(enrichProperty), []);
  const geocodedResults = useMemo(() => geocodeIraqQuery(query), [query]);

  const filteredProperties = useMemo(
    () =>
      properties.filter((property) => {
        const cityMatch = cityId === "all" || property.cityId === cityId;
        const priceMatch = property.priceUsd >= minPrice && property.priceUsd <= maxPrice;
        const queryMatch =
          query.trim() === "" ||
          [property.title, property.titleAr, property.area, property.city.nameEn]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase());
        return cityMatch && priceMatch && queryMatch;
      }),
    [properties, cityId, minPrice, maxPrice, query]
  );

  const selectedProperty =
    filteredProperties.find((property) => property.id === selectedId) ?? filteredProperties[0] ?? null;

  useEffect(() => {
    if (!selectedId && filteredProperties[0]) {
      setSelectedId(filteredProperties[0].id);
    }
  }, [filteredProperties, selectedId]);

  const handleSaveSearch = () => {
    const saved = saveSearch({
      name: `${cityId === "all" ? "All Iraq" : iraqCities.find((city) => city.id === cityId)?.nameEn} • $${minPrice / 1000}k-$${maxPrice / 1000}k`,
      cityId,
      minPrice,
      maxPrice,
      verifiedOnly: true,
    });

    filteredProperties
      .filter((property) => property.seller.verified)
      .slice(0, 3)
      .forEach((property) =>
        pushSearchAlert({
          searchId: saved.id,
          propertyId: property.id,
          title: `${property.title} matches your saved search`,
        })
      );

    setSavedMessage("Saved search created and alerts are now active for verified matches.");
    window.setTimeout(() => setSavedMessage(""), 3000);
  };

  return (
    <div className="container mx-auto px-4 pb-24 pt-28">
      <section className="section-shell px-6 py-10 md:px-8">
        <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Map Search</p>
              <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">
                Geocoded map search for serious Iraq buyers
              </h1>
              <p className="mt-4 max-w-xl text-base leading-8 text-foreground/72">
                Search by city, area, or listing name, then filter by price range and jump directly to interactive markers.
              </p>
            </div>

            <Card className="border-white/10 bg-white/[0.03]">
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Search location or property</label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-foreground/50" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Baghdad, Ankawa, Jadriya villa..."
                        className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/50 pl-10 pr-4 text-sm outline-none ring-0 placeholder:text-foreground/40"
                      />
                    </div>
                    {geocodedResults.length ? (
                      <div className="mt-3 space-y-2 rounded-2xl border border-white/8 bg-slate-950/50 p-3">
                        {geocodedResults.map((result) => (
                          <button
                            key={`${result.type}-${result.label}`}
                            type="button"
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-white/[0.04]"
                            onClick={() => {
                              setQuery(result.label);
                              if (result.cityId) setCityId(result.cityId);
                              if (result.propertyId) setSelectedId(result.propertyId);
                            }}
                          >
                            <span>{result.label}</span>
                            <span className="text-xs uppercase tracking-[0.18em] text-primary">{result.type}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">City</label>
                    <select
                      value={cityId}
                      onChange={(event) => setCityId(event.target.value)}
                      className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 text-sm"
                    >
                      <option value="all">All Iraq</option>
                      {iraqCities.map((city) => (
                        <option key={city.id} value={city.id}>{city.nameEn}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Minimum Price</label>
                      <input
                        type="range"
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        step={10000}
                        value={minPrice}
                        onChange={(event) => setMinPrice(Number(event.target.value))}
                        className="w-full"
                      />
                      <p className="mt-2 text-sm text-foreground/66">${minPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Maximum Price</label>
                      <input
                        type="range"
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        step={10000}
                        value={maxPrice}
                        onChange={(event) => setMaxPrice(Number(event.target.value))}
                        className="w-full"
                      />
                      <p className="mt-2 text-sm text-foreground/66">${maxPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  <Button onClick={handleSaveSearch} className="w-full">
                    Save Search and Alerts
                  </Button>
                  {savedMessage ? <p className="text-sm text-emerald-300">{savedMessage}</p> : null}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden border-white/10 bg-card/70">
              <CardContent className="p-0">
                <div className="relative h-[520px] bg-[linear-gradient(135deg,#0b1220_0%,#13243c_45%,#1f4b6e_100%)]">
                  <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                    <path
                      d="M25,10 L43,9 L58,14 L68,28 L78,29 L88,54 L80,85 L62,91 L47,86 L34,88 L22,79 L14,63 L11,45 L17,29 Z"
                      fill="rgba(255,255,255,0.07)"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="1.1"
                    />
                  </svg>
                  {filteredProperties.map((property) => {
                    const { x, y } = projectIraqCoordinates(property.lat, property.lng);
                    const selected = property.id === selectedProperty?.id;
                    return (
                      <button
                        key={property.id}
                        type="button"
                        onClick={() => setSelectedId(property.id)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-xs font-semibold shadow-lg transition-transform ${
                          selected
                            ? "z-20 scale-110 border-emerald-300 bg-emerald-400 text-slate-950"
                            : "z-10 border-white/20 bg-slate-950/80 text-white"
                        }`}
                        style={{ left: `${x}%`, top: `${y}%` }}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{property.city.nameEn}</span>
                        </div>
                      </button>
                    );
                  })}
                  {selectedProperty ? (
                    <div className="absolute bottom-4 left-4 right-4 z-30 rounded-[1.4rem] border border-white/10 bg-slate-950/92 p-4 backdrop-blur-xl">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-primary">Selected marker</p>
                          <h2 className="mt-2 text-xl font-bold">{selectedProperty.title}</h2>
                          <p className="mt-1 text-sm text-foreground/68">{selectedProperty.area}, {selectedProperty.city.nameEn}</p>
                        </div>
                        <Button asChild size="sm">
                          <Link to={`/property/${selectedProperty.slug}`}>View Listing</Link>
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {filteredProperties.length ? (
                filteredProperties.map((property) => (
                  <button
                    key={property.id}
                    type="button"
                    className={`rounded-[1.5rem] border p-4 text-left transition-colors ${
                      property.id === selectedProperty?.id
                        ? "border-primary bg-primary/10"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                    onClick={() => setSelectedId(property.id)}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <VerifiedBadge variant={property.seller.verification} />
                          <OwnershipStatus status={property.ownershipStatus} />
                        </div>
                        <h3 className="mt-3 text-xl font-bold">{property.title}</h3>
                        <p className="mt-1 text-sm text-foreground/68">{property.city.nameEn} • {property.area}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-foreground/62">Asking Price</p>
                        <p className="mt-1 text-2xl font-bold">${property.priceUsd.toLocaleString()}</p>
                        <p className="mt-1 text-sm text-emerald-300">{property.investmentScore}/100 investment score</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <Card className="border-white/10 bg-card/70">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold">No listings match this filter</h2>
                    <p className="mt-3 text-sm leading-7 text-foreground/68">
                      Widen the price range or switch cities to see more verified listings on the map.
                    </p>
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

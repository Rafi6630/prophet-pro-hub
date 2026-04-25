import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import L from "leaflet";
import { MapPin, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { geocodeIraqQuery } from "@/lib/geocoding";
import { formatPrice, propertyImage, type PropertyWithMedia } from "@/lib/property";
import { featuredSeededProperties, getSeededPublicProperties } from "@/lib/sampleInventory";
import { Button } from "@/components/ui/button";
import { saveSearch, pushSearchAlert } from "@/lib/savedSearches";
import { useToast } from "@/hooks/use-toast";

const MIN_PRICE = 50_000;
const MAX_PRICE = 800_000;

function createPriceIcon(price: number, selected: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${selected ? "#10b981" : "#0f172a"};
      color:white;
      border:1px solid ${selected ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.14)"};
      border-radius:9999px;
      padding:8px 12px;
      font-size:12px;
      font-weight:700;
      box-shadow:0 12px 30px rgba(15,23,42,0.28);
      white-space:nowrap;
    ">${formatPrice(price)}</div>`,
    iconAnchor: [36, 18],
  });
}

export default function MapSearch() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(450_000);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    document.title = `${t("map.title")} — ${t("common.appName")}`;
  }, [t]);

  const { data: properties = [] } = useQuery({
    queryKey: ["map-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*, property_images(*)")
        .eq("status", "active")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .limit(100);

      return ((data?.length ? data : getSeededPublicProperties()) ?? []) as PropertyWithMedia[];
    },
  });

  const cityOptions = useMemo(() => {
    return Array.from(new Set(properties.map((property) => property.city))).sort();
  }, [properties]);

  const geocodedResults = useMemo(() => geocodeIraqQuery(query), [query]);

  const filteredProperties = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();
    return properties.filter((property) => {
      const cityMatch = city === "all" || property.city === city;
      const priceMatch = property.price >= minPrice && property.price <= maxPrice;
      const queryMatch =
        !loweredQuery ||
        [property.title, property.title_ar, property.district, property.city]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(loweredQuery);

      return cityMatch && priceMatch && queryMatch;
    });
  }, [properties, city, minPrice, maxPrice, query]);

  const selectedProperty = filteredProperties.find((property) => property.id === selectedId) ?? filteredProperties[0] ?? null;

  useEffect(() => {
    if (!selectedId && filteredProperties[0]) {
      setSelectedId(filteredProperties[0].id);
    }
  }, [filteredProperties, selectedId]);

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return;

    const map = L.map(mapNodeRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([33.3152, 44.3661], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markers = markersRef.current;
    if (!map || !markers) return;

    markers.clearLayers();
    const bounds: L.LatLngExpression[] = [];

    filteredProperties.forEach((property) => {
      const lat = property.latitude ?? 0;
      const lng = property.longitude ?? 0;
      const selected = property.id === selectedProperty?.id;

      const marker = L.marker([lat, lng], {
        icon: createPriceIcon(property.price, selected),
      });

      marker.on("click", () => setSelectedId(property.id));
      marker.bindPopup(`
        <div style="min-width:220px">
          <strong>${property.title_ar || property.title}</strong><br/>
          <span>${property.district ? `${property.district}, ` : ""}${property.city}</span><br/>
          <span>${formatPrice(property.price)}</span>
        </div>
      `);

      markers.addLayer(marker);
      bounds.push([lat, lng]);
    });

    if (bounds.length === 1) {
      map.setView(bounds[0] as L.LatLngExpression, 11);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [filteredProperties, selectedProperty]);

  const handleSaveSearch = () => {
    const saved = saveSearch({
      name: `${city === "all" ? "All Iraq" : city} • ${formatPrice(minPrice)}-${formatPrice(maxPrice)}`,
      cityId: city,
      minPrice,
      maxPrice,
      verifiedOnly: true,
    });

    filteredProperties
      .filter((property) => ["verified", "premium"].includes(property.verification_level))
      .slice(0, 5)
      .forEach((property) =>
        pushSearchAlert({
          searchId: saved.id,
          propertyId: property.id,
          title: `${property.title} matches your verified search`,
        }),
      );

    toast({
      title: "Saved search active",
      description: "New verified matches are now being tracked in your dashboard.",
    });
  };

  return (
    <div className="container-app py-6 lg:py-10">
      <div className="section-shell overflow-hidden">
        <div className="grid gap-5 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.9)_60%,rgba(245,158,11,0.16))] px-6 py-8 text-white lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/86">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Interactive discovery with real coordinates
            </div>
            <h1 className="text-3xl font-extrabold lg:text-4xl">{t("map.title")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/72 lg:text-base">{t("map.subtitle")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="soft-panel p-4">
              <div className="text-2xl font-extrabold">{filteredProperties.length}</div>
              <div className="mt-1 text-xs text-white/70">Filtered listings</div>
            </div>
            <div className="soft-panel p-4">
              <div className="text-2xl font-extrabold">{cityOptions.length}</div>
              <div className="mt-1 text-xs text-white/70">Active cities</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[360px,1fr]">
        <aside className="content-panel space-y-4 p-4 xl:sticky xl:top-24 xl:self-start">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">Search & alerts</p>
              <h2 className="mt-1 text-xl font-extrabold">Filter the map</h2>
            </div>
            <SlidersHorizontal className="h-5 w-5 text-primary" />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Baghdad, Ankawa, Jadriya..."
                className="h-12 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-sm"
              />
            </div>
            {geocodedResults.length > 0 && query.trim() ? (
              <div className="mt-2 space-y-2 rounded-2xl border border-border bg-white p-2">
                {geocodedResults.map((result) => (
                  <button
                    key={`${result.type}-${result.label}`}
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-secondary"
                    onClick={() => {
                      setQuery(result.label);
                      if (result.cityId) {
                        const geocodedCity = cityOptions.find((option) => option.toLowerCase() === result.label.split("•")[0].trim().toLowerCase());
                        if (geocodedCity) setCity(geocodedCity);
                      }
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
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              City
            </label>
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm"
            >
              <option value="all">All Iraq</option>
              {cityOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Minimum price
              </label>
              <input type="range" min={MIN_PRICE} max={MAX_PRICE} step={10_000} value={minPrice} onChange={(event) => setMinPrice(Number(event.target.value))} className="w-full" />
              <p className="mt-2 text-sm font-semibold">{formatPrice(minPrice)}</p>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Maximum price
              </label>
              <input type="range" min={MIN_PRICE} max={MAX_PRICE} step={10_000} value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} className="w-full" />
              <p className="mt-2 text-sm font-semibold">{formatPrice(maxPrice)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground/72">
            Save this search to track new verified listings matching your city and price window.
          </div>

          <Button onClick={handleSaveSearch} className="w-full rounded-2xl">
            Save Search and Alerts
          </Button>
        </aside>

        <div className="space-y-6">
          <div className="content-panel overflow-hidden p-3">
            <div ref={mapNodeRef} className="h-[540px] w-full rounded-[1.5rem]" />
          </div>

          {selectedProperty ? (
            <div className="content-panel p-5">
              <div className="grid gap-4 lg:grid-cols-[160px,1fr,auto] lg:items-center">
                <div className="h-32 overflow-hidden rounded-2xl bg-muted">
                  <img src={propertyImage(selectedProperty)} alt={selectedProperty.title} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">Selected property</p>
                  <h2 className="mt-1 text-2xl font-extrabold">{selectedProperty.title_ar || selectedProperty.title}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {selectedProperty.district ? `${selectedProperty.district}, ` : ""}{selectedProperty.city}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="filter-pill">{formatPrice(selectedProperty.price)}</span>
                    <span className="filter-pill">{selectedProperty.area_m2} sqm</span>
                    <span className="filter-pill capitalize">{selectedProperty.property_kind}</span>
                  </div>
                </div>
                <Button asChild className="rounded-2xl">
                  <Link to={`/property/${selectedProperty.id}`}>Open Property</Link>
                </Button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4">
            {(filteredProperties.length ? filteredProperties : featuredSeededProperties(4)).map((property) => (
              <button
                key={property.id}
                type="button"
                className={`content-panel p-4 text-left transition ${property.id === selectedProperty?.id ? "ring-2 ring-primary/40" : ""}`}
                onClick={() => setSelectedId(property.id)}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{property.title_ar || property.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{property.city}{property.district ? ` • ${property.district}` : ""}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-2xl font-extrabold text-primary">{formatPrice(property.price)}</p>
                    <p className="mt-1 text-sm text-foreground/70">Investment score {property.investment_score ?? 0}/100</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

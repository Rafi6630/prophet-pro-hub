import { useEffect, useMemo, useState } from "react";
import { Bell, Building2, Heart, ShieldCheck, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { iraqCities } from "@/data/iraqCities";
import { publicProperties } from "@/data/sampleProperties";
import { getFavoriteIds } from "@/lib/favorites";
import { enrichProperty } from "@/lib/propertyMetrics";
import { getSavedSearches, getSearchAlerts, type SavedSearch, type SearchAlert } from "@/lib/savedSearches";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwnershipStatus } from "@/components/OwnershipStatus";
import { PropertyCard } from "@/components/PropertyCard";
import { VerifiedBadge } from "@/components/VerifiedBadge";

export function DashboardPage() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [alerts, setAlerts] = useState<SearchAlert[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const properties = useMemo(() => publicProperties.map(enrichProperty), []);
  const favoriteProperties = properties.filter((property) => favoriteIds.includes(property.id));

  useEffect(() => {
    setSavedSearches(getSavedSearches());
    setAlerts(getSearchAlerts());
    setFavoriteIds(getFavoriteIds());
  }, []);

  return (
    <div className="container mx-auto px-4 pb-24 pt-28">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Buyer Dashboard
            </p>
            <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">
              Everything you need before you buy in Iraq
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-foreground/72">
              Monitor saved listings, follow price alerts, and keep trusted sellers together in one clean decision view.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Saved Listings", value: `${favoriteProperties.length}`, icon: Heart },
                { label: "Verified Sellers", value: `${properties.filter((property) => property.seller.verified).length}`, icon: ShieldCheck },
                { label: "Active Alerts", value: `${alerts.length}`, icon: Bell },
                { label: "Saved Searches", value: `${savedSearches.length}`, icon: TrendingUp },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl bg-slate-950/40 p-4">
                    <Icon className="h-5 w-5 text-primary" />
                    <p className="mt-4 text-3xl font-bold">{item.value}</p>
                    <p className="mt-1 text-sm text-foreground/68">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Trust Snapshot
            </p>
            <div className="mt-6 space-y-3">
              <VerifiedBadge variant="seller" />
              <VerifiedBadge variant="agency" />
              <VerifiedBadge variant="ownership" />
              <OwnershipStatus status="verified" />
            </div>
            <Button asChild className="mt-8 w-full">
              <Link to="/map-search">Manage Searches</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-card/70">
          <CardContent className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Alerts
            </p>
            <div className="mt-6 space-y-4">
              {alerts.length ? (
                alerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="font-semibold">{alert.title}</p>
                    <p className="mt-2 text-sm text-foreground/66">
                      {new Date(alert.createdAt).toLocaleDateString()} • Match ready for review
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="font-semibold">No alerts yet</p>
                  <p className="mt-2 text-sm text-foreground/66">
                    Save a search from Map Search to start getting notified when verified listings match.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/70">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary">
              <Building2 className="h-5 w-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em]">Top cities this month</p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {iraqCities.slice(0, 6).map((city) => (
                <div key={city.id} className="rounded-2xl border border-white/8 bg-slate-950/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{city.nameEn}</p>
                      <p className="text-sm text-foreground/62">{city.nameAr}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {city.growthScore}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-foreground/68">
                    {city.popularAreas.slice(0, 2).join(" • ")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-card/70">
          <CardContent className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Saved Searches</p>
            <div className="mt-6 space-y-4">
              {savedSearches.length ? (
                savedSearches.map((search) => (
                  <div key={search.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="font-semibold">{search.name}</p>
                    <p className="mt-2 text-sm text-foreground/66">
                      Price range ${search.minPrice.toLocaleString()} - ${search.maxPrice.toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="font-semibold">No saved searches</p>
                  <p className="mt-2 text-sm text-foreground/66">
                    Create a search in Map Search to keep watching new verified inventory.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {favoriteProperties.length ? (
            favoriteProperties.slice(0, 2).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            <Card className="border-white/10 bg-card/70">
              <CardContent className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Saved Listings</p>
                <p className="mt-4 text-lg font-semibold">No saved listings yet</p>
                <p className="mt-2 text-sm leading-7 text-foreground/68">
                  Save any listing from Buy or Property Detail and it will appear here with trust and pricing metrics.
                </p>
                <Button asChild className="mt-6">
                  <Link to="/buy">Explore Listings</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}

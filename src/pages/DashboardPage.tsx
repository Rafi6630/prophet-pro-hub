import { Bell, Building2, Heart, ShieldCheck, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { iraqCities } from "@/data/iraqCities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwnershipStatus } from "@/components/OwnershipStatus";
import { VerifiedBadge } from "@/components/VerifiedBadge";

const savedAlerts = [
  { label: "Baghdad apartments under market average", value: "12 new matches" },
  { label: "Erbil villas with verified ownership", value: "5 new matches" },
  { label: "Basra commercial shops near main roads", value: "8 new matches" },
];

export function DashboardPage() {
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
                { label: "Saved Listings", value: "24", icon: Heart },
                { label: "Verified Sellers", value: "17", icon: ShieldCheck },
                { label: "Active Alerts", value: "9", icon: Bell },
                { label: "Growth Cities", value: "6", icon: TrendingUp },
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
              <Link to="/verified-sellers">Explore Verified Sellers</Link>
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
              {savedAlerts.map((alert) => (
                <div key={alert.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="font-semibold">{alert.label}</p>
                  <p className="mt-2 text-sm text-foreground/66">{alert.value}</p>
                </div>
              ))}
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
    </div>
  );
}

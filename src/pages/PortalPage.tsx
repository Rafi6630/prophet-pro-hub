import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  Map,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { iraqCities } from "@/data/iraqCities";
import { publicProperties } from "@/data/sampleProperties";
import { getFavoriteIds } from "@/lib/favorites";
import { enrichProperty } from "@/lib/propertyMetrics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwnershipStatus } from "@/components/OwnershipStatus";
import { PropertyCard } from "@/components/PropertyCard";
import { VerifiedBadge } from "@/components/VerifiedBadge";

type PortalPageKey =
  | "buy"
  | "investment"
  | "map-search"
  | "market-prices"
  | "verified-sellers"
  | "favorites";

interface PortalPageProps {
  pageKey: PortalPageKey;
}

const pageContent: Record<
  PortalPageKey,
  {
    title: string;
    titleAr: string;
    description: string;
    icon: typeof Search;
  }
> = {
  buy: {
    title: "Buy in Iraq with clear numbers and trusted sellers",
    titleAr: "اشترِ في العراق بأرقام واضحة وبائعين موثوقين",
    description:
      "Compare fair price, ownership status, and growth signals before you contact a seller.",
    icon: Search,
  },
  investment: {
    title: "Investment opportunities ranked for yield and liquidity",
    titleAr: "فرص استثمارية مرتبة حسب العائد وسهولة البيع",
    description:
      "Review deal quality using city growth, resale demand, pricing, and legal confidence.",
    icon: Sparkles,
  },
  "map-search": {
    title: "Map search built around neighborhoods buyers actually ask for",
    titleAr: "بحث بالخريطة مبني حول المناطق التي يطلبها المشترون فعلاً",
    description:
      "Explore Baghdad, Erbil, Basra, and more with area demand, price bands, and seller trust.",
    icon: Map,
  },
  "market-prices": {
    title: "Market prices you can understand in seconds",
    titleAr: "أسعار سوق واضحة يمكنك فهمها خلال ثوانٍ",
    description:
      "Track average price per square meter and compare asking prices against local benchmarks.",
    icon: BarChart3,
  },
  "verified-sellers": {
    title: "Verified sellers and agencies with reviewed ownership signals",
    titleAr: "بائعون ووكالات موثوقة مع مؤشرات ملكية تمت مراجعتها",
    description:
      "Shortlist trusted sellers first to reduce wasted visits, fake listings, and document risk.",
    icon: ShieldCheck,
  },
  favorites: {
    title: "Saved properties and alert-driven shortlists",
    titleAr: "العقارات المحفوظة والقوائم المختصرة المبنية على التنبيهات",
    description:
      "Track your best matches and compare them with pricing, trust, and investment metrics side by side.",
    icon: BadgeDollarSign,
  },
};

export function PortalPage({ pageKey }: PortalPageProps) {
  const content = pageContent[pageKey];
  const Icon = content.icon;
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    if (pageKey === "favorites") {
      setFavoriteIds(getFavoriteIds());
    }
  }, [pageKey]);

  const sampleCards = useMemo(() => {
    const base = publicProperties.map(enrichProperty);
    switch (pageKey) {
      case "investment":
        return base.sort((a, b) => b.investmentScore - a.investmentScore).slice(0, 4);
      case "market-prices":
        return base.sort((a, b) => Math.abs(a.priceDelta) - Math.abs(b.priceDelta)).slice(0, 4);
      case "verified-sellers":
        return base.filter((property) => property.seller.verified).slice(0, 4);
      case "favorites":
        return base.filter((property) => favoriteIds.includes(property.id));
      default:
        return base.slice(0, 4);
    }
  }, [pageKey, favoriteIds]);

  return (
    <div className="container mx-auto px-4 pb-24 pt-28">
      <section className="section-shell overflow-hidden px-6 py-12 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Icon className="h-4 w-4" />
              <span>IraqProperty</span>
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
                {content.title}
              </h1>
              <p className="text-lg font-medium text-primary/90">{content.titleAr}</p>
              <p className="max-w-2xl text-base leading-8 text-foreground/72 md:text-lg">
                {content.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-11 px-5">
                <Link to="/dashboard">
                  Open Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 border-white/10 bg-white/5 px-5">
                <Link to="/verified-sellers">Trusted Sellers</Link>
              </Button>
            </div>
          </div>

          <Card className="border-white/10 bg-white/[0.03]">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Live decision checklist
              </p>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-foreground/70">Fair Price Estimate</p>
                  <p className="mt-2 text-3xl font-bold">$242,000</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-foreground/70">Investment Score</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-300">84/100</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-foreground/70">Risk Level</p>
                    <p className="mt-2 text-2xl font-bold text-amber-300">Low</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <VerifiedBadge variant="seller" />
                  <VerifiedBadge variant="ownership" />
                </div>
                <OwnershipStatus status="verified" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2 2xl:grid-cols-4">
        {sampleCards.length ? (
          sampleCards.map((card) => (
            <PropertyCard key={card.id} property={card} />
          ))
        ) : (
          <Card className="border-white/10 bg-card/70 lg:col-span-2 2xl:col-span-4">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold">No saved properties yet</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/70">
                Save listings from Buy, Map Search, or Property Detail and they will appear here with pricing, trust, and investment metrics.
              </p>
              <Button asChild className="mt-6">
                <Link to="/buy">Explore Listings</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-8">
        <div className="flex items-center gap-2 text-primary">
          <BadgeDollarSign className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-[0.24em]">Top cities buyers track</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {iraqCities.slice(0, 8).map((city) => (
            <div key={city.id} className="rounded-2xl border border-white/8 bg-slate-950/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{city.nameEn}</p>
                  <p className="text-sm text-foreground/60">{city.nameAr}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {city.growthScore}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

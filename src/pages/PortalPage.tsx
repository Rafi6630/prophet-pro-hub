import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  Heart,
  Map,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { iraqCities } from "@/data/iraqCities";
import { propertyTypes } from "@/data/propertyTypes";
import { estimateFairPrice } from "@/lib/fairPrice";
import { calculateInvestmentScore } from "@/lib/investmentScore";
import { calculateRiskScore } from "@/lib/riskScore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwnershipStatus } from "@/components/OwnershipStatus";
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
    title: "Save the right listings and compare them like an investor",
    titleAr: "احفظ العقارات المناسبة وقارنها بعقلية المستثمر",
    description:
      "Keep all shortlisted properties in one place with fair price and risk level side by side.",
    icon: Heart,
  },
};

export function PortalPage({ pageKey }: PortalPageProps) {
  const content = pageContent[pageKey];
  const Icon = content.icon;

  const sampleCards = useMemo(
    () =>
      iraqCities.slice(0, 3).map((city, index) => {
        const marketAverage = 1180 + index * 140;
        const size = 180 + index * 35;
        const fairPrice = estimateFairPrice({
          size,
          marketAverage,
          condition: index === 0 ? "excellent" : index === 1 ? "good" : "average",
          areaDemand: city.growthScore,
        });
        const score = calculateInvestmentScore({
          pricePerSqm: marketAverage - 60 + index * 20,
          marketAverage,
          locationGrowth: city.growthScore,
          liquidity: 76 + index * 6,
          condition: 72 + index * 10,
        });

        const risk = calculateRiskScore({
          hasMissingDocuments: index === 2,
          sellerVerified: index !== 2,
          suspiciouslyLowPrice: index === 2,
          hasLegalIssues: false,
        });

        return {
          id: `${pageKey}-${city.id}`,
          city,
          score,
          fairPrice,
          risk,
          size,
          type: propertyTypes[index].labelEn,
        };
      }),
    [pageKey]
  );

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

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        {sampleCards.map((card) => (
          <Card key={card.id} className="border-white/10 bg-card/70">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground/60">{card.city.nameAr}</p>
                  <h2 className="mt-1 text-2xl font-bold">{card.city.nameEn}</h2>
                </div>
                <VerifiedBadge variant={pageKey === "verified-sellers" ? "agency" : "seller"} />
              </div>

              <div className="mt-6 space-y-3 text-sm text-foreground/78">
                <div className="flex items-center justify-between">
                  <span>Property Type</span>
                  <span>{card.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Size</span>
                  <span>{card.size} sqm</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fair Price Estimate</span>
                  <span>${card.fairPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Investment Score</span>
                  <span className="font-semibold text-emerald-300">{card.score}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Risk Level</span>
                  <span className="font-semibold">{card.risk}</span>
                </div>
              </div>

              <div className="mt-6">
                <OwnershipStatus
                  status={
                    card.risk === "Low"
                      ? "verified"
                      : card.risk === "Medium"
                        ? "pending"
                        : "missing-documents"
                  }
                />
              </div>

              <div className="mt-6 rounded-2xl bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">Popular Areas</p>
                <p className="mt-2 text-sm leading-7 text-foreground/76">
                  {card.city.popularAreas.join(" • ")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
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

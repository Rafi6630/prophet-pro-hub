import { ArrowRight, Building2, ChartColumnBig, Heart, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { iraqCities } from "@/data/iraqCities";
import { propertyTypes } from "@/data/propertyTypes";
import { estimateFairPrice } from "@/lib/fairPrice";
import { calculateInvestmentScore } from "@/lib/investmentScore";
import { calculateRiskScore } from "@/lib/riskScore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwnershipStatus } from "@/components/OwnershipStatus";
import { StickyMobileContact } from "@/components/StickyMobileContact";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";

const featuredProperty = {
  id: "baghdad-jadriya-villa-001",
  title: "Waterfront family villa in Al Jadriya",
  titleAr: "فيلا عائلية مطلة على الواجهة في الجادرية",
  city: iraqCities[0],
  sellerPhone: "+9647701234567",
  sellerId: "seller-baghdad-001",
  type: propertyTypes[6],
  size: 420,
  marketAverage: 1650,
  condition: "excellent" as const,
  areaDemand: 92,
};

const fairPrice = estimateFairPrice({
  size: featuredProperty.size,
  marketAverage: featuredProperty.marketAverage,
  condition: featuredProperty.condition,
  areaDemand: featuredProperty.areaDemand,
});

const investmentScore = calculateInvestmentScore({
  pricePerSqm: 1580,
  marketAverage: featuredProperty.marketAverage,
  locationGrowth: featuredProperty.city.growthScore,
  liquidity: 82,
  condition: 91,
});

const riskLevel = calculateRiskScore({
  hasMissingDocuments: false,
  sellerVerified: true,
  suspiciouslyLowPrice: false,
  hasLegalIssues: false,
});

export function HomePage() {
  return (
    <div className="min-h-screen pb-28">
      <section className="navy-grid-bg relative overflow-hidden pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(245,158,11,0.18),transparent_22%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.18),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.54))]" />
        <div className="container relative z-10 mx-auto px-4 pb-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <ShieldCheck className="h-4 w-4" />
                <span>Know Everything Before You Buy</span>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-5xl text-5xl font-extrabold leading-tight text-foreground md:text-7xl">
                  Iraq real estate, built for serious buyers and investors.
                  <span className="font-display block text-6xl font-semibold italic leading-none gradient-text md:text-8xl">
                    Fair Price Estimate, seller trust, and ownership clarity in one portal.
                  </span>
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-foreground/74 md:text-xl">
                  Prophet Pro Hub is now an Iraq-focused real estate investment portal that helps buyers compare real market prices, review trusted sellers, follow city growth, and move faster with less risk.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="h-14 px-8 text-base">
                  <Link to="/buy">
                    Start Buying
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 border-white/20 bg-white/5 px-8 text-base text-foreground hover:bg-white/10"
                >
                  <Link to="/market-prices">See Market Prices</Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: "10", label: "major Iraqi cities tracked" },
                  { value: "346", label: "verified sellers and agencies in review flow" },
                  { value: "84/100", label: "sample investment score for high-demand listings" },
                ].map((item) => (
                  <div key={item.label} className="glass rounded-2xl p-5">
                    <div className="text-3xl font-extrabold text-primary">{item.value}</div>
                    <p className="mt-2 text-sm leading-6 text-foreground/72">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-shell warm-shadow p-4">
              <div className="relative overflow-hidden rounded-[1.8rem]">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80"
                  alt="Modern urban real estate skyline"
                  className="h-[640px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
              </div>

              <Card className="glass absolute bottom-8 left-8 right-8 border-white/15">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    <VerifiedBadge variant="seller" />
                    <VerifiedBadge variant="ownership" />
                  </div>
                  <h2 className="mt-4 text-2xl font-bold">{featuredProperty.title}</h2>
                  <p className="mt-1 text-sm text-foreground/70">{featuredProperty.titleAr}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-sm text-foreground/64">Fair Price Estimate</p>
                      <p className="mt-2 text-2xl font-bold">${fairPrice.toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-sm text-foreground/64">Investment Score</p>
                      <p className="mt-2 text-2xl font-bold text-emerald-300">{investmentScore}/100</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <OwnershipStatus status={riskLevel === "Low" ? "verified" : "pending"} />
                    <span className="text-sm font-semibold text-amber-200">Risk: {riskLevel}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Portal highlights</p>
          <h2 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">
            Buyer-friendly tools that simplify hard property decisions
          </h2>
          <p className="mt-5 text-lg leading-8 text-foreground/72">
            The portal replaces jargon with clear signals: fair value, trust status, city growth, and what action to take next.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {[
            {
              icon: Building2,
              title: "Verified sellers",
              description: "Start with seller trust before wasting time on weak listings.",
            },
            {
              icon: ChartColumnBig,
              title: "Fair Price Estimate",
              description: "Compare asking price against local benchmarks and property condition.",
            },
            {
              icon: MapPinned,
              title: "Map search",
              description: "Browse the neighborhoods buyers in Iraq actually care about most.",
            },
            {
              icon: Sparkles,
              title: "Investment score",
              description: "See yield potential using price, growth, liquidity, and condition.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="border-white/10 bg-card/70">
                <CardContent className="p-6">
                  <div className="inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-4 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold">{item.title}</h3>
                  <p className="mt-4 text-base leading-7 text-foreground/72">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 py-6">
        <div className="section-shell px-6 py-10 md:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Top cities</p>
              <h2 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">
                Track growth where demand, liquidity, and trust are strongest
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-foreground/68">
              City scores help buyers prioritize where capital is moving and which neighborhoods deserve a closer look.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {iraqCities.map((city) => (
              <div key={city.id} className="rounded-2xl border border-white/8 bg-slate-950/28 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{city.nameEn}</p>
                    <p className="text-sm text-foreground/62">{city.nameAr}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {city.growthScore}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-foreground/68">
                  {city.popularAreas.slice(0, 2).join(" • ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-white/10 bg-card/70">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Popular property types</p>
              <div className="mt-6 grid gap-3">
                {propertyTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
                    <span className="font-medium">{type.labelEn}</span>
                    <span className="text-sm text-foreground/62">{type.labelAr}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/70">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">How buyers decide faster</p>
              <div className="mt-6 space-y-4">
                {[
                  "Check Fair Price Estimate before speaking to the seller.",
                  "Review ownership status to catch missing documents early.",
                  "Prioritize verified agencies when comparing similar listings.",
                  "Use dashboard favorites to compare price, area, and trust signals side by side.",
                ].map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12 font-semibold text-primary">
                      0{index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-7 text-foreground/78">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-8">
        <div className="section-shell warm-shadow px-6 py-12 md:px-12 md:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Ready to compare serious options?</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-bold text-foreground md:text-5xl">
                Buy with stronger evidence, simpler language, and better local market context.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground/72">
                Start with verified listings, map search, and fair pricing instead of guessing from ad copy alone.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg" className="h-14 px-8 text-base">
                <Link to="/buy">Explore Listings</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 border-white/10 bg-white/5 px-8 text-base">
                <Link to="/favorites">
                  <Heart className="h-4 w-4" />
                  Open Favorites
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <WhatsAppCTA
        phoneNumber={featuredProperty.sellerPhone}
        listingId={featuredProperty.id}
        sellerId={featuredProperty.sellerId}
        city={featuredProperty.city.nameEn}
      />
      <StickyMobileContact
        listingId={featuredProperty.id}
        phoneNumber={featuredProperty.sellerPhone}
        whatsappNumber={featuredProperty.sellerPhone}
        sellerId={featuredProperty.sellerId}
        city={featuredProperty.city.nameEn}
      />
    </div>
  );
}

import { ArrowRight, ChartColumnBig, Download, Landmark, MapPinned, ShieldCheck, UserRoundPlus } from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "@/components/common/PageMeta";
import { HeroPropertySearch } from "@/components/HeroPropertySearch";
import { PropertyCard } from "@/components/PropertyCard";
import { StickyMobileContact } from "@/components/StickyMobileContact";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { marketInsights } from "@/data/marketInsights";
import { propertyTypes } from "@/data/propertyTypes";
import { publicProperties } from "@/data/sampleProperties";
import { sellerProfiles } from "@/data/sellerProfiles";
import { enrichProperty } from "@/lib/propertyMetrics";
import { getRecommendedDeals } from "@/lib/recommendationEngine";
import { createOrganizationSchema } from "@/lib/structuredData";
import { OwnershipStatus } from "@/components/OwnershipStatus";
import type { ReactNode } from "react";

const featuredProperty = enrichProperty(publicProperties[0]);
const latestProperties = publicProperties.slice(0, 3).map(enrichProperty);
const recommendedDeals = getRecommendedDeals(undefined, 78);

export function HomePage() {
  return (
    <div className="min-h-screen pb-28">
      <PageMeta
        title="IraqProperty | Know Everything Before You Buy"
        description="Iraq's trusted property marketplace for buyers and investors with verified sellers, Fair Price Estimate, Investment Deals, and market intelligence."
        structuredData={createOrganizationSchema()}
      />

      <section className="navy-grid-bg relative overflow-hidden pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(245,158,11,0.18),transparent_22%),radial-gradient(circle_at_85%_20%,rgba(16,185,129,0.18),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.58))]" />
        <div className="container relative z-10 mx-auto px-4 pb-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <ShieldCheck className="h-4 w-4" />
                <span>Know Everything Before You Buy</span>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-5xl text-5xl font-extrabold leading-tight text-foreground md:text-7xl">
                  Iraq’s trusted property marketplace for serious buyers and investors.
                  <span className="font-display block text-6xl font-semibold italic leading-none gradient-text md:text-8xl">
                    اعرف كل شيء قبل أن تشتري
                  </span>
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-foreground/74 md:text-xl">
                  Compare verified homes, land, and commercial property using Fair Price Estimate, ownership confidence, area intelligence, and buyer-friendly market pricing.
                </p>
              </div>

              <HeroPropertySearch />

              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="h-14 px-8 text-base">
                  <Link to="/buy">
                    Buy House
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 border-white/20 bg-white/5 px-8 text-base text-foreground hover:bg-white/10">
                  <Link to="/buy">Buy Land</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 border-white/20 bg-white/5 px-8 text-base text-foreground hover:bg-white/10">
                  <Link to="/map-search">Commercial</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 border-white/20 bg-white/5 px-8 text-base text-foreground hover:bg-white/10">
                  <Link to="/investment">Investment Deals</Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { value: "1,284", label: "Verified Listings" },
                  { value: `${sellerProfiles.filter((seller) => seller.verified).length * 17}`, label: "Verified Agencies" },
                  { value: "3,420", label: "Deals Closed" },
                  { value: "10", label: "Cities Covered" },
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
                    <VerifiedBadge variant={featuredProperty.seller.verification} />
                    <VerifiedBadge variant="ownership" />
                  </div>
                  <h2 className="mt-4 text-2xl font-bold">{featuredProperty.title}</h2>
                  <p className="mt-1 text-sm text-foreground/70">{featuredProperty.titleAr}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-sm text-foreground/64">Fair Price Estimate</p>
                      <p className="mt-2 text-2xl font-bold">${featuredProperty.fairPrice.toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-sm text-foreground/64">Investment Score</p>
                      <p className="mt-2 text-2xl font-bold text-emerald-300">{featuredProperty.investmentScore}/100</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <OwnershipStatus status={featuredProperty.ownershipStatus} />
                    <span className="text-sm font-semibold text-amber-200">Risk: {featuredProperty.riskLevel}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <SectionShell
        eyebrow="Featured Listings"
        title="High-trust listings buyers can act on faster"
        ctaLabel="See All Listings"
        ctaTo="/buy"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {latestProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Top Investment Opportunities"
        title="Ranked deals with stronger exit logic and cleaner trust signals"
        ctaLabel="See Investment Deals"
        ctaTo="/investment"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {recommendedDeals.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </SectionShell>

      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Latest Market Prices by City</p>
          <h2 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">
            City-level benchmarks buyers can read in seconds
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {marketInsights.map((market) => (
            <Card key={market.cityId} className="premium-card">
              <CardContent className="p-6">
                <p className="text-sm text-foreground/60">{market.city}</p>
                <p className="mt-2 text-3xl font-bold">${market.averagePricePerSqm}</p>
                <p className="mt-1 text-sm text-primary">{market.demandTrend}</p>
                <p className="mt-4 text-sm leading-7 text-foreground/72">{market.growthOutlook}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-6">
        <div className="section-shell px-6 py-10 md:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Why IraqProperty</p>
              <h2 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">
                Trust-first product design built for faster Iraqi buying decisions
              </h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "Verified Sellers", copy: "Start from who you can trust, not just what looks attractive." },
              { icon: ChartColumnBig, title: "Fair Price Estimate", copy: "Benchmark asking prices against local market reality." },
              { icon: Landmark, title: "Ownership Confidence", copy: "See when documents, legal checks, and verification are incomplete." },
              { icon: MapPinned, title: "Area Intelligence", copy: "Understand roads, hospitals, schools, and infrastructure before you visit." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="premium-card">
                  <CardContent className="p-6">
                    <div className="inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-4 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-2xl font-bold">{item.title}</h3>
                    <p className="mt-4 text-base leading-7 text-foreground/72">{item.copy}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="premium-card">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Popular property types</p>
              <div className="mt-6 grid gap-3">
                {propertyTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="font-medium">{type.labelEn}</span>
                    <span className="text-sm text-foreground/62">{type.labelAr}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">How buyers decide faster</p>
              <div className="mt-6 space-y-4">
                {[
                  "Check Fair Price Estimate before speaking to the seller.",
                  "Review ownership status to catch missing documents early.",
                  "Prioritize verified agencies when comparing similar listings.",
                  "Use dashboard favorites to compare price, area, and trust signals side by side.",
                ].map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Download app / join as agency</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-bold text-foreground md:text-5xl">
                Build your edge before the next buyer does.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground/72">
                Get mobile alerts for verified listings or join as an agency to unlock featured placements, trust upgrades, and stronger lead capture.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg" className="h-14 px-8 text-base">
                <Link to="/dashboard">
                  <Download className="h-4 w-4" />
                  Download App
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 border-slate-200 bg-white px-8 text-base">
                <Link to="/seller/dashboard">
                  <UserRoundPlus className="h-4 w-4" />
                  Join as Agency
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <WhatsAppCTA
        phoneNumber={featuredProperty.seller.whatsapp}
        listingId={featuredProperty.id}
        sellerId={featuredProperty.seller.id}
        city={featuredProperty.city.nameEn}
      />
      <StickyMobileContact
        listingId={featuredProperty.id}
        phoneNumber={featuredProperty.seller.phone}
        whatsappNumber={featuredProperty.seller.whatsapp}
        sellerId={featuredProperty.seller.id}
        city={featuredProperty.city.nameEn}
      />
    </div>
  );
}

function SectionShell({
  eyebrow,
  title,
  ctaLabel,
  ctaTo,
  children,
}: {
  eyebrow: string;
  title: string;
  ctaLabel: string;
  ctaTo: string;
  children: ReactNode;
}) {
  return (
    <section className="container mx-auto px-4 pb-6">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
          <h2 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">{title}</h2>
        </div>
        <Button asChild variant="outline" className="hidden border-slate-200 bg-white md:inline-flex">
          <Link to={ctaTo}>{ctaLabel}</Link>
        </Button>
      </div>
      {children}
    </section>
  );
}

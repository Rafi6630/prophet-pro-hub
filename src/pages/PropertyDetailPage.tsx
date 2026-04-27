import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Bath, BedDouble, Building2, Calendar1, CarFront, CircleAlert, Heart, MapPin, PlayCircle, Ruler, ShieldCheck } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import { propertyIntelligence } from "@/data/propertyIntelligence";
import { getAreaGrowthOutlook } from "@/lib/areaGrowth";
import { getFraudRiskLevel } from "@/lib/fraudRisk";
import { detectFraudRisk } from "@/lib/ai/fraudRisk";
import { publicProperties } from "@/data/sampleProperties";
import { enrichProperty } from "@/lib/propertyMetrics";
import { toggleFavorite } from "@/lib/favorites";
import { trackSaveLead } from "@/lib/leads";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwnershipStatus } from "@/components/OwnershipStatus";
import { StickyMobileContact } from "@/components/StickyMobileContact";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { FraudExplainerPanel } from "@/components/ai/FraudExplainerPanel";
import { AIDealCard } from "@/components/ai/AIDealCard";
import { MediaQualityScore } from "@/components/ai/MediaQualityScore";
import { useAuth } from "@/hooks/useAuth";

export function PropertyDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const property = useMemo(
    () => publicProperties.map(enrichProperty).find((item) => item.slug === slug),
    [slug]
  );
  const intelligence = property ? propertyIntelligence[property.id] : undefined;
  const areaGrowth = property ? getAreaGrowthOutlook(property.cityId, property.areaDemand) : undefined;
  const fraudRisk = property
    ? getFraudRiskLevel({
        hasMissingDocuments: property.hasMissingDocuments,
        sellerVerified: property.seller.verified,
        suspiciouslyLowPrice: property.suspiciouslyLowPrice,
        hasLegalIssues: property.hasLegalIssues,
      })
    : undefined;

  const detailedFraudResult = useMemo(() => {
    if (!property) return undefined;
    return detectFraudRisk({
      price: property.priceUsd,
      pricePerSqm: property.pricePerSqm,
      marketAverage: property.marketAverage,
      sellerVerified: property.seller.verified,
      sellerListingsCount: property.seller.listingsCount ?? 1,
      sellerAccountAge: property.seller.accountAgeDays ?? 30,
      hasAllDocuments: !property.hasMissingDocuments,
      imagesCount: (property.gallery?.length ?? 0) + 1,
      descriptionLength: property.description?.length ?? 0,
      phoneNumbers: [property.seller.phone].filter(Boolean),
      hasDuplicateImages: false,
      propertyType: property.propertyType?.labelEn ?? "",
      areaDemand: property.areaDemand,
      daysOnMarket: property.daysOnMarket ?? 0,
      priceHistory: property.priceHistory ?? [property.priceUsd],
      title: property.title,
      description: property.description ?? "",
    });
  }, [property]);

  const allImages = useMemo(() => {
    if (!property) return [];
    return [property.image, ...(property.gallery ?? [])].filter(Boolean);
  }, [property]);

  const [activeImage, setActiveImage] = useState(property?.image ?? "");

  useEffect(() => {
    setActiveImage(property?.image ?? "");
  }, [property]);

  if (!property) {
    return (
      <div className="container mx-auto px-4 pb-20 pt-28">
        <Card className="border-white/10 bg-card/70">
          <CardContent className="p-10">
            <h1 className="text-3xl font-bold">Property not found</h1>
            <p className="mt-4 text-foreground/70">The listing may be under review or no longer public.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-28 pt-28">
      <PageMeta title={`${property.title} | IraqProperty`} description={property.description} image={property.image} />
      <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-card/70">
            <img src={activeImage || property.image} alt={property.title} className="h-[460px] w-full object-cover" />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {[property.image, ...(property.gallery ?? [])].map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`overflow-hidden rounded-2xl border ${activeImage === image ? "border-primary" : "border-white/10"}`}
              >
                <img src={image} alt={property.title} className="h-24 w-full object-cover" />
              </button>
            ))}
          </div>
          {/* AI Media Quality Score */}
          <div className="mt-4">
            <MediaQualityScore
              imageUrls={allImages}
              hasDuplicateImages={false}
            />
          </div>

          {intelligence ? (
            <div className="mt-4 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950">
              <div className="aspect-video">
                <iframe
                  src={intelligence.videoUrl}
                  title={`${property.title} video`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-card/70">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                <VerifiedBadge variant={property.seller.verification} />
                {property.ownershipStatus === "verified" ? <VerifiedBadge variant="ownership" /> : null}
              </div>
              <h1 className="mt-5 text-4xl font-extrabold">{property.title}</h1>
              <p className="mt-2 text-lg text-primary/90">{property.titleAr}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-foreground/68">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{property.address}</span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-white/[0.03] p-4 md:grid-cols-4">
                <Metric icon={Building2} label="Type" value={property.propertyType.labelEn} />
                <Metric icon={Ruler} label="Size" value={`${property.sizeSqm} sqm`} />
                <Metric icon={BedDouble} label="Bedrooms" value={`${property.bedrooms}`} />
                <Metric icon={Bath} label="Bathrooms" value={`${property.bathrooms}`} />
                {intelligence ? <Metric icon={CarFront} label="Parking" value={`${intelligence.parking}`} /> : null}
                {intelligence ? <Metric icon={Calendar1} label="Property Age" value={`${intelligence.propertyAge} yrs`} /> : null}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-950/35 p-4">
                  <p className="text-sm text-foreground/60">Asking Price</p>
                  <p className="mt-2 text-3xl font-bold">${property.priceUsd.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/35 p-4">
                  <p className="text-sm text-foreground/60">Fair Price Estimate</p>
                  <p className="mt-2 text-3xl font-bold">${property.fairPrice.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <OwnershipStatus status={property.ownershipStatus} />
                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                  Investment Score {property.investmentScore}/100
                </div>
                <div className="rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-100">
                  Fraud Risk {fraudRisk?.riskLevel ?? property.riskLevel}
                </div>
              </div>

              <p className="mt-6 text-base leading-8 text-foreground/74">{property.description}</p>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5"
                  onClick={() => {
                    toggleFavorite(property.id);
                    trackSaveLead({
                      listingId: property.id,
                      sellerId: property.seller.id,
                      city: property.city.nameEn,
                      source: "property-detail",
                    });
                  }}
                >
                  <Heart className="h-4 w-4" />
                  Save
                </Button>
                <a
                  href={`tel:${property.seller.phone}`}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                >
                  Call Seller
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/70">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Trust and pricing</p>
              <div className="mt-6 space-y-4 text-sm text-foreground/72">
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <p>Price per sqm: <span className="font-semibold text-foreground">${property.pricePerSqm.toLocaleString()}</span></p>
                  <p className="mt-2">Market average: <span className="font-semibold text-foreground">${property.marketAverage.toLocaleString()}</span></p>
                  <p className="mt-2">Under / over priced: <span className="font-semibold text-foreground">{Math.round(((property.priceUsd - property.fairPrice) / property.fairPrice) * 100)}%</span></p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <p>Growth Outlook: <span className="font-semibold text-foreground">{areaGrowth?.demandTier}</span></p>
                  <p className="mt-2">Exit Liquidity Score: <span className="font-semibold text-foreground">{intelligence?.exitLiquidityScore ?? property.liquidity}</span></p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <p>Condition score: <span className="font-semibold text-foreground">{property.conditionScore}</span></p>
                  <p className="mt-2">Area demand: <span className="font-semibold text-foreground">{property.areaDemand}</span></p>
                </div>
                {intelligence ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                    <div className="flex items-center gap-2 font-semibold">
                      <PlayCircle className="h-4 w-4" />
                      Investor Summary
                    </div>
                    <p className="mt-3 leading-7">{intelligence.investorSummary}</p>
                  </div>
                ) : null}
                {property.reports.length ? (
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-amber-100">
                    <div className="flex items-center gap-2 font-semibold">
                      <CircleAlert className="h-4 w-4" />
                      Active moderation notes
                    </div>
                    <div className="mt-3 space-y-2">
                      {property.reports.map((report) => (
                        <p key={report.reason}>{report.reason} • {report.count} report(s)</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* AI Fraud Explainer Panel */}
          {detailedFraudResult && (
            <FraudExplainerPanel
              fraudResult={detailedFraudResult}
              pricePerSqm={property.pricePerSqm}
              marketAverage={property.marketAverage}
              priceUsd={property.priceUsd}
              fairPrice={property.fairPrice}
            />
          )}

          {/* AI Deal Analysis with PDF/Excel export */}
          <AIDealCard
            propertyId={property.id}
            isAuthed={!!user}
            onAuthRequired={() => {}}
            propertyTitle={property.title}
            propertyAddress={property.address}
          />

          <Card className="border-white/10 bg-card/70">
            <CardContent className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Listing details</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-foreground/66">
                    <Calendar1 className="h-4 w-4 text-primary" />
                    <span>Year built</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold">{property.yearBuilt}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-foreground/66">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Seller</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold">{property.seller.name}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {property.highlights.map((highlight) => (
                  <span key={highlight} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm">
                    {highlight}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
          {intelligence ? (
            <Card className="border-white/10 bg-card/70">
              <CardContent className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Area Intelligence</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <IntelligenceBlock title="Schools" items={intelligence.schools} />
                  <IntelligenceBlock title="Hospitals" items={intelligence.hospitals} />
                  <IntelligenceBlock title="Roads" items={intelligence.roads} />
                  <div className="rounded-2xl bg-white/[0.03] p-4 text-sm leading-7 text-foreground/72">
                    <p><span className="font-semibold text-foreground">Electricity:</span> {intelligence.electricity}</p>
                    <p><span className="font-semibold text-foreground">Water:</span> {intelligence.water}</p>
                    <p><span className="font-semibold text-foreground">Safety:</span> {intelligence.safety}</p>
                    <p><span className="font-semibold text-foreground">Legal Check:</span> {intelligence.legalCheckStatus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>

      <WhatsAppCTA
        phoneNumber={property.seller.whatsapp}
        listingId={property.id}
        sellerId={property.seller.id}
        city={property.city.nameEn}
        message={`Hello, I want more details about ${property.title} on IraqProperty.`}
      />
      <StickyMobileContact
        listingId={property.id}
        phoneNumber={property.seller.phone}
        whatsappNumber={property.seller.whatsapp}
        sellerId={property.seller.id}
        city={property.city.nameEn}
      />
    </div>
  );
}

function IntelligenceBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-4">
      <p className="font-semibold">{title}</p>
      <div className="mt-3 space-y-2 text-sm text-foreground/72">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-foreground/62">
        <Icon className="h-4 w-4 text-primary" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

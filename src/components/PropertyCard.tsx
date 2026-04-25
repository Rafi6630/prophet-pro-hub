import { useState } from "react";
import { Heart, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { propertyImage, type PropertyWithMedia } from "@/lib/property";
import { type EnrichedProperty } from "@/lib/propertyMetrics";
import { toggleFavorite } from "@/lib/favorites";
import { trackSaveLead } from "@/lib/leads";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwnershipStatus } from "@/components/OwnershipStatus";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyCardProps {
  property?: EnrichedProperty | PropertyWithMedia;
  p?: EnrichedProperty | PropertyWithMedia;
}

function isEnrichedProperty(property: EnrichedProperty | PropertyWithMedia): property is EnrichedProperty {
  return "priceUsd" in property;
}

function getOwnershipStatus(property: EnrichedProperty | PropertyWithMedia) {
  if (isEnrichedProperty(property)) {
    return property.ownershipStatus;
  }

  if (property.legal_status === "disputed") {
    return "legal-risk" as const;
  }

  return property.ownership_reviewed ? "verified" as const : "pending" as const;
}

export function PropertyCard({ property, p }: PropertyCardProps) {
  const data = property ?? p;
  const [favoriteCount, setFavoriteCount] = useState(0);

  if (!data) return null;

  const image = isEnrichedProperty(data) ? data.image : propertyImage(data);
  const title = data.title;
  const titleAr = isEnrichedProperty(data) ? data.titleAr : data.title_ar;
  const cityLabel = isEnrichedProperty(data) ? data.city.nameEn : data.city;
  const citySecondary = isEnrichedProperty(data) ? data.city.nameAr : data.district;
  const area = isEnrichedProperty(data) ? data.area : data.district ?? data.city;
  const price = isEnrichedProperty(data) ? data.priceUsd : data.price;
  const fairPrice = isEnrichedProperty(data)
    ? data.fairPrice
    : data.fair_price_estimate ?? Math.round(data.price * 1.05);
  const propertyType = isEnrichedProperty(data) ? data.propertyType.labelEn : data.property_kind;
  const sizeSqm = isEnrichedProperty(data) ? data.sizeSqm : data.area_m2;
  const investmentScore = isEnrichedProperty(data) ? data.investmentScore : data.investment_score ?? 0;
  const riskLevel = isEnrichedProperty(data) ? data.riskLevel : data.fraud_risk ?? "medium";
  const description = isEnrichedProperty(data) ? data.description : data.description_ar ?? data.description ?? "";
  const ownershipStatus = getOwnershipStatus(data);
  const sellerId = isEnrichedProperty(data) ? data.seller.id : data.seller?.user_id;
  const sellerVerification = isEnrichedProperty(data) ? data.seller.verification : null;

  return (
    <Card className="overflow-hidden border-white/10 bg-card/70">
      <div className="relative">
        <img src={image} alt={title} className="h-64 w-full object-cover" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {sellerVerification ? <VerifiedBadge variant={sellerVerification} /> : null}
          {ownershipStatus === "verified" ? <VerifiedBadge variant="ownership" /> : null}
        </div>
        <button
          type="button"
          className="absolute right-4 top-4 rounded-full bg-slate-950/70 p-2 text-white backdrop-blur"
          onClick={() => {
            toggleFavorite(data.id);
            trackSaveLead({
              listingId: data.id,
              sellerId,
              city: cityLabel,
              source: "property-card",
            });
            setFavoriteCount((count) => count + 1);
          }}
          aria-label="Save property"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-foreground/62">{citySecondary ?? cityLabel}</p>
            <h3 className="mt-1 text-2xl font-bold">{title}</h3>
            {titleAr ? <p className="mt-2 text-sm text-foreground/68">{titleAr}</p> : null}
          </div>
          <div className="rounded-2xl bg-primary/10 px-3 py-2 text-center text-primary">
            <p className="text-xs uppercase tracking-[0.18em]">Score</p>
            <p className="text-xl font-bold">{investmentScore}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-foreground/68">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{area}, {cityLabel}</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-white/[0.03] p-4 text-sm">
          <div>
            <p className="text-foreground/62">Asking Price</p>
            <p className="mt-1 text-lg font-bold">${price.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-foreground/62">Fair Price Estimate</p>
            <p className="mt-1 text-lg font-bold">${fairPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-foreground/62">Type</p>
            <p className="mt-1 font-semibold capitalize">{propertyType}</p>
          </div>
          <div>
            <p className="text-foreground/62">Size</p>
            <p className="mt-1 font-semibold">{sizeSqm} sqm</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <OwnershipStatus status={ownershipStatus} />
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-foreground/72">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Risk {riskLevel}
          </div>
          {favoriteCount > 0 ? (
            <div className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-foreground/70">
              Saved {favoriteCount}x this session
            </div>
          ) : null}
        </div>

        <p className="mt-5 text-sm leading-7 text-foreground/74">{description}</p>

        <div className="mt-6 flex gap-3">
          <Button asChild className="flex-1">
            <Link to={`/property/${data.id}`}>View Property</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 border-white/10 bg-white/5">
            <Link to="/map">View on Map</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden border-white/10 bg-card/70">
      <Skeleton className="h-64 w-full" />
      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

export default PropertyCard;

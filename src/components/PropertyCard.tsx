import { useState } from "react";
import { Heart, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { type EnrichedProperty } from "@/lib/propertyMetrics";
import { toggleFavorite } from "@/lib/favorites";
import { trackSaveLead } from "@/lib/leads";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwnershipStatus } from "@/components/OwnershipStatus";
import { VerifiedBadge } from "@/components/VerifiedBadge";

interface PropertyCardProps {
  property: EnrichedProperty;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [favoriteCount, setFavoriteCount] = useState(0);

  return (
    <Card className="overflow-hidden border-white/10 bg-card/70">
      <div className="relative">
        <img src={property.image} alt={property.title} className="h-64 w-full object-cover" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <VerifiedBadge variant={property.seller.verification} />
          {property.ownershipStatus === "verified" ? <VerifiedBadge variant="ownership" /> : null}
        </div>
        <button
          type="button"
          className="absolute right-4 top-4 rounded-full bg-slate-950/70 p-2 text-white backdrop-blur"
          onClick={() => {
            toggleFavorite(property.id);
            trackSaveLead({
              listingId: property.id,
              sellerId: property.seller.id,
              city: property.city.nameEn,
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
            <p className="text-sm text-foreground/62">{property.city.nameAr}</p>
            <h3 className="mt-1 text-2xl font-bold">{property.title}</h3>
            <p className="mt-2 text-sm text-foreground/68">{property.titleAr}</p>
          </div>
          <div className="rounded-2xl bg-primary/10 px-3 py-2 text-center text-primary">
            <p className="text-xs uppercase tracking-[0.18em]">Score</p>
            <p className="text-xl font-bold">{property.investmentScore}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm text-foreground/68">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{property.area}, {property.city.nameEn}</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-white/[0.03] p-4 text-sm">
          <div>
            <p className="text-foreground/62">Asking Price</p>
            <p className="mt-1 text-lg font-bold">${property.priceUsd.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-foreground/62">Fair Price Estimate</p>
            <p className="mt-1 text-lg font-bold">${property.fairPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-foreground/62">Type</p>
            <p className="mt-1 font-semibold">{property.propertyType.labelEn}</p>
          </div>
          <div>
            <p className="text-foreground/62">Size</p>
            <p className="mt-1 font-semibold">{property.sizeSqm} sqm</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <OwnershipStatus status={property.ownershipStatus} />
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-foreground/72">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Risk {property.riskLevel}
          </div>
          {favoriteCount > 0 ? (
            <div className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-foreground/70">
              Saved {favoriteCount}x this session
            </div>
          ) : null}
        </div>

        <p className="mt-5 text-sm leading-7 text-foreground/74">{property.description}</p>

        <div className="mt-6 flex gap-3">
          <Button asChild className="flex-1">
            <Link to={`/property/${property.slug}`}>View Property</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 border-white/10 bg-white/5">
            <Link to="/map-search">View on Map</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { useMemo, useState } from "react";
import { Heart, MapPin, MessageCircle, BedDouble, Bath, Maximize } from "lucide-react";
import { Link } from "react-router-dom";
import { propertyImage, type PropertyWithMedia } from "@/lib/property";
import { type EnrichedProperty } from "@/lib/propertyMetrics";
import { toggleFavorite } from "@/lib/favorites";
import { trackSaveLead, trackWhatsAppLead } from "@/lib/leads";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TrustBadge from "@/components/TrustBadge";
import InvestmentScoreRing from "@/components/InvestmentScoreRing";
import CompareButton from "@/components/CompareButton";

interface PropertyCardProps {
  property?: EnrichedProperty | PropertyWithMedia;
  p?: EnrichedProperty | PropertyWithMedia;
}

function isEnrichedProperty(property: EnrichedProperty | PropertyWithMedia): property is EnrichedProperty {
  return "priceUsd" in property;
}

export function PropertyCard({ property, p }: PropertyCardProps) {
  const data = property ?? p;
  const [savedPulse, setSavedPulse] = useState(false);

  const normalized = useMemo(() => {
    if (!data) return null;

    const sellerPhone = isEnrichedProperty(data) ? data.seller.phone : data.seller?.phone ?? null;
    const sellerWhatsapp = isEnrichedProperty(data) ? data.seller.whatsapp : data.seller?.whatsapp ?? null;
    const sellerId = isEnrichedProperty(data) ? data.seller.id : data.seller?.user_id;
    const investmentScore = isEnrichedProperty(data) ? data.investmentScore : data.investment_score ?? 72;
    const verifiedSeller = isEnrichedProperty(data)
      ? data.seller.verified
      : ["verified", "premium"].includes(data.verification_level);
    const ownershipReviewed = isEnrichedProperty(data) ? data.ownershipStatus === "verified" : data.ownership_reviewed;
    const legalChecked = isEnrichedProperty(data) ? !data.hasLegalIssues : (data.legal_status ?? "clear") !== "disputed";
    const lowRisk = isEnrichedProperty(data) ? data.riskLevel === "low" : (data.fraud_risk ?? "medium") === "low";

    return {
      id: data.id,
      href: `/property/${data.id}`,
      image: isEnrichedProperty(data) ? data.image : propertyImage(data),
      title: data.title,
      titleAr: isEnrichedProperty(data) ? data.titleAr : data.title_ar,
      city: isEnrichedProperty(data) ? data.city.nameEn : data.city,
      district: isEnrichedProperty(data) ? data.area : data.district ?? data.city,
      price: isEnrichedProperty(data) ? data.priceUsd : data.price,
      size: isEnrichedProperty(data) ? data.sizeSqm : data.area_m2,
      bedrooms: isEnrichedProperty(data) ? data.bedrooms : data.bedrooms,
      bathrooms: isEnrichedProperty(data) ? data.bathrooms : data.bathrooms,
      investmentScore,
      verifiedSeller,
      ownershipReviewed,
      legalChecked,
      lowRisk,
      sellerPhone,
      sellerWhatsapp,
      sellerId,
    };
  }, [data]);

  if (!normalized) return null;

  const whatsappLink = normalized.sellerWhatsapp ? `https://wa.me/${normalized.sellerWhatsapp.replace(/\D/g, "")}` : null;

  return (
    <Card className="group card-spotlight overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-card/95 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
      <div className="relative overflow-hidden">
        <img src={normalized.image} alt={normalized.title} className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/60 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {normalized.verifiedSeller ? <TrustBadge variant="verified-seller" /> : null}
          {normalized.ownershipReviewed ? <TrustBadge variant="ownership-reviewed" /> : null}
        </div>
        <button
          type="button"
          className={`absolute right-4 top-4 rounded-full border border-white/10 bg-slate-950/70 p-2 text-white backdrop-blur transition ${
            savedPulse ? "scale-110 bg-destructive text-white" : ""
          }`}
          onClick={() => {
            toggleFavorite(normalized.id);
            trackSaveLead({
              listingId: normalized.id,
              sellerId: normalized.sellerId,
              city: normalized.city,
              source: "property-card",
            });
            setSavedPulse(true);
            window.setTimeout(() => setSavedPulse(false), 380);
          }}
          aria-label="Save property"
        >
          <Heart className={`h-4 w-4 ${savedPulse ? "fill-current" : ""}`} />
        </button>
      </div>

      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-foreground/58">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{normalized.district}, {normalized.city}</span>
            </div>
            <h3 className="mt-2 line-clamp-2 text-[1.4rem] font-extrabold leading-tight tracking-tight">
              {normalized.titleAr || normalized.title}
            </h3>
            <div className="mt-3 text-3xl font-extrabold text-slate-950">${normalized.price.toLocaleString()}</div>
          </div>
          <InvestmentScoreRing score={normalized.investmentScore} size={70} strokeWidth={6} className="shrink-0" />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 rounded-[1.4rem] border border-slate-200/80 bg-slate-50/90 p-4 text-center text-sm">
          <div>
            <Maximize className="mx-auto h-4 w-4 text-primary" />
            <div className="mt-2 font-bold">{normalized.size}</div>
            <div className="text-xs text-muted-foreground">sqm</div>
          </div>
          <div>
            <BedDouble className="mx-auto h-4 w-4 text-primary" />
            <div className="mt-2 font-bold">{normalized.bedrooms}</div>
            <div className="text-xs text-muted-foreground">rooms</div>
          </div>
          <div>
            <Bath className="mx-auto h-4 w-4 text-primary" />
            <div className="mt-2 font-bold">{normalized.bathrooms}</div>
            <div className="text-xs text-muted-foreground">baths</div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {normalized.legalChecked ? <TrustBadge variant="legal-checked" /> : null}
          {normalized.lowRisk ? <TrustBadge variant="low-risk" /> : null}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener"
              onClick={() =>
                trackWhatsAppLead({
                  listingId: normalized.id,
                  sellerId: normalized.sellerId,
                  city: normalized.city,
                  source: "property-card",
                })
              }
            >
              <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </a>
          ) : (
            <Button className="w-full rounded-xl" disabled>
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          )}
          <Button asChild variant="outline" className="w-full rounded-xl border-slate-200 bg-white">
            <Link to={normalized.href}>View Details</Link>
          </Button>
        </div>

        <div className="mt-3 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl border-slate-200 bg-white"
            onClick={() => {
              toggleFavorite(normalized.id);
              setSavedPulse(true);
              window.setTimeout(() => setSavedPulse(false), 380);
            }}
          >
            <Heart className={`h-4 w-4 ${savedPulse ? "fill-destructive text-destructive" : ""}`} />
            Save
          </Button>
          <div className="flex-1">
            <CompareButton propertyId={normalized.id} />
          </div>
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
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export default PropertyCard;

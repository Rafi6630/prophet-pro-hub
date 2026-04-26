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
    <Card className="group card-spotlight overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-[0_6px_24px_rgba(15,23,42,0.06)] sm:rounded-[1.5rem]">
      <Link to={normalized.href} className="block">
        <div className="relative overflow-hidden">
          <img
            src={normalized.image}
            alt={normalized.title}
            loading="lazy"
            className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.04] sm:h-56 lg:h-60"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/55 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 sm:left-4 sm:top-4 sm:gap-2">
            {normalized.verifiedSeller ? <TrustBadge variant="verified-seller" /> : null}
            {normalized.ownershipReviewed ? <TrustBadge variant="ownership-reviewed" /> : null}
          </div>
          <button
            type="button"
            className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-slate-950/65 text-white backdrop-blur transition active:scale-95 sm:right-4 sm:top-4 ${
              savedPulse ? "scale-110 bg-destructive" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
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
          <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-2.5 py-1 text-sm font-extrabold text-slate-950 shadow sm:hidden">
            ${normalized.price.toLocaleString()}
          </div>
        </div>
      </Link>

      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-foreground/60 sm:text-sm">
              <MapPin className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
              <span className="truncate">{normalized.district}, {normalized.city}</span>
            </div>
            <Link to={normalized.href}>
              <h3 className="mt-1.5 line-clamp-2 text-base font-extrabold leading-tight tracking-tight hover:text-primary sm:text-lg lg:text-xl">
                {normalized.titleAr || normalized.title}
              </h3>
            </Link>
            <div className="mt-2 hidden text-2xl font-extrabold text-slate-950 sm:block lg:text-[1.6rem]">
              ${normalized.price.toLocaleString()}
            </div>
          </div>
          <InvestmentScoreRing score={normalized.investmentScore} size={56} strokeWidth={5} className="shrink-0 sm:hidden" />
          <InvestmentScoreRing score={normalized.investmentScore} size={68} strokeWidth={6} className="hidden shrink-0 sm:block" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 text-center text-xs sm:gap-3 sm:rounded-2xl sm:p-3 sm:text-sm">
          <div>
            <Maximize className="mx-auto h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
            <div className="mt-1 font-bold sm:mt-1.5">{normalized.size}</div>
            <div className="text-[10px] text-muted-foreground sm:text-xs">m²</div>
          </div>
          <div>
            <BedDouble className="mx-auto h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
            <div className="mt-1 font-bold sm:mt-1.5">{normalized.bedrooms}</div>
            <div className="text-[10px] text-muted-foreground sm:text-xs">rooms</div>
          </div>
          <div>
            <Bath className="mx-auto h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
            <div className="mt-1 font-bold sm:mt-1.5">{normalized.bathrooms}</div>
            <div className="text-[10px] text-muted-foreground sm:text-xs">baths</div>
          </div>
        </div>

        {(normalized.legalChecked || normalized.lowRisk) && (
          <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
            {normalized.legalChecked ? <TrustBadge variant="legal-checked" /> : null}
            {normalized.lowRisk ? <TrustBadge variant="low-risk" /> : null}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
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
              <Button size="sm" className="w-full rounded-lg bg-emerald-600 text-xs hover:bg-emerald-700 sm:rounded-xl sm:text-sm">
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                WhatsApp
              </Button>
            </a>
          ) : (
            <Button size="sm" className="w-full rounded-lg text-xs sm:rounded-xl sm:text-sm" disabled>
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              WhatsApp
            </Button>
          )}
          <Button asChild size="sm" variant="outline" className="w-full rounded-lg border-slate-200 bg-white text-xs sm:rounded-xl sm:text-sm">
            <Link to={normalized.href}>View Details</Link>
          </Button>
        </div>

        <div className="mt-2 hidden gap-2 sm:flex">
          <CompareButton propertyId={normalized.id} />
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

import * as React from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Bed, Bath, Maximize, BadgeCheck, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import TerraScore from "./TerraScore";
import type { DbProperty } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { useToggleFavorite } from "@/hooks/useFavorites";
import property1 from "@/assets/property-1.jpg";

const PropertyCard = React.forwardRef<HTMLAnchorElement, { property: DbProperty }>(
  ({ property }, ref) => {
    const { t, i18n } = useTranslation();
    const { toast }   = useToast();
    const [liked, setLiked] = React.useState(false);
    const toggleFav = useToggleFavorite();
    const isRTL = i18n.dir() === "rtl";

    const image = property.property_images?.length
      ? property.property_images[0].url
      : property1;

    const discountPct = property.ai_valuation && property.ai_valuation > property.price
      ? Math.round(((property.ai_valuation - property.price) / property.ai_valuation) * 100)
      : null;

    return (
      <Link
        ref={ref}
        to={`/property/${property.id}`}
        className="group block rounded-2xl overflow-hidden bg-card border border-border
          shadow-card hover:shadow-elevated hover:border-primary/25
          transition-all duration-300 ease-out card-hover"
      >
        {/* ── Image ── */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Multi-stop gradient overlay — stronger at bottom for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Top badges (start side) */}
          <div className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} flex flex-wrap gap-1.5`}>
            {property.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                bg-primary/90 text-primary-foreground text-[10px] font-semibold
                shadow-sm backdrop-blur-sm">
                <BadgeCheck className="w-2.5 h-2.5" />
                {t("property.verified")}
              </span>
            )}
            <span className="px-2 py-1 rounded-lg bg-black/40 text-white text-[10px] font-medium capitalize backdrop-blur-sm border border-white/10">
              {t(`property.type${property.type.charAt(0).toUpperCase() + property.type.slice(1)}`, property.type)}
            </span>
          </div>

          {/* Discount badge — top center if available */}
          {discountPct && discountPct >= 5 && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                bg-success/90 text-white text-[10px] font-bold backdrop-blur-sm shadow-sm">
                <TrendingUp className="w-2.5 h-2.5" />
                -{discountPct}%
              </span>
            </div>
          )}

          {/* Favorite button (end side) */}
          <button
            className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} w-9 h-9 rounded-full
              backdrop-blur-md transition-all duration-200 active:scale-90 flex items-center justify-center
              border border-white/15 ${
                liked
                  ? "bg-rose-500/85 text-white shadow-sm"
                  : "bg-black/35 text-white/80 hover:bg-black/55 hover:text-white"
              }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLiked(!liked);
              toggleFav.mutate(property.id);
              toast({
                title: liked
                  ? t("property.removedFromFavorites")
                  : t("property.addedToFavorites"),
                description: property.title,
              });
            }}
            aria-label={liked ? t("property.removedFromFavorites") : t("property.addedToFavorites")}
          >
            <Heart className={`w-4 h-4 transition-transform ${liked ? "fill-current scale-110" : ""}`} />
          </button>

          {/* Bottom row: price + TerraScore */}
          <div className="absolute bottom-0 inset-x-0 px-3.5 pb-3 pt-8
            bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xl font-bold text-white leading-tight drop-shadow-sm">
                  ${property.price.toLocaleString()}
                </p>
                {property.price_iqd && (
                  <p className="text-[11px] text-white/65 font-medium mt-0.5">
                    IQD {property.price_iqd.toLocaleString()}
                  </p>
                )}
              </div>
              <TerraScore score={property.terra_score} size="sm" showLabel={false} />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-4">
          {/* Title */}
          <h3
            dir="auto"
            className="font-semibold text-foreground group-hover:text-primary transition-colors
              leading-snug line-clamp-1 text-[15px]"
          >
            {property.title}
          </h3>

          {/* Location */}
          <p className="flex items-center gap-1.5 mt-1.5 text-[13px] text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0 text-muted-foreground/70" />
            <span className="truncate">
              {[property.district, property.city].filter(Boolean).join(", ")}
            </span>
          </p>

          {/* Specs row */}
          <div className="flex items-center gap-3 mt-3.5 pt-3 border-t border-border/60
            text-[12px] text-muted-foreground">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1.5 font-medium">
                <Bed className="w-3.5 h-3.5 text-muted-foreground/60" />
                {property.bedrooms}
              </span>
            )}
            <span className="flex items-center gap-1.5 font-medium">
              <Bath className="w-3.5 h-3.5 text-muted-foreground/60" />
              {property.bathrooms}
            </span>
            <span className="flex items-center gap-1.5 font-medium ms-auto">
              <Maximize className="w-3.5 h-3.5 text-muted-foreground/60" />
              {property.area.toLocaleString()} m²
            </span>
          </div>
        </div>
      </Link>
    );
  }
);

PropertyCard.displayName = "PropertyCard";
export default PropertyCard;

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, MapPin, BedDouble, Bath, Maximize, ShieldCheck, TrendingUp } from "lucide-react";
import {
  type PropertyWithMedia, propertyImage, pricePerM2,
  formatPrice, investmentScore, discountToFair, priceVerdict,
} from "@/lib/property";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";

export default function PropertyCard({ p }: { p: PropertyWithMedia }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const fav = user ? isFavorite(p.id) : false;
  const score = investmentScore(p);
  const verdict = priceVerdict(p);
  const disc = discountToFair(p);

  return (
    <Link
      to={`/property/${p.id}`}
      className="block group bg-card rounded-2xl overflow-hidden shadow-card card-hover border border-border"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={propertyImage(p)}
          alt={p.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Top badges */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5">
          {p.verification_level === "verified" || p.verification_level === "premium" ? (
            <span className="trust-badge bg-card/95 backdrop-blur">
              <ShieldCheck className="w-3 h-3" />
              {t("property.verified")}
            </span>
          ) : null}
          {p.investment_deal && (
            <span className="gold-badge bg-card/95 backdrop-blur">
              <TrendingUp className="w-3 h-3" />
              {t("property.investmentDeal")}
            </span>
          )}
        </div>

        {user && (
          <button
            onClick={(e) => { e.preventDefault(); toggle(p.id); }}
            className="absolute top-3 end-3 w-9 h-9 rounded-full bg-card/95 backdrop-blur grid place-items-center hover:scale-110 transition shadow-soft"
            aria-label={t("property.actions.save")}
          >
            <Heart className={`w-4 h-4 ${fav ? "fill-destructive text-destructive" : "text-foreground"}`} />
          </button>
        )}

        {/* Bottom price strip */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/75 to-transparent">
          <div className="flex items-end justify-between gap-2">
            <div className="text-white">
              <div className="text-xl font-extrabold leading-none">{formatPrice(p.price)}</div>
              <div className="text-[11px] opacity-80 mt-1">${pricePerM2(p)} {t("common.perM2")}</div>
            </div>
            {verdict === "under" && (
              <span className="text-[11px] font-bold bg-trust text-trust-foreground px-2 py-1 rounded-full">
                −{Math.round(disc)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-base line-clamp-1">{p.title_ar || p.title}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{p.district ? `${p.district}، ` : ""}{p.city}</span>
        </div>

        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          {p.bedrooms > 0 && (
            <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{p.bedrooms}</span>
          )}
          {p.bathrooms > 0 && (
            <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{p.bathrooms}</span>
          )}
          <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" />{p.area_m2} {t("common.m2")}</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-[11px] text-muted-foreground font-medium">{t("property.investmentScore")}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-gradient-gold"
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-xs font-bold tabular-nums">{score}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 skeleton" />
        <div className="h-3 w-1/2 skeleton" />
        <div className="h-3 w-2/3 skeleton" />
      </div>
    </div>
  );
}

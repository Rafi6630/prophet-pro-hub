import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import type { PropertyWithMedia } from "@/lib/property";
import { propertyImage, formatPrice } from "@/lib/property";
import { Button } from "@/components/ui/button";
import InvestmentScoreRing from "@/components/InvestmentScoreRing";

export function FeaturedPropertyCard({ property }: { property: PropertyWithMedia }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_32px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(15,23,42,0.10)] sm:rounded-[2rem]">
      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.9fr]">
        <div className="relative">
          <img
            src={propertyImage(property)}
            alt={property.title}
            loading="lazy"
            className="h-56 w-full object-cover sm:h-72 lg:h-full lg:min-h-[340px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
            <div className="inline-flex rounded-full border border-white/15 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur sm:px-3 sm:py-1.5 sm:text-xs">
              Featured opportunity
            </div>
            <h3 className="mt-2 text-xl font-extrabold leading-tight text-white sm:mt-3 sm:text-2xl lg:text-3xl">
              {property.title_ar || property.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-white/85 sm:mt-2 sm:text-sm">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {property.district ? `${property.district}, ` : ""}{property.city}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-5 p-5 sm:p-6 lg:gap-6">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-xs">Fair Price Estimate</div>
            <div className="mt-1.5 text-3xl font-extrabold sm:text-4xl">{formatPrice(property.fair_price_estimate ?? Math.round(property.price * 1.05))}</div>
            <div className="mt-2.5 text-sm leading-6 text-muted-foreground sm:leading-7">
              Decision-ready pricing, trust context, and neighborhood demand signals in one premium card.
            </div>
            <div className="mt-5 flex items-center gap-4">
              <InvestmentScoreRing score={property.investment_score ?? 72} />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Investment Score</p>
                <p className="text-muted-foreground">AI-evaluated demand & ROI</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-4 sm:gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">Asking Price</div>
              <div className="mt-0.5 truncate text-xl font-extrabold sm:text-2xl">{formatPrice(property.price)}</div>
            </div>
            <Button asChild className="shrink-0 rounded-xl sm:rounded-2xl">
              <Link to={`/property/${property.id}`}>
                <span className="hidden sm:inline">View Property</span>
                <span className="sm:hidden">View</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturedPropertyCard;

import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import type { PropertyWithMedia } from "@/lib/property";
import { propertyImage, formatPrice } from "@/lib/property";
import { Button } from "@/components/ui/button";
import InvestmentScoreRing from "@/components/InvestmentScoreRing";

export function FeaturedPropertyCard({ property }: { property: PropertyWithMedia }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative">
          <img src={propertyImage(property)} alt={property.title} className="h-full min-h-[320px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              Featured opportunity
            </div>
            <h3 className="mt-3 text-3xl font-extrabold text-white">{property.title_ar || property.title}</h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
              <MapPin className="h-4 w-4" />
              {property.district ? `${property.district}, ` : ""}{property.city}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between p-6">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Fair Price Estimate</div>
            <div className="mt-2 text-4xl font-extrabold">{formatPrice(property.fair_price_estimate ?? Math.round(property.price * 1.05))}</div>
            <div className="mt-3 text-sm leading-7 text-muted-foreground">
              Decision-ready pricing, trust context, and neighborhood demand signals in one premium card.
            </div>
            <div className="mt-6">
              <InvestmentScoreRing score={property.investment_score ?? 72} />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Asking Price</div>
              <div className="mt-1 text-2xl font-extrabold">{formatPrice(property.price)}</div>
            </div>
            <Button asChild className="rounded-2xl">
              <Link to={`/property/${property.id}`}>
                View Property
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

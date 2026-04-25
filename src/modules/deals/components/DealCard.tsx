import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TrendingUp, Shield, AlertTriangle, MapPin } from "lucide-react";
import type { Deal } from "@/core/types/deal";
import DecisionChip from "./DecisionChip";

interface Props {
  deal: Deal;
}

export default function DealCard({ deal }: Props) {
  const { t } = useTranslation();
  const { property, ai_analysis } = deal;

  const riskIcon =
    deal.risk_level === "Low" ? (
      <Shield className="w-3 h-3 text-success" />
    ) : deal.risk_level === "High" || deal.risk_level === "Very High" ? (
      <AlertTriangle className="w-3 h-3 text-destructive" />
    ) : (
      <TrendingUp className="w-3 h-3 text-warning" />
    );

  const riskKey = `deals.risk${deal.risk_level.replace(" ", "")}` as const;

  return (
    <Link
      to={`/investor/deals/${deal.id}`}
      className="group rounded-2xl bg-card border border-border overflow-hidden
        hover:border-primary/30 hover:shadow-lg transition-all block"
    >
      {/* Image area */}
      <div className="relative h-44 bg-muted overflow-hidden">
        {property?.images[0] ? (
          <img
            src={property.images[0].url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            {t("common.noImage")}
          </div>
        )}

        {/* Grade badge — top left */}
        <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-background/90 backdrop-blur
          flex items-center justify-center shadow border border-border/50">
          <span className="text-sm font-bold leading-none">{deal.deal_grade}</span>
        </div>

        {/* Decision chip — top right */}
        {ai_analysis && (
          <div className="absolute top-3 right-3">
            <DecisionChip decision={ai_analysis.decision} size="sm" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-2.5">
        {/* Title */}
        <div>
          <p dir="auto" className="font-semibold text-sm line-clamp-1 text-foreground">
            {property?.title ?? t("common.untitled")}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" />
            {property?.district}, {property?.city}
          </p>
        </div>

        {/* Price + discount */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">
            ${property?.price.toLocaleString()}
          </span>
          {deal.discount_to_market > 0 && (
            <span className="text-xs font-medium text-success bg-success/10 px-1.5 py-0.5 rounded-full">
              -{deal.discount_to_market.toFixed(0)}%
            </span>
          )}
        </div>

        {/* ROI + risk */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-primary" />
            {t("deals.roi3yr", { value: Math.round(deal.expected_roi) })}
          </span>
          <span className="flex items-center gap-1">
            {riskIcon}
            {t(riskKey)}
          </span>
        </div>

        {/* AI thesis snippet */}
        {ai_analysis?.deal_thesis && (
          <p dir="auto" className="text-xs text-muted-foreground line-clamp-2 border-t border-border pt-2">
            {ai_analysis.deal_thesis}
          </p>
        )}
      </div>
    </Link>
  );
}

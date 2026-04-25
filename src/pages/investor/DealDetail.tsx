import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Loader2, ArrowLeft, CheckCircle2, AlertTriangle, DollarSign, TrendingUp,
  XCircle, MessageSquare, FileText,
} from "lucide-react";
import { useDeal } from "@/modules/deals/hooks/useDeals";
import { useAIAnalysis } from "@/modules/deals/hooks/useAIAnalysis";
import DecisionChip from "@/modules/deals/components/DecisionChip";
import { DealStatusStepper } from "@/modules/deals/components/DealStatusStepper";
import { useAdvanceDealStatus } from "@/modules/deals/hooks/useDeals";

export default function DealDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const { data: deal, isLoading: dealLoading } = useDeal(id!);
  const { data: freshAI, isLoading: aiLoading } = useAIAnalysis(deal?.property);
  const { mutate: advance } = useAdvanceDealStatus(id!);

  // Prefer freshly-fetched AI; fall back to persisted analysis on the deal row
  const ai = freshAI ?? deal?.ai_analysis;

  // Mark as VIEWED on mount (if still NEW)
  if (deal?.status === "NEW") {
    advance({ toStatus: "VIEWED" });
  }

  if (dealLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{t("common.notFound")}</p>
        <Link to="/investor/deals" className="text-primary text-sm hover:underline mt-2 inline-block">
          ← {t("deals.backToList")}
        </Link>
      </div>
    );
  }

  const property = deal.property;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Back */}
      <Link to="/investor/deals"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t("deals.backToList")}
      </Link>

      {/* Hero */}
      {property?.images[0] && (
        <div className="rounded-2xl overflow-hidden h-56 sm:h-72">
          <img src={property.images[0].url} alt={property.title}
            className="w-full h-full object-cover" />
        </div>
      )}

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <p dir="auto" className="text-2xl font-bold text-foreground">{property?.title}</p>
          <p className="text-muted-foreground text-sm mt-0.5">
            {property?.district}, {property?.city} · {property?.propertyType} · {property?.area} m²
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {ai && <DecisionChip decision={ai.decision} />}
          <span className="text-xl font-bold">${property?.price.toLocaleString()}</span>
        </div>
      </div>

      {/* Status pipeline */}
      <DealStatusStepper deal={deal} />

      {/* AI Verdict */}
      {ai && (
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 space-y-5">
          {/* Score header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-2xl font-black text-primary">{ai.score}</span>
            </div>
            <div>
              <p className="font-bold text-lg">{t("deals.aiVerdict")}</p>
              <p className="text-sm text-muted-foreground">
                {t(`deals.confidence${ai.confidence.charAt(0).toUpperCase() + ai.confidence.slice(1)}`)}
                {" · "}
                {t("deals.modelVersion", { v: ai.model_version })}
              </p>
            </div>
          </div>

          {/* Financial KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t("deals.suggestedPrice"), value: `$${ai.suggested_price.toLocaleString()}`, icon: DollarSign   },
              { label: t("deals.expectedProfit"), value: `$${ai.expected_profit.toLocaleString()}`, icon: TrendingUp   },
              { label: t("deals.roi3yrLabel"),    value: `${ai.expected_roi_pct.toFixed(0)}%`,      icon: TrendingUp   },
              { label: t("deals.rentalYield"),    value: `${ai.rental_yield.toFixed(1)}%`,          icon: CheckCircle2 },
            ].map(kpi => (
              <div key={kpi.label}
                className="rounded-xl bg-background border border-border p-3 space-y-1">
                <kpi.icon className="w-4 h-4 text-primary" />
                <p className="text-lg font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Thesis */}
          <p dir="auto"
            className="text-sm text-muted-foreground italic border-t border-border/50 pt-4">
            "{ai.deal_thesis}"
          </p>
        </div>
      )}

      {/* Reasons + Risks */}
      {ai && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Reasons */}
          <div className="rounded-xl border border-success/20 bg-success/5 p-4 space-y-3">
            <h3 className="font-semibold text-success flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {t("deals.reasons")}
            </h3>
            <ul className="space-y-2">
              {ai.reasons.map((r, i) => (
                <li key={i} dir="auto" className="text-sm flex gap-2">
                  <span className="text-success shrink-0 mt-0.5">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
            <h3 className="font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {t("deals.risks")}
            </h3>
            <ul className="space-y-2">
              {ai.risks.map((r, i) => (
                <li key={i} dir="auto" className="text-sm flex gap-2">
                  <span className="text-destructive shrink-0 mt-0.5">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* AI loading indicator */}
      {aiLoading && !deal.ai_analysis && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/30 rounded-xl p-4">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          {t("deals.generatingAnalysis")}
        </div>
      )}

      {/* Action footer */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          to={`/buyer/messages`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border
            bg-card text-sm font-medium hover:border-primary/40 transition-colors"
        >
          <MessageSquare className="w-4 h-4" /> {t("deals.contactAgent")}
        </Link>
        <Link
          to={`/buyer/properties/${deal.property_id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border
            bg-card text-sm font-medium hover:border-primary/40 transition-colors"
        >
          <FileText className="w-4 h-4" /> {t("deals.viewFullListing")}
        </Link>
        {deal.status !== "REJECTED" && (
          <button
            onClick={() => advance({ toStatus: "REJECTED" })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/30
              text-destructive text-sm font-medium hover:bg-destructive/5 transition-colors ml-auto"
          >
            <XCircle className="w-4 h-4" /> {t("deals.rejectDeal")}
          </button>
        )}
      </div>
    </div>
  );
}

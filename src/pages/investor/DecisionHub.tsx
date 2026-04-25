import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  TrendingUp, Zap, CheckCircle2, AlertTriangle, ArrowRight, Target,
} from "lucide-react";
import { StatSkeleton, CardSkeleton } from "@/components/Skeletons";
import { useDeals } from "@/modules/deals/hooks/useDeals";
import DealCard from "@/modules/deals/components/DealCard";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item    = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function DecisionHub() {
  const { t } = useTranslation();
  const { data: deals = [], isLoading } = useDeals();

  const buySignals  = deals.filter(d => d.ai_analysis?.decision === "BUY");
  const holdSignals = deals.filter(d => d.ai_analysis?.decision === "HOLD");
  const active      = deals.filter(d => d.status !== "REJECTED");
  const avgScore    = deals.length
    ? Math.round(deals.reduce((s, d) => s + d.deal_score, 0) / deals.length)
    : null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {t("deals.hubTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("deals.hubSubtitle")}</p>
      </div>

      {/* KPI strip */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: t("deals.statBuySignals"),  value: buySignals.length,     icon: CheckCircle2, color: "text-success" },
            { label: t("deals.statHoldSignals"), value: holdSignals.length,    icon: AlertTriangle,color: "text-warning" },
            { label: t("deals.statActive"),      value: active.length,         icon: TrendingUp,   color: "text-primary" },
            { label: t("deals.statAvgScore"),    value: avgScore ?? "—",        icon: Zap,          color: "text-info"    },
          ].map(stat => (
            <motion.div key={stat.label} variants={item}
              className="rounded-xl bg-card border border-border p-4 space-y-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* AI says BUY */}
      {!isLoading && buySignals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              {t("deals.aiSaysBuy")}
              <span className="text-xs font-medium bg-success/10 text-success px-2 py-0.5 rounded-full">
                {buySignals.length}
              </span>
            </h2>
            <Link to="/investor/deals?filter=BUY"
              className="text-xs text-primary hover:underline flex items-center gap-1">
              {t("common.viewAll")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {buySignals.slice(0, 3).map(deal => (
              <motion.div key={deal.id} variants={item}>
                <DealCard deal={deal} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Loading skeleton for deals */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Monitor (HOLD signals) */}
      {!isLoading && holdSignals.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              {t("deals.aiSaysHold")}
              <span className="text-xs font-medium bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                {holdSignals.length}
              </span>
            </h2>
            <Link to="/investor/deals?filter=HOLD"
              className="text-xs text-primary hover:underline flex items-center gap-1">
              {t("common.viewAll")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {holdSignals.slice(0, 3).map(deal => (
              <motion.div key={deal.id} variants={item}>
                <DealCard deal={deal} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Empty state */}
      {!isLoading && deals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-4">
          <Target className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-semibold text-lg">{t("deals.emptyTitle")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("deals.emptyDesc")}</p>
          </div>
          <Link
            to="/buyer/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <TrendingUp className="w-4 h-4" /> {t("deals.discoverDeals")}
          </Link>
        </div>
      )}
    </div>
  );
}

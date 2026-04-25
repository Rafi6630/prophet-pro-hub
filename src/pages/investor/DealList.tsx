import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Filter, TrendingUp, Search } from "lucide-react";
import { useDeals } from "@/modules/deals/hooks/useDeals";
import DealCard from "@/modules/deals/components/DealCard";
import { CardSkeleton } from "@/components/Skeletons";
import { DEAL_STATE_CONFIG, STEPPER_STATES } from "@/modules/deals/dealMachine";
import type { DealStatus, AIDecision } from "@/core/types/deal";

const ALL_DECISIONS: AIDecision[] = ["BUY", "HOLD", "REJECT"];
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item    = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function DealList() {
  const { t } = useTranslation();
  const [params]                      = useSearchParams();
  const initialFilter                 = params.get("filter") as AIDecision | null;
  const [decisionFilter, setDecision] = useState<AIDecision | null>(initialFilter);
  const [statusFilter, setStatus]     = useState<DealStatus | null>(null);
  const [showRejected, setShowRejected] = useState(false);
  const [search, setSearch]           = useState("");

  const { data: deals = [], isLoading } = useDeals();

  const filtered = deals.filter(d => {
    if (!showRejected && d.status === "REJECTED") return false;
    if (decisionFilter && d.ai_analysis?.decision !== decisionFilter) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const haystack = [d.property?.title, d.property?.city, d.property?.district]
        .filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  // Group by status for kanban view
  const byStatus = STEPPER_STATES.reduce<Record<DealStatus, typeof filtered>>(
    (acc, s) => {
      acc[s] = filtered.filter(d => d.status === s);
      return acc;
    },
    {} as Record<DealStatus, typeof filtered>,
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">{t("deals.listTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("deals.listSubtitle")}</p>
        </div>
        <Link to="/buyer/discover"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary
            text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shrink-0">
          <TrendingUp className="w-4 h-4" /> {t("deals.addDeal")}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("common.search")}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Decision filter */}
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          {[null, ...ALL_DECISIONS].map(d => (
            <button
              key={d ?? "all"}
              onClick={() => setDecision(d)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                decisionFilter === d
                  ? "bg-primary text-white border-primary"
                  : "bg-secondary/40 border-border hover:border-primary/40"
              }`}
            >
              {d ? t(`deals.decision${d}`) : t("common.all")}
            </button>
          ))}
        </div>

        {/* Show rejected toggle */}
        <button
          onClick={() => setShowRejected(v => !v)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
            showRejected
              ? "bg-destructive/10 text-destructive border-destructive/30"
              : "bg-secondary/40 border-border text-muted-foreground"
          }`}
        >
          {t("deals.showRejected")}
        </button>
      </div>

      {/* Kanban columns */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-medium">{t("deals.noResults")}</p>
          <p className="text-sm mt-1">{t("deals.noResultsDesc")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {STEPPER_STATES.map(status => {
            const group = byStatus[status];
            if (!group?.length) return null;
            const cfg = DEAL_STATE_CONFIG[status];
            return (
              <section key={status}>
                <h2 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${cfg.color}`}>
                  {t(cfg.labelKey)}
                  <span className="bg-secondary text-foreground px-2 py-0.5 rounded-full text-xs font-normal">
                    {group.length}
                  </span>
                </h2>
                <motion.div
                  variants={stagger} initial="hidden" animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {group.map(deal => (
                    <motion.div key={deal.id} variants={item}>
                      <DealCard deal={deal} />
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

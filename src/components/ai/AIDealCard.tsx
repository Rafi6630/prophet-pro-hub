import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Coins,
  CheckCircle2,
  ShieldCheck,
  FileDown,
  TableProperties,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDealAnalysis, type DealAnalysisResult, type DealVerdict } from "@/hooks/useDealAnalysis";
import { useTranslation } from "react-i18next";
import { downloadDealReportPDF, downloadDealReportXLSX } from "@/lib/exportReport";

interface AIDealCardProps {
  propertyId: string;
  isAuthed: boolean;
  onAuthRequired: () => void;
  propertyTitle?: string;
  propertyAddress?: string;
}

const VERDICT_TONE: Record<DealVerdict, { bg: string; ring: string; icon: typeof CheckCircle2 }> = {
  strong_buy: { bg: "bg-emerald-50 text-emerald-900", ring: "border-emerald-200", icon: CheckCircle2 },
  buy:        { bg: "bg-emerald-50 text-emerald-900", ring: "border-emerald-200", icon: CheckCircle2 },
  neutral:    { bg: "bg-slate-50 text-slate-900",     ring: "border-slate-200",   icon: ShieldCheck },
  caution:    { bg: "bg-amber-50 text-amber-900",     ring: "border-amber-200",   icon: AlertTriangle },
  avoid:      { bg: "bg-red-50 text-red-900",         ring: "border-red-200",     icon: AlertTriangle },
};

export function AIDealCard({ propertyId, isAuthed, onAuthRequired, propertyTitle = "Property", propertyAddress }: AIDealCardProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { analyze, result, loading, error } = useDealAnalysis();
  const [requested, setRequested] = useState(false);

  const handleRun = async () => {
    if (!isAuthed) {
      onAuthRequired();
      return;
    }
    setRequested(true);
    await analyze(propertyId);
  };

  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);

  const handleExportPDF = async () => {
    if (!result) return;
    setExporting("pdf");
    try {
      await downloadDealReportPDF(result, { propertyTitle, propertyAddress }, isAr ? "ar" : "en");
    } finally {
      setExporting(null);
    }
  };

  const handleExportXLSX = async () => {
    if (!result) return;
    setExporting("xlsx");
    try {
      await downloadDealReportXLSX(result, { propertyTitle, propertyAddress }, isAr ? "ar" : "en");
    } finally {
      setExporting(null);
    }
  };

  if (!result) {
    return (
      <div className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-amber-50 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {t("ai.dealAnalysisLabel", "AI Deal Analysis")}
            </p>
            <h3 className="mt-1 text-xl font-extrabold">
              {isAr
                ? "احصل على تحليل ذكي لهذه الصفقة"
                : t("ai.dealAnalysisTitle", "Get a smart verdict on this deal")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-foreground/72">
              {isAr
                ? "تحليل بالذكاء الاصطناعي يقارن السعر بالسوق، يكشف المخاطر، ويقترح نطاق تفاوض."
                : t(
                    "ai.dealAnalysisDesc",
                    "AI compares price vs market, surfaces risks, and suggests a negotiation range — in seconds.",
                  )}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={handleRun} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading
                  ? t("ai.analyzing", "Analyzing…")
                  : t("ai.runAnalysis", "Run AI Analysis")}
              </Button>
              {!isAuthed ? (
                <span className="text-xs text-muted-foreground">
                  {t("ai.signInToUse", "Sign in to unlock")}
                </span>
              ) : null}
              {requested && error ? (
                <span className="text-xs text-destructive">
                  {t("ai.errorRetry", "AI service unavailable, please retry.")}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AIDealResult data={result} onExportPDF={handleExportPDF} onExportXLSX={handleExportXLSX} exporting={exporting} />;
}

function AIDealResult({
  data,
  onExportPDF,
  onExportXLSX,
  exporting,
}: {
  data: DealAnalysisResult;
  onExportPDF?: () => void;
  onExportXLSX?: () => void;
  exporting?: "pdf" | "xlsx" | null;
}) {
  const { i18n, t } = useTranslation();
  const isAr = i18n.language === "ar";
  const tone = VERDICT_TONE[data.verdict] ?? VERDICT_TONE.neutral;
  const VerdictIcon = tone.icon;

  return (
    <div className={`rounded-[2rem] border p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ${tone.ring} bg-white`}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {t("ai.dealAnalysisLabel", "AI Deal Analysis")}
        </p>
      </div>

      <div className={`mt-4 flex items-start gap-3 rounded-2xl px-4 py-3 ${tone.bg}`}>
        <VerdictIcon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.16em]">
            {isAr ? data.verdict_label_ar : data.verdict_label_en}
          </div>
          <p className="mt-1 text-sm leading-6">
            {isAr ? data.bottom_line_ar : data.bottom_line_en}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Section
          title={isAr ? "نقاط القوة" : t("ai.strengths", "Strengths")}
          icon={CheckCircle2}
          tone="emerald"
          items={isAr ? data.strengths_ar : data.strengths_en}
        />
        <Section
          title={isAr ? "المخاطر" : t("ai.risks", "Risks")}
          icon={AlertTriangle}
          tone="amber"
          items={isAr ? data.risks_ar : data.risks_en}
        />
      </div>

      <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
        <Stat
          icon={Coins}
          label={isAr ? "نطاق العرض المقترح" : t("ai.suggestedOffer", "Suggested offer")}
          value={`$${data.suggested_offer_low.toLocaleString()} – $${data.suggested_offer_high.toLocaleString()}`}
        />
        <Stat
          icon={TrendingUp}
          label={isAr ? "السعر مقابل السوق" : t("ai.vsMarket", "vs market median")}
          value={`${data.market_context.price_position_pct >= 0 ? "+" : ""}${data.market_context.price_position_pct}%`}
        />
        <Stat
          icon={ShieldCheck}
          label={isAr ? "تقدير السعر العادل" : t("ai.fairPrice", "Fair price estimate")}
          value={`$${data.market_context.fair_price_estimate.toLocaleString()}`}
        />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">
            {isAr ? "نصائح للتفاوض" : t("ai.negotiationTips", "Negotiation tips")}
          </span>
        </div>
        <ul className="space-y-2">
          {(isAr ? data.negotiation_tips_ar : data.negotiation_tips_en).map((tip, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm leading-6 text-foreground/80"
            >
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {(onExportPDF || onExportXLSX) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <span className="text-xs text-muted-foreground">
            {isAr ? "تصدير التقرير:" : "Export report:"}
          </span>
          {onExportPDF && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={onExportPDF}
              disabled={exporting === "pdf"}
            >
              {exporting === "pdf" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileDown className="h-3.5 w-3.5 text-red-500" />
              )}
              {isAr ? "تنزيل PDF" : "Download PDF"}
            </Button>
          )}
          {onExportXLSX && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={onExportXLSX}
              disabled={exporting === "xlsx"}
            >
              {exporting === "xlsx" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <TableProperties className="h-3.5 w-3.5 text-emerald-600" />
              )}
              {isAr ? "تنزيل Excel" : "Download Excel"}
            </Button>
          )}
        </div>
      )}

      <p className="mt-4 text-[11px] text-muted-foreground">
        {isAr
          ? "تحليل بالذكاء الاصطناعي للمساعدة في القرار. لا يحل محل الفحص القانوني."
          : t(
              "ai.disclaimer",
              "AI-generated analysis to support your decision. Not a substitute for legal due diligence.",
            )}
      </p>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  items,
  tone,
}: {
  title: string;
  icon: typeof CheckCircle2;
  items: string[];
  tone: "emerald" | "amber";
}) {
  const toneClasses =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
      : "border-amber-200 bg-amber-50/60 text-amber-900";
  return (
    <div className={`rounded-2xl border p-4 ${toneClasses}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.slice(0, 4).map((item, i) => (
          <li key={i} className="text-sm leading-6">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <div className="mt-1.5 text-base font-extrabold">{value}</div>
    </div>
  );
}

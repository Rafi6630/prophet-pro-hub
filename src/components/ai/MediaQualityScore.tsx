import { useState } from "react";
import {
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Star,
  StarOff,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { analyzeMediaQuality, type MediaQualityReport, type ImageQualityResult } from "@/lib/ai/mediaQuality";

interface MediaQualityScoreProps {
  imageUrls: string[];
  hasDuplicateImages?: boolean;
  compact?: boolean;
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 65) return "text-green-600";
  if (score >= 45) return "text-amber-600";
  return "text-red-600";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 65) return "bg-green-500";
  if (score >= 45) return "bg-amber-500";
  return "bg-red-500";
}

function trustImpactBadge(impact: ImageQualityResult["trustImpact"], isAr: boolean) {
  switch (impact) {
    case "positive":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          <CheckCircle2 className="h-2.5 w-2.5" />
          {isAr ? "إيجابي" : "Positive"}
        </span>
      );
    case "negative":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
          <AlertTriangle className="h-2.5 w-2.5" />
          {isAr ? "سلبي" : "Negative"}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
          <Info className="h-2.5 w-2.5" />
          {isAr ? "محايد" : "Neutral"}
        </span>
      );
  }
}

function MiniScoreDot({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-emerald-500" :
    score >= 65 ? "bg-green-500" :
    score >= 45 ? "bg-amber-500" : "bg-red-500";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export function MediaQualityScore({
  imageUrls,
  hasDuplicateImages = false,
  compact = false,
}: MediaQualityScoreProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [expanded, setExpanded] = useState(false);

  const report: MediaQualityReport = analyzeMediaQuality(imageUrls, hasDuplicateImages);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
        report.hasTrustWarning
          ? "border-amber-200 bg-amber-50"
          : "border-emerald-200 bg-emerald-50"
      }`}>
        <ImageIcon className={`h-4 w-4 shrink-0 ${report.hasTrustWarning ? "text-amber-600" : "text-emerald-600"}`} />
        <span className={`font-semibold ${report.hasTrustWarning ? "text-amber-700" : "text-emerald-700"}`}>
          {isAr ? `جودة الصور: ${report.overallLabelAr}` : `Media Quality: ${report.overallLabel}`}
        </span>
        <span className={`ml-auto font-bold ${scoreColor(report.overallScore)}`}>
          {report.overallScore}/100
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_8px_32px_rgba(15,23,42,0.06)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {isAr ? "تحليل جودة الوسائط بالذكاء الاصطناعي" : "AI Media Quality Analysis"}
            </p>
            <p className={`text-sm font-bold ${scoreColor(report.overallScore)}`}>
              {isAr ? report.overallLabelAr : report.overallLabel}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-2xl font-extrabold ${scoreColor(report.overallScore)}`}>
            {report.overallScore}
            <span className="text-sm font-medium text-slate-400">/100</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {isAr ? "نقاط الجودة" : "Quality score"}
          </p>
        </div>
      </div>

      {/* Score bar */}
      <div className="px-6 py-3 border-b border-slate-100">
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${scoreBg(report.overallScore)}`}
            style={{ width: `${report.overallScore}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
          <span>{isAr ? `${imageUrls.length} صورة محللة` : `${imageUrls.length} image(s) analysed`}</span>
          <div className="flex items-center gap-1">
            {report.images.slice(0, 6).map((img, i) => (
              <MiniScoreDot key={i} score={img.qualityScore} />
            ))}
          </div>
        </div>
      </div>

      {/* Trust warning */}
      {report.hasTrustWarning && report.trustWarningMessage && (
        <div className="mx-6 mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {isAr ? "تحذير: تأثير على الثقة" : "Warning: Trust Impact"}
            </p>
            <p className="mt-0.5 text-xs text-amber-700 leading-5">
              {isAr ? report.trustWarningMessageAr : report.trustWarningMessage}
            </p>
          </div>
        </div>
      )}

      {/* Per-image breakdown (collapsible) */}
      {report.images.length > 0 && (
        <div className="px-6 py-4 border-b border-slate-100">
          <button
            className="flex w-full items-center justify-between text-sm font-semibold text-slate-700"
            onClick={() => setExpanded((v) => !v)}
          >
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              {isAr ? "تفاصيل الصور" : "Per-Image Breakdown"}
            </span>
            {expanded
              ? <ChevronUp className="h-4 w-4 text-slate-400" />
              : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {expanded && (
            <div className="mt-3 space-y-2">
              {report.images.map((img, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-xl border p-3 ${
                    img.trustImpact === "negative"
                      ? "border-red-200 bg-red-50"
                      : img.trustImpact === "neutral"
                      ? "border-slate-200 bg-slate-50"
                      : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Photo ${i + 1}`}
                    className="h-14 w-14 rounded-xl object-cover shrink-0 border border-white/60"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Crect width='56' height='56' fill='%23e2e8f0'/%3E%3C/svg%3E";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-semibold text-slate-700">
                        {isAr ? `الصورة ${i + 1}` : `Photo ${i + 1}`}
                      </span>
                      <div className="flex items-center gap-2">
                        {trustImpactBadge(img.trustImpact, isAr)}
                        <span className={`text-xs font-bold ${scoreColor(img.qualityScore)}`}>
                          {img.qualityScore}/100
                        </span>
                      </div>
                    </div>
                    {img.issues.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {(isAr ? img.issuesAr : img.issues).map((issue, j) => (
                          <li key={j} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                            <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    )}
                    {img.trustImpact === "negative" && img.warning && (
                      <p className="mt-1 text-[11px] text-red-700 font-medium">
                        {isAr ? img.warningAr : img.warning}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-3">
          <StarOff className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {isAr ? "توصيات لتحسين جودة الوسائط" : "Recommendations"}
          </p>
        </div>
        <ul className="space-y-2">
          {(isAr ? report.recommendationsAr : report.recommendations).map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              {rec}
            </li>
          ))}
        </ul>
      </div>

      <p className="px-6 pb-4 text-[10px] text-slate-400">
        {isAr
          ? "تحليل الجودة بالذكاء الاصطناعي للمساعدة في بناء الثقة. يعتمد على التحليل الإرشادي."
          : "AI quality analysis to support trust-building. Based on heuristic signals."}
      </p>
    </div>
  );
}

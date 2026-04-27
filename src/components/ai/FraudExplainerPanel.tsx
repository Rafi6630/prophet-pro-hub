import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Eye,
  FileText,
  DollarSign,
  User,
  Image,
  List,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FraudRiskResult, FraudFlag } from "@/lib/ai/fraudRisk";

interface FraudExplainerPanelProps {
  fraudResult: FraudRiskResult;
  pricePerSqm?: number;
  marketAverage?: number;
  priceUsd?: number;
  fairPrice?: number;
}

const CATEGORY_ICONS: Record<string, typeof Shield> = {
  Pricing: DollarSign,
  Seller: User,
  Images: Image,
  Listing: List,
  Documents: FileText,
};

const CATEGORY_HOW_TO_VERIFY: Record<string, { en: string[]; ar: string[] }> = {
  Pricing: {
    en: [
      "Compare with 3 similar listings in the same area on this platform",
      "Request a written price history from the seller",
      "Ask a certified Iraqi property evaluator for an independent estimate",
    ],
    ar: [
      "قارن مع 3 عقارات مشابهة في نفس المنطقة على هذه المنصة",
      "اطلب من البائع سجلاً مكتوباً لتاريخ الأسعار",
      "اطلب تقييماً مستقلاً من مقيّم عقاري معتمد في العراق",
    ],
  },
  Seller: {
    en: [
      "Request a copy of the seller's national ID or business license",
      "Look up the seller's verified profile and review history",
      "Call the official number listed — do not use numbers given only in chat",
    ],
    ar: [
      "اطلب نسخة من هوية البائع الوطنية أو رخصة العمل",
      "تحقق من الملف الموثّق للبائع وسجل التقييمات",
      "اتصل بالرقم الرسمي المدرج — لا تستخدم أرقاماً مرسلة فقط عبر المحادثة",
    ],
  },
  Images: {
    en: [
      "Run a reverse image search (Google Images) to check for stock photos",
      "Request a live video tour to confirm the property's current condition",
      "Ask for photos taken today with a timestamp or newspaper in frame",
    ],
    ar: [
      "أجر بحثاً عكسياً عن الصورة (Google Images) للتحقق من صور المخزون",
      "اطلب جولة فيديو مباشرة للتحقق من الحالة الراهنة للعقار",
      "اطلب صوراً التقطت اليوم بطابع زمني أو صحيفة في الإطار",
    ],
  },
  Listing: {
    en: [
      "Read the full description carefully for inconsistencies or pressure language",
      "Cross-check the address against Google Maps Street View",
      "Request a site visit before making any payment or commitment",
    ],
    ar: [
      "اقرأ الوصف كاملاً بعناية بحثاً عن تناقضات أو لغة ضغط",
      "تحقق من العنوان عبر Google Maps Street View",
      "اطلب زيارة ميدانية قبل أي دفع أو التزام",
    ],
  },
  Documents: {
    en: [
      "Request the official property deed (tapu/kosha) issued by the Iraqi Land Registry",
      "Verify documents with a registered Iraqi notary or lawyer",
      "Do not transfer any money until all documents are verified and authenticated",
    ],
    ar: [
      "اطلب سند الملكية الرسمي (الطابو/الكوشان) الصادر عن دائرة التسجيل العقاري العراقي",
      "تحقق من الوثائق مع كاتب عدل أو محامٍ عراقي مسجّل",
      "لا تحوّل أي أموال حتى يتم التحقق من جميع الوثائق وتوثيقها",
    ],
  },
};

function getRiskConfig(level: "Low" | "Medium" | "High") {
  switch (level) {
    case "Low":
      return {
        icon: ShieldCheck,
        headerBg: "bg-emerald-50 border-emerald-200",
        iconColor: "text-emerald-600",
        scoreBarColor: "bg-emerald-500",
        labelEn: "Low Risk — Listing looks legitimate",
        labelAr: "مخاطر منخفضة — Listing يبدو شرعياً",
      };
    case "Medium":
      return {
        icon: ShieldAlert,
        headerBg: "bg-amber-50 border-amber-200",
        iconColor: "text-amber-600",
        scoreBarColor: "bg-amber-500",
        labelEn: "Medium Risk — Some signals need verification",
        labelAr: "مخاطر متوسطة — بعض الإشارات تحتاج إلى تحقق",
      };
    case "High":
      return {
        icon: ShieldX,
        headerBg: "bg-red-50 border-red-200",
        iconColor: "text-red-600",
        scoreBarColor: "bg-red-500",
        labelEn: "High Risk — Multiple flags detected",
        labelAr: "مخاطر عالية — تم اكتشاف علامات متعددة",
      };
  }
}

function flagTypeIcon(type: FraudFlag["type"]) {
  switch (type) {
    case "critical": return <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />;
    case "warning":  return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
    case "info":     return <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />;
  }
}

function severityLabel(severity: number, isAr: boolean) {
  if (severity >= 25) return isAr ? "حرج" : "Critical";
  if (severity >= 15) return isAr ? "تحذير" : "Warning";
  return isAr ? "معلومة" : "Info";
}

function SignalBar({ severity }: { severity: number }) {
  const pct = Math.min(Math.round((severity / 30) * 100), 100);
  const color = severity >= 25 ? "bg-red-500" : severity >= 15 ? "bg-amber-500" : "bg-blue-400";
  return (
    <div className="h-1.5 w-16 rounded-full bg-slate-200 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function FraudExplainerPanel({
  fraudResult,
  pricePerSqm,
  marketAverage,
  priceUsd,
  fairPrice,
}: FraudExplainerPanelProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [expanded, setExpanded] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState<string | null>(null);

  const config = getRiskConfig(fraudResult.riskLevel);
  const RiskIcon = config.icon;

  const categoriesWithFlags = Array.from(
    new Set(fraudResult.flags.map((f) => f.category))
  );

  const passedChecks = fraudResult.verificationChecks.filter((c) => c.passed).length;
  const totalChecks = fraudResult.verificationChecks.length;

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_8px_32px_rgba(15,23,42,0.07)] overflow-hidden">
      {/* Header */}
      <div className={`border-b px-6 py-4 ${config.headerBg}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
              <RiskIcon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {isAr ? "تحليل مخاطر الاحتيال بالذكاء الاصطناعي" : "AI Fraud-Risk Analysis"}
              </p>
              <p className={`text-sm font-bold ${config.iconColor}`}>
                {isAr ? config.labelAr : config.labelEn}
              </p>
            </div>
          </div>
          {/* Score ring */}
          <div className="text-right shrink-0">
            <div className={`text-2xl font-extrabold ${config.iconColor}`}>
              {fraudResult.riskScore}
              <span className="text-sm font-medium text-slate-400">/100</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {isAr ? "نقاط الخطر" : "Risk score"}
            </p>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-3 h-2 rounded-full bg-white/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${config.scoreBarColor}`}
            style={{ width: `${fraudResult.riskScore}%` }}
          />
        </div>

        {/* Verification summary */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          {isAr
            ? `${passedChecks} من ${totalChecks} فحص اجتاز التحقق`
            : `${passedChecks} of ${totalChecks} verification checks passed`}
        </div>
      </div>

      {/* Signal breakdown */}
      {fraudResult.flags.length > 0 && (
        <div className="px-6 py-4 border-b border-slate-100">
          <button
            className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
            onClick={() => setExpanded((v) => !v)}
          >
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              {isAr
                ? `الإشارات التي دفعت الحكم (${fraudResult.flags.length})`
                : `Signals that drove this verdict (${fraudResult.flags.length})`}
            </span>
            {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {expanded && (
            <div className="mt-4 space-y-3">
              {fraudResult.flags.map((flag, i) => {
                const CatIcon = CATEGORY_ICONS[flag.category] ?? Info;
                return (
                  <div
                    key={i}
                    className={`rounded-2xl border p-3 ${
                      flag.type === "critical"
                        ? "border-red-200 bg-red-50"
                        : flag.type === "warning"
                        ? "border-amber-200 bg-amber-50"
                        : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/80">
                        <CatIcon className="h-3.5 w-3.5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            {flagTypeIcon(flag.type)}
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              {isAr ? flag.categoryAr : flag.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">
                              {isAr
                                ? `الأثر: ${severityLabel(flag.severity, true)}`
                                : `Impact: ${severityLabel(flag.severity, false)}`}
                            </span>
                            <SignalBar severity={flag.severity} />
                          </div>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-700 leading-5">
                          {isAr ? flag.messageAr : flag.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Price context if available */}
      {pricePerSqm !== undefined && marketAverage !== undefined && (
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-3">
            {isAr ? "سياق التسعير" : "Pricing Context"}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
            <StatPill
              label={isAr ? "سعر/م²" : "Price/m²"}
              value={`$${pricePerSqm.toLocaleString()}`}
            />
            <StatPill
              label={isAr ? "متوسط السوق/م²" : "Market avg/m²"}
              value={`$${marketAverage.toLocaleString()}`}
            />
            {priceUsd !== undefined && (
              <StatPill
                label={isAr ? "السعر المطلوب" : "Asking price"}
                value={`$${priceUsd.toLocaleString()}`}
              />
            )}
            {fairPrice !== undefined && (
              <StatPill
                label={isAr ? "السعر العادل" : "Fair price"}
                value={`$${fairPrice.toLocaleString()}`}
              />
            )}
          </div>
        </div>
      )}

      {/* How to verify — by category */}
      <div className="px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-3">
          {isAr ? "كيفية التحقق" : "How to Verify"}
        </p>
        <div className="space-y-2">
          {(categoriesWithFlags.length > 0 ? categoriesWithFlags : Object.keys(CATEGORY_HOW_TO_VERIFY)).map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat] ?? Info;
            const steps = CATEGORY_HOW_TO_VERIFY[cat];
            if (!steps) return null;
            const isOpen = verifyOpen === cat;
            return (
              <div key={cat} className="rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setVerifyOpen(isOpen ? null : cat)}
                >
                  <CatIcon className="h-4 w-4 text-primary shrink-0" />
                  <span className="flex-1 text-left">
                    {isAr ? (CATEGORY_HOW_TO_VERIFY[cat] ? cat : cat) : cat}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <ul className="px-4 pb-3 space-y-2 border-t border-slate-100 pt-2 bg-slate-50">
                    {(isAr ? steps.ar : steps.en).map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        {step}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="px-6 pb-4 text-[10px] text-slate-400">
        {isAr
          ? "هذا التحليل ناتج عن الذكاء الاصطناعي وللأغراض الإرشادية فقط. لا يحل محل التحقق القانوني."
          : "This analysis is AI-generated for guidance only. It does not replace legal due diligence."}
      </p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
      <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

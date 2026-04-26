import { Shield, ShieldCheck, ShieldAlert, ShieldX, HelpCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import type { FraudRiskResult } from "@/lib/ai/fraudRisk";

interface RiskBadgeProps {
  riskLevel: "Low" | "Medium" | "High";
  score?: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  detailed?: boolean;
}

export function RiskBadge({
  riskLevel,
  score,
  showScore = false,
  size = "md",
  interactive = false,
  detailed = false,
}: RiskBadgeProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const getConfig = () => {
    switch (riskLevel) {
      case "Low":
        return {
          icon: ShieldCheck,
          label: t("lowRisk", "Low Risk"),
          labelAr: "مخاطر منخفضة",
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
          ringColor: "ring-emerald-500/20",
        };
      case "Medium":
        return {
          icon: AlertTriangle,
          label: t("mediumRisk", "Medium Risk"),
          labelAr: "مخاطر متوسطة",
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          ringColor: "ring-amber-500/20",
        };
      case "High":
        return {
          icon: ShieldX,
          label: t("highRisk", "High Risk"),
          labelAr: "مخاطر عالية",
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          ringColor: "ring-red-500/20",
        };
      default:
        return {
          icon: HelpCircle,
          label: t("unknown", "Unknown"),
          labelAr: "غير معروف",
          color: "text-gray-400",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/30",
          ringColor: "ring-gray-500/20",
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const badge = (
    <Badge
      className={`inline-flex items-center font-semibold border ${sizeClasses[size]} ${config.bgColor} ${config.color} ${config.borderColor}`}
    >
      <IconComponent className={iconSizes[size]} />
      <span>{isRTL ? config.labelAr : config.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-70">({score})</span>
      )}
    </Badge>
  );

  if (!interactive) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side={isRTL ? "left" : "right"} className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{t("riskAssessment", "Risk Assessment")}</p>
            <p className="text-sm text-foreground/70">
              {riskLevel === "Low"
                ? t("riskLowDesc", "Listing appears legitimate with normal trust signals.")
                : riskLevel === "Medium"
                ? t("riskMediumDesc", "Some signals need verification before commitment.")
                : t("riskHighDesc", "Multiple flags detected. Manual review recommended.")}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface RiskCardProps {
  fraudResult: FraudRiskResult;
  compact?: boolean;
}

export function RiskCard({ fraudResult, compact = false }: RiskCardProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const getConfig = () => {
    switch (fraudResult.riskLevel) {
      case "Low":
        return {
          icon: ShieldCheck,
          label: t("verified", "Verified Safe"),
          labelAr: "آمن موثّق",
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
        };
      case "Medium":
        return {
          icon: ShieldAlert,
          label: t("review", "Review Needed"),
          labelAr: "يحتاج مراجعة",
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
        };
      case "High":
        return {
          icon: ShieldX,
          label: t("caution", "Exercise Caution"),
          labelAr: "توخّ الحذر",
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
        };
      default:
        return {
          icon: Shield,
          label: t("unknown", "Unknown"),
          labelAr: "غير معروف",
          color: "text-gray-400",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/30",
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  const criticalFlags = fraudResult.flags.filter((f) => f.type === "critical");
  const warningFlags = fraudResult.flags.filter((f) => f.type === "warning");

  if (compact) {
    return (
      <div className={`flex items-center gap-2 rounded-lg border ${config.bgColor} ${config.borderColor} p-3`}>
        <IconComponent className={`h-5 w-5 ${config.color}`} />
        <div className="flex-1">
          <p className={`text-sm font-semibold ${config.color}`}>
            {isRTL ? config.labelAr : config.label}
          </p>
          <p className="text-xs text-foreground/60">
            Score: {fraudResult.riskScore}/100
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 rounded-xl border ${config.bgColor} ${config.borderColor} p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor}`}>
            <IconComponent className={`h-5 w-5 ${config.color}`} />
          </div>
          <div>
            <p className={`text-lg font-bold ${config.color}`}>
              {isRTL ? config.labelAr : config.label}
            </p>
            <p className="text-sm text-foreground/60">
              {t("riskScore", "Risk Score")}: {fraudResult.riskScore}/100
            </p>
          </div>
        </div>
      </div>

      {fraudResult.flags.length > 0 && (
        <div className="space-y-2">
          {criticalFlags.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-red-400/70">
                {t("critical", "Critical")}
              </p>
              {criticalFlags.map((flag, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                  <span className="text-foreground/80">
                    {isRTL ? flag.messageAr : flag.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {warningFlags.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-amber-400/70">
                {t("warnings", "Warnings")}
              </p>
              {warningFlags.map((flag, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                  <span className="text-foreground/80">
                    {isRTL ? flag.messageAr : flag.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {fraudResult.verificationChecks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-foreground/50">
            {t("verificationChecks", "Verification Checks")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {fraudResult.verificationChecks.slice(0, 4).map((check, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 rounded-lg p-2 text-xs ${
                  check.passed ? "bg-emerald-500/10" : "bg-red-500/10"
                }`}
              >
                {check.passed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                )}
                <span className="text-foreground/70">
                  {isRTL ? check.checkAr : check.check}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {fraudResult.recommendations.length > 0 && (
        <div className="border-t border-white/10 pt-3">
          <p className="text-xs font-semibold uppercase text-foreground/50 mb-2">
            {t("recommendations", "Recommendations")}
          </p>
          <ul className="space-y-1">
            {fraudResult.recommendations.slice(0, 3).map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground/70">
                <span className="text-primary">•</span>
                <span>{isRTL ? fraudResult.recommendationsAr[index] : rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function RiskIndicator({ level }: { level: "Low" | "Medium" | "High" }) {
  const { t } = useTranslation();

  const getConfig = () => {
    switch (level) {
      case "Low":
        return { color: "bg-emerald-400", label: t("low", "Low") };
      case "Medium":
        return { color: "bg-amber-400", label: t("medium", "Medium") };
      case "High":
        return { color: "bg-red-400", label: t("high", "High") };
    }
  };

  const config = getConfig();

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${config.color}`} />
      <span className="text-sm text-foreground/70">{config.label}</span>
    </div>
  );
}
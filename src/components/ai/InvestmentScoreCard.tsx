import { TrendingUp, TrendingDown, Minus, Star, AlertTriangle, Clock, Target, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import type { InvestmentScoreResult } from "@/lib/ai/investmentScore";

interface InvestmentScoreCardProps {
  score: number;
  grade: "Excellent" | "Strong" | "Average" | "Weak" | "Avoid";
  breakdown: InvestmentScoreResult["breakdown"];
  summary: string;
  risks?: string[];
  opportunities?: string[];
  isLoading?: boolean;
  compact?: boolean;
  showDetails?: boolean;
}

export function InvestmentScoreCard({
  score,
  grade,
  breakdown,
  summary,
  risks = [],
  opportunities = [],
  isLoading = false,
  compact = false,
  showDetails = true,
}: InvestmentScoreCardProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const getGradeConfig = () => {
    switch (grade) {
      case "Excellent":
        return {
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
          icon: Star,
          label: t("excellent", "Excellent"),
          labelAr: "ممتاز",
        };
      case "Strong":
        return {
          color: "text-blue-400",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          icon: TrendingUp,
          label: t("strong", "Strong"),
          labelAr: "قوي",
        };
      case "Average":
        return {
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          icon: Minus,
          label: t("average", "Average"),
          labelAr: "متوسط",
        };
      case "Weak":
        return {
          color: "text-orange-400",
          bgColor: "bg-orange-500/10",
          borderColor: "border-orange-500/30",
          icon: TrendingDown,
          label: t("weak", "Weak"),
          labelAr: "ضعيف",
        };
      default:
        return {
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          icon: AlertTriangle,
          label: t("avoid", "Avoid"),
          labelAr: "تجنب",
        };
    }
  };

  const config = getGradeConfig();
  const IconComponent = config.icon;

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-card/70">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/10" />
            <div className="space-y-2">
              <div className="h-5 w-24" />
              <div className="h-4 w-16" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 w-full" />
          <div className="h-4 w-3/4" />
          <div className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={`border ${config.borderColor} bg-card/50`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconComponent className={`h-5 w-5 ${config.color}`} />
              <span className="text-sm text-foreground/60">{t("investmentScore", "Investment Score")}</span>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold ${config.color}`}>{score}</span>
              <span className="text-sm text-foreground/40">/100</span>
            </div>
          </div>
          <Progress
            value={score}
            className="mt-2 h-2"
            indicatorClassName={config.color.replace("text-", "bg-")}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border ${config.borderColor} bg-card/70`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${config.bgColor}`}>
              <IconComponent className={`h-7 w-7 ${config.color}`} />
            </div>
            <div>
              <Badge className={`${config.bgColor} ${config.color} border-0 mb-1`}>
                {isRTL ? config.labelAr : config.label}
              </Badge>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${config.color}`}>{score}</span>
                <span className="text-lg text-foreground/40">/100</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-foreground/70 leading-relaxed">
          {summary}
        </p>

        {showDetails && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
              {t("scoreBreakdown", "Score Breakdown")}
            </h4>
            
            <ScoreBreakdownItem
              label={isRTL ? "ميزة السعر" : "Price Advantage"}
              value={breakdown.priceAdvantage}
              icon={Target}
            />
            <ScoreBreakdownItem
              label={isRTL ? "إمكانية النمو" : "Growth Potential"}
              value={breakdown.growthPotential}
              icon={TrendingUp}
            />
            <ScoreBreakdownItem
              label={isRTL ? "السيولة" : "Liquidity"}
              value={breakdown.liquidityScore}
              icon={BarChart3}
            />
            <ScoreBreakdownItem
              label={isRTL ? "حالة العقار" : "Condition"}
              value={breakdown.conditionScore}
              icon={Clock}
            />
          </div>
        )}

        {risks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400/70">
              {isRTL ? "المخاطر" : "Risks"}
            </h4>
            <ul className="space-y-1">
              {risks.slice(0, 3).map((risk, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground/70">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {opportunities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400/70">
              {isRTL ? "الفرص" : "Opportunities"}
            </h4>
            <ul className="space-y-1">
              {opportunities.slice(0, 3).map((opp, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground/70">
                  <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2">
          <Progress
            value={score}
            className="h-3"
            indicatorClassName={`${config.color.replace("text-", "bg-")}`}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-foreground/50">
          <span>{t("lastUpdated", "Updated")}: {new Date().toLocaleDateString()}</span>
          <span>AI Analysis</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreBreakdownItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  const getColor = (val: number) => {
    if (val >= 75) return "text-emerald-400";
    if (val >= 50) return "text-blue-400";
    if (val >= 30) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${getColor(value)}`} />
        <span className="text-sm text-foreground/70">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <Progress
          value={value}
          className="w-20 h-1.5"
          indicatorClassName={getColor(value).replace("text-", "bg-")}
        />
        <span className={`w-8 text-right text-sm font-medium ${getColor(value)}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

export function InvestmentScoreBadge({ score, grade, compact }: { score: number; grade: string; compact?: boolean }) {
  const { t } = useTranslation();

  const getColor = () => {
    switch (grade) {
      case "Excellent":
      case "Strong":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Average":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-red-500/20 text-red-300 border-red-500/40";
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${getColor()}`}>
      <Target className="h-4 w-4" />
      <span>{t("investmentScore", "Investment")} {score}/100</span>
    </div>
  );
}
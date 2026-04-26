import { Flame, Snowflake, Droplets, TrendingUp, TrendingDown, Minus, Clock, User, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import type { LeadScoreResult, LeadTier } from "@/lib/ai/leadScore";

interface LeadHeatBadgeProps {
  tier: LeadTier;
  score: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LeadHeatBadge({
  tier,
  score,
  showScore = false,
  size = "md",
}: LeadHeatBadgeProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const getConfig = () => {
    switch (tier) {
      case "Hot":
        return {
          icon: Flame,
          label: t("hot", "Hot"),
          labelAr: "حار",
          color: "text-red-400",
          bgColor: "bg-red-500/15",
          borderColor: "border-red-500/40",
          glowColor: "shadow-red-500/20",
        };
      case "Warm":
        return {
          icon: Droplets,
          label: t("warm", "Warm"),
          labelAr: "دافئ",
          color: "text-orange-400",
          bgColor: "bg-orange-500/15",
          borderColor: "border-orange-500/40",
          glowColor: "shadow-orange-500/20",
        };
      case "Cold":
        return {
          icon: Snowflake,
          label: t("cold", "Cold"),
          labelAr: "بارد",
          color: "text-blue-400",
          bgColor: "bg-blue-500/15",
          borderColor: "border-blue-500/40",
          glowColor: "shadow-blue-500/20",
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

  return (
    <div
      className={`inline-flex items-center rounded-full border px-3 py-1 font-semibold shadow-lg ${sizeClasses[size]} ${config.bgColor} ${config.color} ${config.borderColor} ${config.glowColor}`}
    >
      <IconComponent className={size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      <span>{isRTL ? config.labelAr : config.label}</span>
      {showScore && <span className="opacity-80">({score})</span>}
    </div>
  );
}

interface LeadCardProps {
  lead: LeadScoreResult;
  onClick?: () => void;
  compact?: boolean;
}

export function LeadCard({ lead, onClick, compact = false }: LeadCardProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const getTrendIcon = () => {
    if (lead.conversionProbability >= 0.6) return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (lead.conversionProbability >= 0.3) return <Minus className="h-4 w-4 text-amber-400" />;
    return <TrendingDown className="h-4 w-4 text-red-400" />;
  };

  if (compact) {
    return (
      <Card className="border-white/10 bg-card/50 hover:bg-card/70 transition-colors cursor-pointer" onClick={onClick}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/20 text-primary">
                  {lead.score}
                </AvatarFallback>
              </Avatar>
              <div>
                <LeadHeatBadge tier={lead.tier} score={lead.score} size="sm" />
                <p className="mt-1 text-xs text-foreground/60">
                  {t("conversion", "Conversion")}: {Math.round(lead.conversionProbability * 100)}%
                </p>
              </div>
            </div>
            {getTrendIcon()}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-card/70 hover:bg-card/80 transition-colors cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className={`text-lg font-bold ${lead.tierColor}`}>
                {lead.score}
              </AvatarFallback>
            </Avatar>
            <div>
              <LeadHeatBadge tier={lead.tier} score={lead.score} showScore />
              <p className="mt-1 text-sm text-foreground/70">
                {lead.summary}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <ScoreMetric
            label={isRTL ? "نية الشراء" : "Intent"}
            value={lead.breakdown.intentSignals}
          />
          <ScoreMetric
            label={isRTL ? "محاذاة الميزانية" : "Budget Fit"}
            value={lead.breakdown.budgetFit}
          />
          <ScoreMetric
            label={isRTL ? "التفاعل" : "Engagement"}
            value={lead.breakdown.engagement}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground/60">{t("conversionProbability", "Conversion Probability")}</span>
            <span className="font-semibold">{Math.round(lead.conversionProbability * 100)}%</span>
          </div>
          <Progress value={lead.conversionProbability * 100} className="h-2" />
        </div>

        <div className={`rounded-lg p-3 ${lead.tier === "Hot" ? "bg-emerald-500/10" : lead.tier === "Warm" ? "bg-amber-500/10" : "bg-blue-500/10"}`}>
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${lead.tierColor}`} />
            <span className="text-sm font-medium">{isRTL ? lead.actionAr : lead.action}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-foreground/50">
          <span>{t("estClose", "Est. Close")}: {lead.estimatedCloseDate}</span>
          <span>{t("priority", "Priority")}: {lead.priority}/100</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreMetric({ label, value }: { label: string; value: number }) {
  const getColor = (val: number) => {
    if (val >= 70) return "text-emerald-400";
    if (val >= 50) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="text-center">
      <p className="text-xs text-foreground/60">{label}</p>
      <p className={`text-xl font-bold ${getColor(value)}`}>{value}</p>
    </div>
  );
}

interface LeadStatsProps {
  stats: {
    total: number;
    hotCount: number;
    warmCount: number;
    coldCount: number;
    avgScore: number;
    avgConversionProb: number;
  };
}

export function LeadStats({ stats }: LeadStatsProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="rounded-xl bg-red-500/10 p-4 text-center">
        <Flame className="mx-auto h-6 w-6 text-red-400" />
        <p className="mt-2 text-2xl font-bold text-red-400">{stats.hotCount}</p>
        <p className="text-xs text-foreground/60">{t("hot", "Hot")}</p>
      </div>
      <div className="rounded-xl bg-orange-500/10 p-4 text-center">
        <Droplets className="mx-auto h-6 w-6 text-orange-400" />
        <p className="mt-2 text-2xl font-bold text-orange-400">{stats.warmCount}</p>
        <p className="text-xs text-foreground/60">{t("warm", "Warm")}</p>
      </div>
      <div className="rounded-xl bg-blue-500/10 p-4 text-center">
        <Snowflake className="mx-auto h-6 w-6 text-blue-400" />
        <p className="mt-2 text-2xl font-bold text-blue-400">{stats.coldCount}</p>
        <p className="text-xs text-foreground/60">{t("cold", "Cold")}</p>
      </div>
      <div className="rounded-xl bg-white/5 p-4 text-center">
        <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        <p className="text-xs text-foreground/60">{t("total", "Total")}</p>
      </div>
    </div>
  );
}

interface LeadHeatIndicatorProps {
  score: number;
  tier: LeadTier;
}

export function LeadHeatIndicator({ score, tier }: LeadHeatIndicatorProps) {
  const { t } = useTranslation();

  const getHeatLevel = () => {
    if (tier === "Hot") return 3;
    if (tier === "Warm") return 2;
    return 1;
  };

  const heatLevel = getHeatLevel();

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((level) => (
        <div
          key={level}
          className={`h-2 w-4 rounded-full ${
            level <= heatLevel
              ? tier === "Hot"
                ? "bg-red-500"
                : tier === "Warm"
                ? "bg-orange-500"
                : "bg-blue-500"
              : "bg-white/10"
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-foreground/60">{score}</span>
    </div>
  );
}
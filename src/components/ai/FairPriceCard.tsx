import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface FairPriceCardProps {
  estimatedValue: number;
  listingPrice: number;
  lowEstimate: number;
  highEstimate: number;
  priceDifferencePercent: number;
  confidence: number;
  confidenceLabel: "High" | "Medium" | "Low";
  isLoading?: boolean;
  onRefresh?: () => void;
  showComparison?: boolean;
  compact?: boolean;
}

export function FairPriceCard({
  estimatedValue,
  listingPrice,
  lowEstimate,
  highEstimate,
  priceDifferencePercent,
  confidence,
  confidenceLabel,
  isLoading = false,
  onRefresh,
  showComparison = true,
  compact = false,
}: FairPriceCardProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, []);

  const isUnderpriced = priceDifferencePercent < -5;
  const isOverpriced = priceDifferencePercent > 5;
  const isFair = !isUnderpriced && !isOverpriced;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPriceRTL = (price: number) => {
    const numStr = (price / 1000).toFixed(0);
    return `${numStr}K $`;
  };

  const getTrendIcon = () => {
    if (isUnderpriced) return <TrendingDown className="h-4 w-4 text-emerald-400" />;
    if (isOverpriced) return <TrendingUp className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-blue-400" />;
  };

  const getStatusColor = () => {
    if (isUnderpriced) return "bg-emerald-500/10 border-emerald-500/30";
    if (isOverpriced) return "bg-red-500/10 border-red-500/30";
    return "bg-blue-500/10 border-blue-500/30";
  };

  const getLabelColor = () => {
    if (isUnderpriced) return "text-emerald-400";
    if (isOverpriced) return "text-red-400";
    return "text-blue-400";
  };

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-card/70">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={`border ${getStatusColor()} bg-card/50`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-foreground/60">{t("fairPrice", "Fair Price")}</p>
              <p className={`text-xl font-bold ${getLabelColor()}`}>
                {formatPrice(estimatedValue)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getLabelColor()}`}>
                {priceDifferencePercent > 0 ? "+" : ""}{priceDifferencePercent.toFixed(0)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border ${getStatusColor()} bg-card/70`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">{t("fairPrice", "Fair Price Estimate")}</span>
            <Badge variant="outline" className="text-xs">
              {confidenceLabel} {t("confidence", "Confidence")}
            </Badge>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm text-foreground/60">{t("estimatedValue", "Estimated Value")}</p>
            <p className={`text-3xl font-bold ${getLabelColor()}`}>
              {formatPrice(estimatedValue)}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
            {getTrendIcon()}
            <span className={`text-sm font-semibold ${getLabelColor()}`}>
              {priceDifferencePercent > 0 ? "+" : ""}{priceDifferencePercent.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className={`rounded-xl bg-white/5 p-4 ${isRTL ? "text-right" : "text-left"}`}>
          <p className="text-sm text-foreground/70">
            {isRTL ? (
              <>
                <span className="font-semibold">{formatPriceRTL(lowEstimate)}</span> إلى{" "}
                <span className="font-semibold">{formatPriceRTL(highEstimate)}</span>
              </>
            ) : (
              <>
                Range: <span className="font-semibold">{formatPrice(lowEstimate)}</span> -{" "}
                <span className="font-semibold">{formatPrice(highEstimate)}</span>
              </>
            )}
          </p>
        </div>

        {showComparison && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/60">{t("listingPrice", "Listing Price")}</span>
              <span className="font-semibold">{formatPrice(listingPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground/60">{t("vsMarket", "vs Market Average")}</span>
              <span className={getLabelColor()}>
                {priceDifferencePercent > 0 ? "Above" : "Below"} by {Math.abs(priceDifferencePercent).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        <div className={`flex items-center gap-2 rounded-lg p-3 ${isUnderpriced ? "bg-emerald-500/10" : isOverpriced ? "bg-amber-500/10" : "bg-blue-500/10"}`}>
          {isUnderpriced ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : isOverpriced ? (
            <AlertCircle className="h-5 w-5 text-amber-400" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-blue-400" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${isUnderpriced ? "text-emerald-400" : isOverpriced ? "text-amber-400" : "text-blue-400"}`}>
              {isUnderpriced
                ? t("underpriced", "Below market value - potential great deal")
                : isOverpriced
                ? t("overpriced", "Above market value - room for negotiation")
                : t("fairlyPriced", "Fairly priced relative to market")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-foreground/50">
          <span>{t("confidenceScore", "Confidence")}: {confidence}%</span>
          <span>AI Analysis</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function FairPriceComparison({ properties }: { properties: Array<{ price: number; estimatedValue: number; title: string }> }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground/70">{t("similarDeals", "Similar Deals Nearby")}</h4>
      {properties.map((property, index) => {
        const diff = ((property.price - property.estimatedValue) / property.estimatedValue) * 100;
        return (
          <div key={index} className="flex items-center justify-between rounded-lg bg-white/5 p-3">
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{property.title}</p>
              <p className="text-xs text-foreground/50">
                Est: {formatPrice(property.estimatedValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">${(property.price / 1000).toFixed(0)}K</p>
              <p className={`text-xs ${diff < 0 ? "text-emerald-400" : "text-amber-400"}`}>
                {diff < 0 ? "" : "+"}{diff.toFixed(0)}%
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
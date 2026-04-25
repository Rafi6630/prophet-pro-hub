import * as React from "react";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title:   string;
  value:   string | number;
  change?: string;
  icon:    LucideIcon;
  trend?:  "up" | "down" | "neutral";
  accent?: "primary" | "success" | "warning" | "destructive" | "info";
}

const ACCENT_MAP = {
  primary:     { bg: "bg-primary/10",     icon: "text-primary",     border: "border-primary/15"     },
  success:     { bg: "bg-success/10",     icon: "text-success",     border: "border-success/15"     },
  warning:     { bg: "bg-warning/10",     icon: "text-warning",     border: "border-warning/15"     },
  destructive: { bg: "bg-destructive/10", icon: "text-destructive", border: "border-destructive/15" },
  info:        { bg: "bg-info/10",        icon: "text-info",        border: "border-info/15"        },
};

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, change, icon: Icon, trend, accent = "primary" }, ref) => {
    const TrendIcon = trend === "up"
      ? TrendingUp
      : trend === "down"
      ? TrendingDown
      : Minus;

    const trendColor = trend === "up"
      ? "text-success"
      : trend === "down"
      ? "text-destructive"
      : "text-muted-foreground";

    const { bg, icon: iconColor, border } = ACCENT_MAP[accent];

    return (
      <div
        ref={ref}
        className={`relative rounded-2xl bg-card border ${border} p-4 lg:p-5
          shadow-card hover:shadow-md hover:border-primary/25
          transition-all duration-200 overflow-hidden group`}
      >
        {/* Subtle background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative flex items-start justify-between gap-3">
          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.06em] truncate leading-none mb-2">
              {title}
            </p>
            <p className="text-[28px] font-bold text-foreground leading-none tracking-tight font-display">
              {value}
            </p>
            {change && (
              <p className={`mt-2 text-[12px] font-medium flex items-center gap-1 ${trendColor}`}>
                <TrendIcon className="w-3 h-3 shrink-0" />
                {change}
              </p>
            )}
          </div>

          {/* Icon badge */}
          <div className={`p-2.5 rounded-xl ${bg} shrink-0 transition-transform duration-200 group-hover:scale-105`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </div>
    );
  }
);

StatsCard.displayName = "StatsCard";
export default StatsCard;

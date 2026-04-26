import { cn } from "@/lib/utils";

export function InvestmentScoreRing({
  score,
  size = 74,
  strokeWidth = 7,
  label = "Investment Score",
  className,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(15,23,42,0.08)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#investmentScoreGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
          <defs>
            <linearGradient id="investmentScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="55%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-lg font-extrabold">{safeScore}</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">/100</div>
          </div>
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
        <div className="mt-1 text-sm text-foreground/70">
          {safeScore >= 85 ? "Excellent entry profile" : safeScore >= 70 ? "Strong shortlist candidate" : "Needs closer review"}
        </div>
      </div>
    </div>
  );
}

export default InvestmentScoreRing;

import { BadgeCheck, Building2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type VerifiedBadgeVariant = "seller" | "agency" | "ownership";

interface VerifiedBadgeProps {
  variant: VerifiedBadgeVariant;
  className?: string;
}

const badgeConfig: Record<
  VerifiedBadgeVariant,
  {
    label: string;
    labelAr: string;
    icon: typeof BadgeCheck;
    className: string;
  }
> = {
  seller: {
    label: "Verified Seller",
    labelAr: "بائع موثوق",
    icon: BadgeCheck,
    className:
      "border-emerald-400/30 bg-emerald-500/15 text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.18)]",
  },
  agency: {
    label: "Verified Agency",
    labelAr: "وكالة موثوقة",
    icon: Building2,
    className:
      "border-amber-300/35 bg-amber-400/15 text-amber-50 shadow-[0_0_24px_rgba(245,158,11,0.16)]",
  },
  ownership: {
    label: "Ownership Reviewed",
    labelAr: "تمت مراجعة الملكية",
    icon: ShieldCheck,
    className:
      "border-lime-300/35 bg-lime-400/15 text-lime-50 shadow-[0_0_24px_rgba(132,204,22,0.16)]",
  },
};

export function VerifiedBadge({ variant, className }: VerifiedBadgeProps) {
  const config = badgeConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm",
        config.className,
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{config.label}</span>
      <span className="opacity-75">|</span>
      <span>{config.labelAr}</span>
    </div>
  );
}

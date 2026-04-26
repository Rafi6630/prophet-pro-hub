import { BadgeCheck, FileCheck, ShieldCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type TrustBadgeVariant = "verified-seller" | "ownership-reviewed" | "legal-checked" | "low-risk";

const trustConfig: Record<
  TrustBadgeVariant,
  { label: string; icon: typeof BadgeCheck; className: string }
> = {
  "verified-seller": {
    label: "Verified Seller",
    icon: BadgeCheck,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  "ownership-reviewed": {
    label: "Ownership Reviewed",
    icon: FileCheck,
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  "legal-checked": {
    label: "Legal Checked",
    icon: ShieldCheck,
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  "low-risk": {
    label: "Low Risk",
    icon: TriangleAlert,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
};

export function TrustBadge({ variant, className }: { variant: TrustBadgeVariant; className?: string }) {
  const { icon: Icon, label, className: tone } = trustConfig[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
        tone,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export default TrustBadge;

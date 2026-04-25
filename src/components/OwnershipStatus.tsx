import { AlertTriangle, BadgeCheck, FileQuestion, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type OwnershipState = "pending" | "verified" | "legal-risk" | "missing-documents";

interface OwnershipStatusProps {
  status: OwnershipState;
  className?: string;
}

const statusConfig: Record<
  OwnershipState,
  {
    label: string;
    labelAr: string;
    icon: typeof LoaderCircle;
    className: string;
  }
> = {
  pending: {
    label: "Pending Review",
    labelAr: "قيد المراجعة",
    icon: LoaderCircle,
    className: "border-sky-400/30 bg-sky-500/12 text-sky-100",
  },
  verified: {
    label: "Verified",
    labelAr: "موثق",
    icon: BadgeCheck,
    className: "border-emerald-400/30 bg-emerald-500/12 text-emerald-100",
  },
  "legal-risk": {
    label: "Legal Risk",
    labelAr: "مخاطر قانونية",
    icon: AlertTriangle,
    className: "border-rose-400/30 bg-rose-500/12 text-rose-100",
  },
  "missing-documents": {
    label: "Missing Documents",
    labelAr: "مستندات ناقصة",
    icon: FileQuestion,
    className: "border-amber-400/30 bg-amber-500/12 text-amber-100",
  },
};

export function OwnershipStatus({ status, className }: OwnershipStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className={cn("h-4 w-4", status === "pending" && "animate-spin")} />
      <span>{config.label}</span>
      <span className="opacity-70">|</span>
      <span>{config.labelAr}</span>
    </div>
  );
}

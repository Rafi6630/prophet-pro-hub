import { useTranslation } from "react-i18next";
import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import type { AIDecision } from "@/core/types/deal";

const CONFIG: Record<AIDecision, { icon: typeof CheckCircle2; cls: string; key: string }> = {
  BUY:    { icon: CheckCircle2, cls: "bg-success/15 text-success border-success/30",               key: "deals.decisionBuy"    },
  HOLD:   { icon: MinusCircle,  cls: "bg-warning/15 text-warning border-warning/30",               key: "deals.decisionHold"   },
  REJECT: { icon: XCircle,      cls: "bg-destructive/15 text-destructive border-destructive/30",   key: "deals.decisionReject" },
};

interface Props {
  decision: AIDecision;
  size?: "sm" | "md";
}

export default function DecisionChip({ decision, size = "md" }: Props) {
  const { t } = useTranslation();
  const { icon: Icon, cls, key } = CONFIG[decision];
  const iconSz = size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";
  const textSz = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold border ${textSz} ${cls}`}>
      <Icon className={iconSz} />
      {t(key)}
    </span>
  );
}

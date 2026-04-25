import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle } from "lucide-react";
import { STEPPER_STATES, DEAL_STATE_CONFIG, canTransition } from "../dealMachine";
import { useAdvanceDealStatus } from "../hooks/useDeals";
import type { Deal, DealStatus } from "@/core/types/deal";

interface Props {
  deal: Deal;
}

export function DealStatusStepper({ deal }: Props) {
  const { t } = useTranslation();
  const currentStep = DEAL_STATE_CONFIG[deal.status].step;
  const { mutate, isPending } = useAdvanceDealStatus(deal.id);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-muted-foreground mb-4">
        {t("deals.pipeline")}
      </p>

      <div className="flex items-center">
        {STEPPER_STATES.map((status, idx) => {
          const cfg       = DEAL_STATE_CONFIG[status];
          const isDone    = cfg.step < currentStep;
          const isCurrent = cfg.step === currentStep;
          const isNext    = canTransition(deal.status, status);
          const isLast    = idx === STEPPER_STATES.length - 1;

          return (
            <div key={status} className="flex items-center flex-1 min-w-0">
              {/* Step node */}
              <button
                disabled={!isNext || isPending || isCurrent}
                onClick={() => isNext && mutate({ toStatus: status as DealStatus })}
                title={t(cfg.descKey)}
                className={[
                  "flex flex-col items-center gap-1 flex-shrink-0 transition-opacity",
                  isNext && !isCurrent ? "cursor-pointer hover:opacity-80" : "cursor-default",
                  isPending ? "opacity-50" : "",
                ].join(" ")}
              >
                {isDone || isCurrent ? (
                  <CheckCircle2
                    className={`w-6 h-6 ${isCurrent ? cfg.color : "text-success"}`}
                  />
                ) : (
                  <Circle
                    className={`w-6 h-6 ${
                      isNext ? "text-primary" : "text-muted-foreground/40"
                    }`}
                  />
                )}
                <span
                  className={`text-[10px] font-medium text-center whitespace-nowrap leading-tight ${
                    isCurrent ? cfg.color : "text-muted-foreground"
                  }`}
                >
                  {t(cfg.labelKey)}
                </span>
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`flex-1 h-px mx-1 mb-4 ${
                    isDone ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

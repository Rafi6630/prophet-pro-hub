import { useMemo, useState } from "react";
import { Check, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageMeta from "@/components/common/PageMeta";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "iraqproperty-subscription-plan";

export default function DashboardSubscriptionPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState(() => localStorage.getItem(STORAGE_KEY) ?? "starter");

  const plans = useMemo(
    () => [
      {
        id: "starter",
        title: t("account.starter"),
        price: "$0",
        description: t("account.starterDesc"),
        features: ["1 active listing profile", "Basic trust signals", "Buyer contact inbox"],
      },
      {
        id: "verified-agency",
        title: t("account.verifiedAgency"),
        price: "$149/mo",
        description: t("account.verifiedAgencyDesc"),
        features: ["Verified agency badge", "Featured placement", "Lead analytics and seller tools"],
      },
      {
        id: "investor-pro",
        title: t("account.investorPro"),
        price: "$299/mo",
        description: t("account.investorProDesc"),
        features: ["Priority investment dashboards", "Area intelligence snapshots", "Premium market reports"],
      },
    ],
    [t],
  );

  const choosePlan = (planId: string) => {
    localStorage.setItem(STORAGE_KEY, planId);
    setCurrentPlan(planId);
    toast({ title: t("account.planUpdated") });
  };

  return (
    <div className="container-app py-6 lg:py-10">
      <PageMeta title={`${t("account.subscriptionTitle")} | IraqProperty`} description={t("account.subscriptionSubtitle")} noIndex />
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{t("dashboard.subscription")}</p>
        <h1 className="mt-2 text-3xl font-extrabold">{t("account.subscriptionTitle")}</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("account.subscriptionSubtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const active = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`rounded-[1.75rem] border bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ${
                active ? "border-emerald-400 ring-2 ring-emerald-200" : "border-slate-200/80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    {index === 1 ? t("account.recommended") : t("account.currentPlan")}
                  </div>
                  <h2 className="mt-3 text-2xl font-extrabold">{plan.title}</h2>
                </div>
                {active ? <Crown className="h-6 w-6 text-amber-500" /> : null}
              </div>
              <div className="mt-4 text-4xl font-extrabold">{plan.price}</div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{plan.description}</p>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => choosePlan(plan.id)}
                variant={active ? "default" : "outline"}
                className="mt-8 w-full"
              >
                {active ? t("account.currentPlan") : t("account.choosePlan")}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

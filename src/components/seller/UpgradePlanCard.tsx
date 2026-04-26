import { Check, Zap, Building2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { planColorClass } from "@/lib/sellerMetrics";

interface UpgradePlanCardProps {
  currentPlan: string;
  onUpgrade: (plan: string) => void;
}

interface PlanOption {
  id: string;
  name: string;
  price: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  cta: string;
  highlight: boolean;
}

const PLANS: PlanOption[] = [
  {
    id: "free",
    name: "Free",
    price: "$0/mo",
    icon: Building2,
    features: [
      "Up to 5 listings",
      "Basic profile",
      "Email support",
      "Standard placement",
    ],
    cta: "Current Plan",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29/mo",
    badge: "Most Popular",
    icon: Zap,
    features: [
      "Up to 50 listings",
      "3 featured listings",
      "Verified badge",
      "WhatsApp button",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: "$99/mo",
    badge: "Best Value",
    icon: Star,
    features: [
      "Unlimited listings",
      "10 featured listings",
      "Trusted Pro badge",
      "Team members (3)",
      "Advanced analytics",
      "API access",
      "Dedicated manager",
    ],
    cta: "Upgrade to Agency",
    highlight: false,
  },
];

export default function UpgradePlanCard({ currentPlan, onUpgrade }: UpgradePlanCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden">
      <div className="bg-[#0a1220] p-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Subscription Plans</h3>
            <p className="text-slate-400 text-sm mt-0.5">Unlock more power for your listings</p>
          </div>
          <div className={`px-3 py-1 rounded-full border text-xs font-semibold ${planColorClass(currentPlan)}`}>
            {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
          </div>
        </div>
      </div>

      <div className="bg-[#0a1220] px-5 pb-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan.toLowerCase() === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-4 flex flex-col gap-3 border transition-all ${
                  plan.highlight
                    ? "bg-amber-400/10 border-amber-400/40 ring-1 ring-amber-400/40"
                    : isCurrent
                    ? "bg-white/10 border-white/20"
                    : "bg-white/5 border-white/10"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${plan.highlight ? "bg-amber-400 text-amber-900" : "bg-white/20 text-white"}`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <Icon className={`h-5 w-5 ${plan.highlight ? "text-amber-400" : "text-slate-400"}`} />
                  <span className="text-white font-bold">{plan.name}</span>
                </div>

                <div className="text-2xl font-extrabold text-white">
                  {plan.price}
                </div>

                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => !isCurrent && onUpgrade(plan.id)}
                  disabled={isCurrent}
                  className={`w-full rounded-xl text-sm font-semibold mt-2 ${
                    isCurrent
                      ? "bg-white/10 text-white/50 cursor-default"
                      : plan.highlight
                      ? "bg-amber-400 hover:bg-amber-500 text-amber-900"
                      : "bg-white/15 hover:bg-white/25 text-white"
                  }`}
                >
                  {isCurrent ? "Current Plan" : plan.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

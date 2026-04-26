import PageMeta from "@/components/common/PageMeta";
import UpgradePlanCard from "@/components/seller/UpgradePlanCard";
import { useSeller } from "@/hooks/useSeller";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Calendar } from "lucide-react";

export function SellerSubscriptionPage() {
  const { toast } = useToast();
  const { stats, loading: sellerLoading } = useSeller();
  const { user } = useAuth();

  const { data: subscription } = useQuery({
    queryKey: ["seller-subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions" as never)
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as {
        id: string;
        plan: string;
        status: string;
        listings_limit: number;
        featured_limit: number;
        ends_at: string | null;
      } | null;
    },
  });

  function handleUpgrade(plan: string) {
    toast({
      title: "Coming Soon",
      description: `The ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan will be available shortly. We'll notify you!`,
    });
  }

  const currentPlan = stats?.subscriptionPlan ?? subscription?.plan ?? "free";
  const planName = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

  const planFeatures: Record<string, string[]> = {
    free:   ["5 active listings", "Basic analytics", "Email support"],
    pro:    ["50 active listings", "3 featured listings", "Full analytics", "Verified badge", "Priority support"],
    agency: ["Unlimited listings", "10 featured listings", "Advanced analytics", "Trusted Pro badge", "API access", "Dedicated manager"],
  };

  const currentFeatures = planFeatures[currentPlan] ?? planFeatures.free;

  return (
    <>
      <PageMeta
        title="Subscription | IraqProperty Seller"
        description="Manage your seller subscription plan"
        noIndex
      />

      <div className="px-4 pt-8 pb-12 max-w-4xl mx-auto lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">Seller Portal</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Subscription</h1>
        </div>

        {/* Current plan info */}
        {!sellerLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-900">Current Plan</h2>
                <p className="text-sm text-slate-500">Your active subscription</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                currentPlan === "pro"    ? "bg-amber-100 text-amber-800 border-amber-300" :
                currentPlan === "agency" ? "bg-purple-100 text-purple-800 border-purple-300" :
                "bg-slate-100 text-slate-700 border-slate-300"
              }`}>
                {planName}
              </span>
            </div>

            <ul className="space-y-2 mb-4">
              {currentFeatures.map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>

            {subscription?.ends_at && (
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                <Calendar className="h-3.5 w-3.5" />
                Renews on {new Date(subscription.ends_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            )}
          </div>
        )}

        {/* Plan cards */}
        <UpgradePlanCard currentPlan={currentPlan} onUpgrade={handleUpgrade} />

        {/* FAQ */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your subscription at any time. Your plan remains active until the end of the billing period.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We will accept credit/debit cards and local payment options when subscriptions launch.",
              },
              {
                q: "What happens to my listings if I downgrade?",
                a: "Your listings remain visible, but if you exceed the free tier limit, older listings will be archived.",
              },
              {
                q: "When will paid plans be available?",
                a: "We're launching Pro and Agency plans very soon. Sign up to be notified first.",
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <p className="font-medium text-slate-800 text-sm">{q}</p>
                <p className="text-slate-500 text-sm mt-0.5">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default SellerSubscriptionPage;

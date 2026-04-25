import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp } from "lucide-react";
import PropertyCard, { PropertyCardSkeleton } from "@/components/PropertyCard";
import type { PropertyWithMedia } from "@/lib/property";

export default function Investment() {
  const { t } = useTranslation();
  useEffect(() => { document.title = `${t("investment.title")} — ${t("common.appName")}`; }, [t]);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["investment-deals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties")
        .select("*, property_images(*)")
        .eq("status", "active")
        .or("investment_deal.eq.true,investment_score.gte.65")
        .order("investment_score", { ascending: false, nullsFirst: false })
        .limit(60);
      return (data ?? []) as PropertyWithMedia[];
    },
  });

  return (
    <div className="container-app py-6 lg:py-10">
      <div className="bg-gradient-navy text-white rounded-3xl p-6 lg:p-10 mb-8 relative overflow-hidden">
        <div className="absolute -top-12 end-0 opacity-10 w-72 h-72 rounded-full bg-gold blur-3xl" />
        <span className="gold-badge mb-3">{t("nav.investment")}</span>
        <h1 className="text-3xl lg:text-4xl font-extrabold mt-2 max-w-2xl">{t("investment.title")}</h1>
        <p className="text-white/80 mt-2 max-w-xl">{t("investment.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
          : deals.length === 0
          ? (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-40" />
              {t("investment.noDeals")}
            </div>
          )
          : deals.map(p => <PropertyCard key={p.id} p={p} />)
        }
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MarketPrices() {
  const { t } = useTranslation();
  useEffect(() => { document.title = `${t("market.title")} — ${t("common.appName")}`; }, [t]);

  const { data: prices = [] } = useQuery({
    queryKey: ["market-prices"],
    queryFn: async () => {
      const { data } = await supabase
        .from("market_prices").select("*")
        .order("city").order("property_kind");
      return data ?? [];
    },
  });

  const cities = Array.from(new Set(prices.map(p => p.city)));

  return (
    <div className="container-app py-6 lg:py-10">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-extrabold">{t("market.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("market.subtitle")}</p>
      </div>

      {cities.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">{t("common.noResults")}</div>
      ) : (
        <div className="space-y-6">
          {cities.map(city => {
            const cityPrices = prices.filter(p => p.city === city);
            return (
              <div key={city} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                <div className="px-5 py-3 bg-secondary/50 border-b border-border">
                  <h2 className="font-bold text-lg">{city}</h2>
                </div>
                <div className="divide-y divide-border">
                  {cityPrices.map(p => {
                    const yoy = p.yoy_change_pct ? Number(p.yoy_change_pct) : 0;
                    const up = yoy >= 0;
                    return (
                      <div key={p.id} className="grid grid-cols-3 sm:grid-cols-4 gap-4 px-5 py-4 items-center hover:bg-secondary/30 transition">
                        <div>
                          <div className="font-semibold capitalize">{t(`property.kind.${p.property_kind}`)}</div>
                          <div className="text-xs text-muted-foreground">{p.sample_size} {t("market.samples")}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">{t("market.median")}</div>
                          <div className="text-lg font-extrabold">${Number(p.median_price_m2).toLocaleString()}<span className="text-xs font-normal text-muted-foreground">{t("common.perM2")}</span></div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">{t("market.yoy")}</div>
                          <div className={`flex items-center gap-1 font-bold ${up ? "text-trust" : "text-destructive"}`}>
                            {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {up ? "+" : ""}{yoy.toFixed(1)}%
                          </div>
                        </div>
                        <div className="hidden sm:block">
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div className={`h-full ${up ? "bg-trust" : "bg-destructive"}`}
                              style={{ width: `${Math.min(100, Math.abs(yoy) * 5)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifiedSellers() {
  const { t } = useTranslation();
  useEffect(() => { document.title = `${t("sellers.title")} — ${t("common.appName")}`; }, [t]);

  const { data: sellers = [] } = useQuery({
    queryKey: ["verified-sellers"],
    queryFn: async () => {
      // Find user_ids that own at least one verified listing, plus a sample listing
      const { data: props } = await supabase
        .from("properties")
        .select("user_id, city, verification_level")
        .in("verification_level", ["verified", "premium"])
        .eq("status", "active");

      if (!props || props.length === 0) return [];

      const counts = new Map<string, { count: number; cities: Set<string>; tier: string }>();
      props.forEach(p => {
        const existing = counts.get(p.user_id) ?? { count: 0, cities: new Set<string>(), tier: "verified" };
        existing.count++;
        existing.cities.add(p.city);
        if (p.verification_level === "premium") existing.tier = "premium";
        counts.set(p.user_id, existing);
      });

      const userIds = Array.from(counts.keys());
      const { data: profiles } = await supabase
        .from("profiles").select("user_id, display_name, avatar_url, city")
        .in("user_id", userIds);

      return (profiles ?? []).map(pr => {
        const c = counts.get(pr.user_id)!;
        return {
          ...pr,
          listingCount: c.count,
          cities: Array.from(c.cities),
          tier: c.tier,
        };
      });
    },
  });

  return (
    <div className="container-app py-6 lg:py-10">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-extrabold flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-trust" />
          {t("sellers.title")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t("sellers.subtitle")}</p>
      </div>

      {sellers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
          {t("common.noResults")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sellers.map(s => (
            <div key={s.user_id} className="bg-card rounded-2xl p-5 border border-border shadow-card card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-navy text-white grid place-items-center text-lg font-extrabold">
                  {s.display_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold truncate">{s.display_name ?? "—"}</h3>
                  <span className={s.tier === "premium" ? "gold-badge" : "trust-badge"}>
                    <ShieldCheck className="w-3 h-3" />
                    {t(s.tier === "premium" ? "property.premium" : "property.verified")}
                  </span>
                </div>
              </div>
              {s.cities.length > 0 && (
                <div className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3" />
                  {s.cities.join(", ")}
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm font-bold">{s.listingCount} <span className="text-muted-foreground font-normal">{t("sellers.listings")}</span></span>
                <Link to={`/buy?seller=${s.user_id}`}>
                  <Button variant="outline" size="sm">{t("sellers.view")}</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

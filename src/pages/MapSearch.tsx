import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Map as MapIcon, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice, type PropertyWithMedia } from "@/lib/property";

export default function MapSearch() {
  const { t } = useTranslation();
  useEffect(() => { document.title = `${t("map.title")} — ${t("common.appName")}`; }, [t]);

  const { data: properties = [] } = useQuery({
    queryKey: ["map-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("properties").select("*, property_images(*)")
        .eq("status", "active")
        .not("latitude", "is", null).not("longitude", "is", null)
        .limit(100);
      return (data ?? []) as PropertyWithMedia[];
    },
  });

  return (
    <div className="container-app py-6 lg:py-10">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-extrabold">{t("map.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("map.subtitle")}</p>
      </div>

      <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-gradient-to-br from-secondary to-muted border border-border grid place-items-center">
        <div className="text-center">
          <MapIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground font-semibold">{t("map.comingSoon")}</p>
        </div>
        {/* Decorative pins */}
        <div className="absolute inset-0 pointer-events-none">
          {properties.slice(0, 8).map((p, i) => (
            <div
              key={p.id}
              className="absolute w-8 h-8 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg animate-pulse"
              style={{ top: `${15 + (i * 9) % 70}%`, left: `${10 + (i * 13) % 80}%` }}
            >
              <MapPin className="w-4 h-4" />
            </div>
          ))}
        </div>
      </div>

      {properties.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.slice(0, 9).map(p => (
            <Link key={p.id} to={`/property/${p.id}`} className="bg-card rounded-2xl p-4 border border-border shadow-card card-hover flex gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                <img src={p.property_images?.[0]?.url ?? "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200&q=80"} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm line-clamp-1">{p.title_ar || p.title}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {p.city}
                </p>
                <p className="text-base font-extrabold text-primary mt-1">{formatPrice(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

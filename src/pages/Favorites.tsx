import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyCard, { PropertyCardSkeleton } from "@/components/PropertyCard";
import { useAuth } from "@/hooks/useAuth";
import type { PropertyWithMedia } from "@/lib/property";

export default function Favorites() {
  const { t } = useTranslation();
  const { user } = useAuth();
  useEffect(() => { document.title = `${t("favorites.title")} — ${t("common.appName")}`; }, [t]);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["favorites-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: favs } = await supabase
        .from("favorites").select("property_id")
        .eq("user_id", user!.id);
      const ids = (favs ?? []).map(f => f.property_id);
      if (ids.length === 0) return [];
      const { data } = await supabase
        .from("properties").select("*, property_images(*)")
        .in("id", ids);
      return (data ?? []) as PropertyWithMedia[];
    },
  });

  return (
    <div className="container-app py-6 lg:py-10">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-extrabold flex items-center gap-2">
          <Heart className="w-7 h-7 fill-destructive text-destructive" />
          {t("favorites.title")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{t("favorites.subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground mb-4">{t("favorites.empty")}</p>
          <Link to="/buy"><Button>{t("favorites.browse")}</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map(p => <PropertyCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}

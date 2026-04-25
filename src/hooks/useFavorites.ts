import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useFavorites() {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setIds(new Set()); return; }
    setLoading(true);
    const { data } = await supabase
      .from("favorites")
      .select("property_id")
      .eq("user_id", user.id);
    setIds(new Set((data ?? []).map(f => f.property_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = useCallback(async (propertyId: string) => {
    if (!user) return false;
    if (ids.has(propertyId)) {
      await supabase.from("favorites").delete()
        .eq("user_id", user.id).eq("property_id", propertyId);
      setIds(prev => { const n = new Set(prev); n.delete(propertyId); return n; });
      return false;
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: propertyId });
      setIds(prev => new Set(prev).add(propertyId));
      return true;
    }
  }, [user, ids]);

  return { ids, isFavorite: (id: string) => ids.has(id), toggle, refresh, loading };
}

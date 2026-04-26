import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Subscribe first so we never miss an auth event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Seed the initial value from the persisted session; the subscription
    // above will receive a SIGNED_IN / INITIAL_SESSION event right after,
    // so this call just avoids the brief loading=true flicker on cold load.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(prev => prev ?? (session?.user ?? null));
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signOut };
}

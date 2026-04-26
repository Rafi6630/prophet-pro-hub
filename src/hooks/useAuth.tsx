import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) fetchProfile(data.session.user.id);
      else setLoading(false);
    });
  }, []);

  const fetchProfile = async (id) => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
      setProfile(data);
    } catch {
      setProfile({ active_role: "buyer", available_roles: ["buyer"] });
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (role) => {
    if (!user) return;
    await supabase.from("profiles").update({ active_role: role }).eq("id", user.id);
    setProfile((prev) => ({ ...prev, active_role: role }));
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

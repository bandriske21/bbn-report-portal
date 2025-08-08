import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthCtx = createContext({ user: null, role: null, loading: true });

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, role: null, loading: true });

  async function loadProfile(user) {
    if (!user) return setState({ user: null, role: null, loading: false });

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    setState({ user, role: data?.role ?? null, loading: false });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      loadProfile(data.session?.user || null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      loadProfile(session?.user || null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}


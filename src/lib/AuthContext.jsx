import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
// src/lib/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      setRole(data?.role || "client");
    } catch {
      setRole("client");
    }
  }

  useEffect(() => {
    let mounted = true;

    // 1) Restore on first load
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const session = data.session;
      setUser(session?.user ?? null);
      if (session?.user?.id) await loadProfile(session.user.id);
      setLoading(false);
    });

    // 2) Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.id) await loadProfile(session.user.id);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


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


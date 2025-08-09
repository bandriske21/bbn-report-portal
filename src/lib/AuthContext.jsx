// src/lib/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext({ user: null, role: "client", loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(true);

  async function loadRole(userId) {
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

    // Restore session on load
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const session = data.session;
      setUser(session?.user ?? null);
      if (session?.user?.id) await loadRole(session.user.id);
      setLoading(false);

      // Simple debug
      console.log("[Auth] initial session", session);
    });

    // Listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      console.log("[Auth] onAuthStateChange", _evt, session);
      setUser(session?.user ?? null);
      if (session?.user?.id) await loadRole(session.user.id);
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

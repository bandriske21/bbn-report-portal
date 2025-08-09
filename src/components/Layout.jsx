// src/components/Layout.jsx
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`block rounded px-2 py-2 transition ${
        active ? "bg-gray-100 font-medium text-ink" : "hover:bg-gray-50 text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, role, loading } = useAuth();

  const canUpload = role === "admin" || role === "uploader";

  // --- MAGIC LINK TOKEN CONSUMER ---
  // Handles both:  #access_token=...   and   /#/route#access_token=...
  useEffect(() => {
    const fullHash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : "";

    // Support double-hash by taking the part after the second '#', if present
    const parts = fullHash.split("#");
    const tokenFragment = parts.length > 1 ? parts[1] : parts[0];

    const qp = new URLSearchParams(tokenFragment);
    const access_token = qp.get("access_token");
    const refresh_token = qp.get("refresh_token");

    async function consume() {
      if (access_token && refresh_token) {
        try {
          await supabase.auth.setSession({ access_token, refresh_token });
        } finally {
          // Clean URL and land on /client
          window.history.replaceState({}, "", `${window.location.origin}/#/client`);
          navigate("/client", { replace: true });
        }
      }
    }
    consume();
  }, [navigate]);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (_) {
      // ignore
    } finally {
      // Hard clear any cached tokens if the SDK ever gets stuck
      try {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith("sb-") && k.includes("auth-token")) {
            localStorage.removeItem(k);
          }
        });
        sessionStorage.clear();
      } catch {}
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-ink">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/client" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gray-900" aria-hidden />
            <span className="text-lg font-semibold">
              BBN Consulting — Report Portal
            </span>
          </Link>

          <div>
            {!user ? (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 truncate max-w-[220px]">
                  {user.email}
                </span>
                <span className="text-xs bg-gray-100 text-ink px-2 py-1 rounded-lg capitalize">
                  {loading ? "…" : role || "client"}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-56 bg-white rounded-2xl shadow-card p-4 h-max">
          <nav className="space-y-1">
            <NavLink to="/client" label="Client Home" active={pathname === "/client"} />

            <NavLink
              to="/jobs"
              label="Jobs"
              active={pathname === "/jobs" || pathname.startsWith("/jobs/")}
            />

            {/* "+ Add Job" opens the Jobs page with the add modal via querystring */}
            <Link
              to={{ pathname: "/jobs", search: "?add=1" }}
              className="block rounded px-2 py-2 transition hover:bg-gray-50 text-ink"
              title="Add a new job"
            >
              + Add Job
            </Link>

            <NavLink to="/reports" label="All Reports" active={pathname === "/reports"} />

            {/* Upload only visible to admin/uploader */}
            {user && canUpload && (
              <NavLink to="/" label="Upload" active={pathname === "/"} />
            )}

            {/* Login link hidden when signed in */}
            {!user && <NavLink to="/login" label="Login" active={pathname === "/login"} />}
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

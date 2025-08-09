// src/components/Layout.jsx
import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

  // GLOBAL TOKEN CONSUMER: runs once on load, on any route
  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : "";
    const qp = new URLSearchParams(hash);
    const access_token = qp.get("access_token");
    const refresh_token = qp.get("refresh_token");

    async function consume() {
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
        // Clean URL and go to the Client Home
        window.history.replaceState({}, "", `${window.location.origin}/#/client`);
        navigate("/client", { replace: true });
      }
    }
    consume();
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
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

          <div className="ml-auto">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 truncate max-w-[240px]">
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
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
              >
                Login
              </Link>
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
            <NavLink to="/reports" label="All Reports" active={pathname === "/reports"} />
            {user && canUpload && (
              <NavLink to="/" label="Upload" active={pathname === "/"} />
            )}
            {!user && <NavLink to="/login" label="Login" active={pathname === "/login"} />}
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

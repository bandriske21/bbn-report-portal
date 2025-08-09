// src/components/Layout.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
// in src/components/Layout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

function Header() {
  const { user } = useAuth();

  return (
    <div className="ml-auto">
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-subink truncate max-w-[220px]">
            {user.email}
          </span>
          <button
            className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.hash = "/login";
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <a
          href="#/login"
          className="rounded-lg bg-accent text-white px-4 py-2 hover:opacity-90"
        >
          Login
        </a>
      )}
    </div>
  );
}


export default function Layout({ children }) {
  const navigate = useNavigate();

  // GLOBAL TOKEN CONSUMER: runs on every route once
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
        // Clean the URL & send user into app
        window.history.replaceState({}, "", `${window.location.origin}/#/client`);
        navigate("/client", { replace: true });
      }
    }
    consume();
  }, [navigate]);

  // ...rest of your layout (header/sidebar/etc)
}


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
                <span className="text-sm text-gray-700">{user.email}</span>
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
            <NavLink to="/reports" label="All Reports" active={pathname === "/reports"} />

            {/* Upload only for admin/uploader */}
            {user && canUpload && (
              <NavLink to="/" label="Upload" active={pathname === "/"} />
            )}

            {/* Hide Login when signed in */}
            {!user && <NavLink to="/login" label="Login" active={pathname === "/login"} />}
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

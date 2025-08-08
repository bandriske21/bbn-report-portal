// src/components/Layout.jsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";

function NavItem({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`block w-full text-left px-3 py-2 rounded-lg transition
        ${active ? "bg-gray-100 text-ink font-medium" : "text-ink hover:bg-gray-50"}`}
    >
      {label}
    </Link>
  );
}

export default function Layout({ children }) {
  const { user, role, loading } = useAuth();
  const { pathname } = useLocation();
  const isUploader = role === "admin" || role === "uploader";

  async function signOut() {
    await supabase.auth.signOut();
    window.location.hash = "#/login";
  }

  return (
    <div className="min-h-screen bg-gray-50 text-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/70 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Brand */}
          <Link to="/client" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900" aria-hidden />
            <span className="font-semibold">BBN Consulting — Report Portal</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-subink hidden sm:inline">
                  {user.email}
                </span>
                <span className="text-xs bg-gray-100 text-ink px-2 py-1 rounded-lg capitalize">
                  {loading ? "…" : role || "client"}
                </span>
                <button
                  onClick={signOut}
                  className="hidden sm:inline-flex bg-accent text-white px-3 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-accent text-white px-3 py-2 rounded-lg hover:opacity-90 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar + content */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-white rounded-2xl shadow-card p-4 h-max">
          <nav className="space-y-1">
            <NavItem to="/client" label="Client Home" active={pathname === "/client"} />
            <NavItem to="/jobs" label="Jobs" active={pathname === "/jobs" || pathname.startsWith("/jobs/")} />
            <NavItem to="/reports" label="All Reports" active={pathname === "/reports"} />
            {isUploader && <NavItem to="/" label="Upload" active={pathname === "/"} />}
            {!user && <NavItem to="/login" label="Login" active={pathname === "/login"} />}
          </nav>

          {/* Mobile signout */}
          {user && (
            <button
              onClick={signOut}
              className="mt-4 w-full lg:hidden bg-accent text-white px-3 py-2 rounded-lg hover:opacity-90 transition"
            >
              Sign out
            </button>
          )}
        </aside>

        {/* Main page */}
        <main className="space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

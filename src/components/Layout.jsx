import { Link, useLocation } from "react-router-dom";

const NavLink = ({ to, label }) => {
  const { pathname, hash } = useLocation();
  // Works for BrowserRouter or HashRouter
  const current = (hash || pathname).replace(/^#/, "");
  const active = current === to || current.startsWith(to + "/");
  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-lg transition
        ${active ? "bg-white text-ink shadow" : "text-ink/70 hover:text-ink hover:bg-white/70"}`}
    >
      {label}
    </Link>
  );
};

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 p-5">
          <div className="mb-6">
            <div className="text-xl font-semibold tracking-tight">BBN Consulting</div>
            <div className="text-sm text-subink">Report Portal</div>
          </div>
          <nav className="space-y-2">
            <NavLink to="/jobs" label="Jobs" />
            <NavLink to="/reports" label="All Reports" />
            <NavLink to="/" label="Upload" />
          </nav>
          <div className="mt-8 text-xs text-subink">
            Light theme • Apple style
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <h1 className="text-xl font-semibold">Dashboard</h1>
              <div className="flex items-center gap-3">
                <input
                  type="search"
                  placeholder="Search…"
                  className="hidden md:block w-64 px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <div className="w-8 h-8 rounded-full bg-gray-200" />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6 fade-in">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

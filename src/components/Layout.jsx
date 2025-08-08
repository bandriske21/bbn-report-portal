// src/components/Layout.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">
              BBN Consulting — Report Portal
            </span>
          </div>

          <div>
            {!user ? (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">{user.email}</span>
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
      <div className="max-w-7xl mx-auto px-4 py-6 flex space-x-6">
        {/* Sidebar */}
        <aside className="w-48 bg-white rounded-2xl shadow-card p-4 space-y-1">
          <Link to="/client" className="block hover:bg-gray-100 rounded px-2 py-1">
            Client Home
          </Link>
          <Link to="/jobs" className="block hover:bg-gray-100 rounded px-2 py-1">
            Jobs
          </Link>
          <Link to="/reports" className="block hover:bg-gray-100 rounded px-2 py-1">
            All Reports
          </Link>
          <Link to="/login" className="block hover:bg-gray-100 rounded px-2 py-1">
            Login
          </Link>
        </aside>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

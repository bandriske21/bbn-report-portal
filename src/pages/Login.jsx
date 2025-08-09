// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");

  // Extra safety: if a magic link lands here with tokens in the hash, consume them.
  useEffect(() => {
    const h = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : "";
    const qp = new URLSearchParams(h);
    const access_token = qp.get("access_token");
    const refresh_token = qp.get("refresh_token");

    async function finishMagicLink() {
      if (access_token && refresh_token) {
        try {
          await supabase.auth.setSession({ access_token, refresh_token });
          // Clean URL & move the user into the app
          window.history.replaceState({}, "", `${window.location.origin}/#/client`);
          navigate("/client", { replace: true });
        } catch (e) {
          console.error(e);
        }
      }
    }
    finishMagicLink();
  }, [navigate]);

  async function handleSendLink(e) {
    e.preventDefault();
    setSending(true);
    setSentTo("");
    setError("");

    try {
      const redirectTo = `${window.location.origin}`; // IMPORTANT: no route here
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;
      setSentTo(email);
    } catch (err) {
      console.error(err);
      setError(err.message ?? "Failed to send magic link.");
    } finally {
      setSending(false);
    }
  }

  // Already signed in → show quick actions
  if (user) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h1 className="text-2xl font-semibold mb-2">You’re signed in</h1>
          <p className="text-subink mb-6">{user.email}</p>

          <div className="flex items-center gap-3">
            <Link
              to="/client"
              className="inline-flex items-center rounded-lg bg-accent text-white px-4 py-2 hover:opacity-90 transition"
            >
              Go to Client Home
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 transition"
            >
              View Jobs
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not signed in → show magic link form
  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h1 className="text-2xl font-semibold mb-1">Sign in to BBN</h1>
        <p className="text-subink mb-6">
          Enter your email and we’ll send you a secure magic link.
        </p>

        <form onSubmit={handleSendLink}>
          <label className="block mb-2 text-sm font-medium text-subink">
            Work email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="you@example.com"
          />

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-lg bg-accent text-white px-4 py-2 hover:opacity-90 transition disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {sentTo && (
          <p className="mt-4 text-sm text-green-700">
            Magic link sent to <span className="font-medium">{sentTo}</span>.  
            Please check your inbox.
          </p>
        )}
      </div>
    </div>
  );
}

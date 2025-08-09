// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // If already signed in, skip login
  useEffect(() => {
    if (user) navigate("/client", { replace: true });
  }, [user, navigate]);

  async function sendMagicLink(e) {
    e.preventDefault();
    setError("");
    setSent(false);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setSending(true);
    try {
      const redirectTo = `${window.location.origin}/#/client`;

      // Supabase v2 API
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (signInError) throw signInError;
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send magic link.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-semibold mb-2">Sign in to BBN</h1>
      <p className="text-subink mb-6">
        Enter your email and we’ll send you a secure magic link.
      </p>

      <form onSubmit={sendMagicLink} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-subink">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send magic link"}
        </button>
      </form>

      {sent && (
        <div className="mt-4 text-sm text-green-700">
          Magic link sent. Please check your inbox.
        </div>
      )}
      {error && (
        <div className="mt-4 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

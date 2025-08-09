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
      // IMPORTANT: this is where the magic-link will redirect back to.
      // Our Layout token-consumer handles tokens whether the hash is:
      //   #access_token=...   or   /#/client#access_token=...
      const redirectTo = `${window.location.origin}/#/client`;

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (signInError) throw signInError;

      console.log("[Login] magic link requested ->", redirectTo);
      setSent(true);
    } catch (err) {
      console.error("[Login] signInWithOtp error", err);
      // Common gotcha: Redirect URL not whitelisted in Supabase Auth Settings
      setError(
        err?.message ||
          "Failed to send magic link. Please check your email and try again."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-start justify-center pt-12">
      <div className="bg-white rounded-2xl shadow-card p-6 w-full max-w-md">
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
            Magic link sent. Please check your inbox. You can close this tab.
          </div>
        )}
        {error && (
          <div className="mt-4 text-sm text-red-600">
            {error}
            <div className="text-subink mt-1">
              Tip: Make sure your Supabase <em>Authentication → URL Configuration</em>{" "}
              includes this exact URL in “Redirect URLs”:
              <pre className="mt-1 p-2 bg-gray-50 rounded">
                {window.location.origin}/
              </pre>
              (and if you use hash routing, the magic link will append tokens
              after the <code>#</code>.)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// src/pages/Login.jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSendLink(e) {
    e.preventDefault();
    setError("");
    setSent(false);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const redirectTo = `${window.location.origin}/#/client`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setError(error.message || "Something went wrong. Please try again.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* space under the header */}
      <div className="mt-12" />

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h1 className="text-xl font-semibold">Sign in to BBN</h1>
          <p className="text-subink text-sm mt-1">
            Enter your email and we’ll send you a secure magic link.
          </p>

          <form className="mt-4 space-y-3" onSubmit={handleSendLink}>
            <label className="block text-sm font-medium text-subink">
              Email address
            </label>
            <input
              type="email"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition mt-2"
            >
              Send magic link
            </button>
          </form>

          {sent && (
            <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
              Link sent! Please check your inbox.
            </div>
          )}
          {error && (
            <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-subink mt-3">
          Having trouble? Contact BBN support.
        </p>
      </div>
    </div>
  );
}

// src/pages/Login.jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function sendLink(e) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Adjust redirectTo if you’re using a custom domain
        emailRedirectTo: `${window.location.origin}/#/client`,
      },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Login</h1>
      <p className="text-subink mb-4">
        Enter your email and we’ll send you a magic link.
      </p>

      {sent ? (
        <div className="text-green-600">Check your email for the magic link.</div>
      ) : (
        <form onSubmit={sendLink} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Send magic link
          </button>
        </form>
      )}
    </div>
  );
}

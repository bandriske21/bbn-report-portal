// src/pages/Login.jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

async function handleSendLink(e) {
  e.preventDefault();
  setMessage("");
  setError("");

  if (!email.trim()) {
    setError("Please enter your email.");
    return;
  }

  const redirectTo = `${window.location.origin}/#/client`; // after clicking the email link

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    setError(error.message || "Something went wrong.");
  } else {
    setMessage("Check your inbox for a secure link.");
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Sign in to BBN</h1>
        <p className="text-subink mb-6">
          Enter your email and we'll send you a secure magic link.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send magic link"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-subink text-center">{message}</p>
        )}
      </div>
    </div>
  );
}

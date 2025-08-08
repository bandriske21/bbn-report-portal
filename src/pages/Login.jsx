import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function sendLink(e) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/#/client" },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-3">Login</h2>

      {user ? (
        <>
          <p className="text-subink mb-4">Signed in as {user.email}</p>
          <button onClick={logout} className="bg-accent text-white px-4 py-2 rounded-lg">
            Sign out
          </button>
        </>
      ) : sent ? (
        <p className="text-ink">Check your email — we sent you a magic link.</p>
      ) : (
        <form onSubmit={sendLink} className="space-y-3">
          <input
            type="email"
            required
            placeholder="you@demex.com.au"
            className="border border-gray-200 rounded-lg px-3 py-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="bg-accent text-white px-4 py-2 rounded-lg w-full">
            Send magic link
          </button>
        </form>
      )}
    </div>
  );
}

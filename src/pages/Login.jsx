import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errMsg, setErrMsg] = useState("");

  // If already signed in, skip login
  useEffect(() => {
    if (user) navigate("/client", { replace: true });
  }, [user, navigate]);

  async function sendMagicLink(e) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");

    if (!email) {
      setStatus("error");
      setErrMsg("Please enter your email address.");
      return;
    }

    try {
      const redirectTo = `${window.location.origin}/#/client`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          // uncomment if you want auto-provision:
          // shouldCreateUser: true,
        },
      });

      if (error) {
        console.error("[Login] sendMagicLink error:", error);
        setStatus("error");
        setErrMsg(error.message || "Failed to send magic link.");
        return;
      }

      setStatus("sent");
    } catch (err) {
      console.error("[Login] unexpected error:", err);
      setStatus("error");
      setErrMsg(
        err?.message || "Unexpected error sending magic link. Please try again."
      );
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
          disabled={status === "sending"}
          className="w-full bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send magic link"}
        </button>
      </form>

      {status === "sent" && (
        <div className="mt-4 text-sm text-green-700">
          Magic link sent. Please check your inbox and spam folder.
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 text-sm text-red-600">{errMsg}</div>
      )}

      {/* Helpful hint */}
      <div className="mt-6 text-xs text-subink">
        Tip: Your redirect is{" "}
        <code className="px-1 py-0.5 bg-gray-100 rounded">
          {`${window.location.origin}/#/client`}
        </code>
      </div>
    </div>
  );
}

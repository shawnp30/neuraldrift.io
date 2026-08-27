"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"request" | "update">("request");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setUpdated(true);
    setLoading(false);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (mode === "update") {
    return (
      <div className="nh-section flex min-h-screen flex-col items-center justify-center">
        <div className="nh-newsletter-box w-full max-w-md !p-12">
          <h1 className="mb-2 text-2xl font-bold text-white">Set a new password</h1>
          <p className="mb-8 text-sm text-zinc-400">
            Choose a new password for your account.
          </p>

          {updated ? (
            <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-2">
              Password updated. Redirecting…
            </p>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleUpdatePassword}>
              <input
                type="password"
                placeholder="New password"
                className="nh-nl-input !w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                  {error}
                </p>
              )}
              <button type="submit" disabled={loading} className="nh-nl-btn mt-2 !w-full disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Updating…" : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="nh-section flex min-h-screen flex-col items-center justify-center">
      <div className="nh-newsletter-box w-full max-w-md !p-12">
        <h1 className="mb-2 text-2xl font-bold text-white">Reset Password</h1>
        <p className="mb-8 text-sm text-zinc-400">
          Enter your email to receive a reset link.
        </p>

        {sent ? (
          <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-2">
            Check <span className="text-white">{email}</span> for a reset link.
          </p>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleRequestReset}>
            <input
              type="email"
              placeholder="Email Address"
              className="nh-nl-input !w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} className="nh-nl-btn mt-2 !w-full disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

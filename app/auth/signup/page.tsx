"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="nh-section flex min-h-screen flex-col items-center justify-center">
        <div className="nh-newsletter-box w-full max-w-md !p-12 text-center">
          <h1 className="mb-2 text-2xl font-bold text-white">Check your email</h1>
          <p className="text-sm text-zinc-400">
            We sent a confirmation link to <span className="text-white">{email}</span>. Click it to activate your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="nh-section flex min-h-screen flex-col items-center justify-center">
      <div className="nh-newsletter-box w-full max-w-md !p-12">
        <h1 className="mb-2 text-2xl font-bold text-white">Join NeuralDrift</h1>
        <p className="mb-8 text-sm text-zinc-400">
          Create an account to save workflows and interact with templates.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            className="nh-nl-input !w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Password"
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
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 mt-8 text-center text-xs text-zinc-500">
          Already have an account?{" "}
          <a href="/auth/login" className="text-accent hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

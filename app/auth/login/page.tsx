"use client";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg bg-grid flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="md" />
          <p className="text-muted text-sm mt-2">Sign in to your workspace</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="space-y-4">
            <div>
              <label className="font-mono text-xs text-muted tracking-widest uppercase block mb-2">Email</label>
              <input type="email" className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/50 transition-colors" placeholder="you@example.com" />
            </div>
            <div>
              <label className="font-mono text-xs text-muted tracking-widest uppercase block mb-2">Password</label>
              <input type="password" className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/50 transition-colors" placeholder="••••••••" />
            </div>
            <button className="w-full bg-accent text-black py-2.5 rounded font-semibold text-sm hover:opacity-85 transition-opacity mt-2">
              Sign In
            </button>
          </div>
          <p className="text-center text-xs text-muted mt-6">
            No account? <Link href="/auth/signup" className="text-accent hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

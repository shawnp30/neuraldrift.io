"use client";
import { useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    // Simulate submission — wire to Resend/ConvertKit later
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setEmail("");
  };

  return (
    <section className="py-20 px-10 max-w-7xl mx-auto">
      <div className="relative bg-gradient-to-br from-surface to-card border border-border rounded-2xl p-16 overflow-hidden text-center">

        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[radial-gradient(ellipse,rgba(0,229,255,0.06)_0%,transparent_70%)] pointer-events-none" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-dots opacity-40 pointer-events-none rounded-2xl" />

        <div className="relative">
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">{"// Weekly Drop"}</p>
          <h2 className="font-syne text-4xl font-black tracking-tight text-white mb-4">
            Stay ahead of the<br />AI workflow curve.
          </h2>
          <p className="text-muted max-w-lg mx-auto leading-relaxed mb-10 font-light">
            New guides, LoRA releases, workflow drops, and hardware benchmarks — every week. No spam, unsubscribe anytime.
          </p>

          {status === "success" ? (
            <div className="inline-flex items-center gap-3 bg-[#10b981]/10 border border-[#10b981]/25 rounded-xl px-8 py-4">
              <span className="text-[#10b981] text-lg">✓</span>
              <div className="text-left">
                <p className="font-syne font-bold text-white text-sm">You&apos;re in.</p>
                <p className="font-mono text-xs text-muted mt-0.5">First drop lands next week.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="flex-1 bg-bg border border-border rounded-lg px-5 py-3.5 text-sm text-text placeholder-muted focus:outline-none focus:border-accent/50 font-mono transition-colors"
              />
              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="bg-accent text-black px-6 py-3.5 rounded-lg font-semibold text-sm hover:opacity-85 transition-opacity whitespace-nowrap disabled:opacity-50"
              >
                {status === "loading" ? "..." : "Subscribe →"}
              </button>
            </div>
          )}

          {status === "error" && (
            <p className="font-mono text-xs text-[#ef4444] mt-3">Something went wrong. Try again.</p>
          )}

          {/* Social proof hidden as requested */}
        </div>
      </div>
    </section>
  );
}

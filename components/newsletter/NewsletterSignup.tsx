"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import type { NewsletterSource } from "@/lib/newsletter";

type Status = "idle" | "loading" | "success" | "invalid" | "rate_limited" | "error";

const COPY = "Execution-tested workflows, compatibility findings, ComfyUI changes, and practical local-AI guidance — delivered weekly.";
const SUCCESS_COPY = "You're on the list. Watch your inbox for NeuralDrift Weekly.";
const INVALID_COPY = "Enter a valid email or try again later.";
const RATE_LIMIT_COPY = "Too many attempts. Please try again shortly.";
const ERROR_COPY = "We couldn't complete the signup. Please try again.";

function errorCopyFor(status: Status): string | null {
  if (status === "invalid") return INVALID_COPY;
  if (status === "rate_limited") return RATE_LIMIT_COPY;
  if (status === "error") return ERROR_COPY;
  return null;
}

export function NewsletterSignup({ source, variant = "nd" }: { source: NewsletterSource; variant?: "nd" | "panel" }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const containerRef = useRef<HTMLElement | null>(null);
  const ctaViewTracked = useRef(false);

  const configured = process.env.NEXT_PUBLIC_NEWSLETTER_PROVIDER === "kit";

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (ctaViewTracked.current) return;
        if (entries.some((entry) => entry.isIntersecting)) {
          ctaViewTracked.current = true;
          trackEvent(ANALYTICS_EVENTS.newsletterCtaView, { source_page: source, source_component: "NewsletterSignup" });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (status === "loading") return;
    trackEvent(ANALYTICS_EVENTS.newsletterSignupAttempt, { source_page: source, source_component: "NewsletterSignup" });
    if (!configured || !email.includes("@")) {
      setStatus("invalid");
      return;
    }
    setStatus("loading");
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source, company }),
      });
      if (!response.ok) {
        setStatus(response.status === 429 ? "rate_limited" : response.status === 400 ? "invalid" : "error");
        return;
      }
      setStatus("success");
      trackEvent(ANALYTICS_EVENTS.newsletterSignup, { source_page: source, source_component: "NewsletterSignup" });
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  const honeypot = (
    <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
      <label htmlFor={`newsletter-company-${id}`}>Company</label>
      <input
        id={`newsletter-company-${id}`}
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
    </div>
  );

  const emailId = `newsletter-email-${id}`;
  const privacyId = `newsletter-privacy-${id}`;
  const errorCopy = errorCopyFor(status);

  if (variant === "panel") {
    return (
      <section ref={containerRef} className="rounded-3xl border border-[#2a2a30] bg-[#111113] p-8 md:p-12 text-center">
        <p className="font-mono text-[10px] text-[#7c6af7] tracking-widest uppercase mb-4 font-[800]">{"// NeuralDrift Weekly"}</p>
        <h2 className="font-syne text-3xl md:text-4xl font-[900] text-white mb-4 tracking-tight">Get NeuralDrift Weekly</h2>
        <p className="text-[#8888a0] max-w-lg mx-auto leading-relaxed mb-8">{COPY}</p>

        {!configured ? (
          <p className="font-mono text-xs text-[#8888a0]">Newsletter launching soon. Signup is not active yet.</p>
        ) : status === "success" ? (
          <p className="text-[#4ade80] font-semibold">{SUCCESS_COPY}</p>
        ) : (
          <form
            className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto"
            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          >
            <label htmlFor={emailId} className="sr-only">Email address</label>
            {honeypot}
            <input
              id={emailId}
              type="email"
              placeholder="your@email.com"
              required
              aria-describedby={privacyId}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-black/40 border border-[#2a2a30] rounded-xl px-5 py-3.5 text-sm text-[#e8e8f0] placeholder-[#8888a0] focus:outline-none focus:border-[#7c6af7]/50 font-mono transition-colors"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-[#7c6af7] text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:opacity-85 transition-opacity whitespace-nowrap disabled:opacity-50"
            >
              {status === "loading" ? "..." : "Get NeuralDrift Weekly →"}
            </button>
          </form>
        )}

        <p id={privacyId} className="font-mono text-xs text-[#8888a0] mt-4">
          No spam, unsubscribe anytime. See our <Link href="/privacy" className="text-[#7c6af7] hover:underline">privacy policy</Link>.
        </p>
        {errorCopy && <p role="alert" className="font-mono text-xs text-[#ef4444] mt-3">{errorCopy}</p>}
      </section>
    );
  }

  return (
    <aside ref={containerRef} className="nd-card nd-card-body" aria-labelledby={`newsletter-heading-${id}`}>
      <p className="nd-eyebrow">NEURALDRIFT WEEKLY</p>
      <h2 id={`newsletter-heading-${id}`}>Get NeuralDrift Weekly</h2>
      <p>{COPY}</p>

      {!configured ? (
        <p className="nd-subtle">Newsletter launching soon. Signup is not active yet.</p>
      ) : status === "success" ? (
        <p className="nd-subtle">{SUCCESS_COPY}</p>
      ) : (
        <form className="nd-actions" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <label htmlFor={emailId} className="sr-only">Email address</label>
          {honeypot}
          <input
            id={emailId}
            type="email"
            placeholder="your@email.com"
            required
            aria-describedby={privacyId}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: 1, minWidth: "12rem" }}
          />
          <button type="submit" className="nd-button" disabled={status === "loading"}>
            {status === "loading" ? "..." : "Get NeuralDrift Weekly →"}
          </button>
        </form>
      )}

      <p id={privacyId} className="nd-subtle">
        No spam, unsubscribe anytime. See our <Link className="nd-text-link" href="/privacy">privacy policy</Link>.
      </p>
      {errorCopy && <p role="alert" className="nd-subtle">{errorCopy}</p>}
    </aside>
  );
}

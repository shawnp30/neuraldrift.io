import React from "react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/privacy",
  "Privacy Policy",
  "How NeuralDrift collects, uses, and stores data — account info, analytics, and uploaded content."
);

export default function PrivacyPage() {
  return (
    <div className="nh-section flex min-h-[70vh] flex-col items-center pt-32">
      <div className="nh-container w-full max-w-3xl">
        <div className="nh-section-label mb-6">
          <span className="nh-nl-dot"></span> Privacy Policy
        </div>
        <h1 className="nh-h2 mb-4">Your Data</h1>
        <p className="mb-10 text-sm text-zinc-500">Last updated August 2026</p>

        <div className="space-y-8 leading-relaxed text-zinc-400">
          <section>
            <h2 className="mb-3 text-lg font-bold text-white">
              What we collect
            </h2>
            <p>
              If you create an account, we store your email address and
              authentication data through Supabase, our auth and database
              provider. If you upload workflows, proofs, or datasets, that
              content is stored via Vercel Blob and associated with your
              account. We don&apos;t require an account to browse guides,
              tools, or the model library.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-white">Analytics</h2>
            <p>
              We use Vercel Analytics to understand aggregate traffic (page
              views, referrers, rough device/location data). It doesn&apos;t
              use cookies and doesn&apos;t track you across other sites. We
              don&apos;t run ad networks or third-party ad trackers on this
              site.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-white">
              Third-party services
            </h2>
            <p>
              Some tools on this site call out to external APIs to do their
              job — for example, Hugging Face for model/dataset metadata, and
              Google&apos;s Gemini API for auto-captioning in the training
              tool. Data you submit to those tools (like uploaded images for
              captioning) is sent to the relevant provider to generate a
              result and is not stored by us beyond your session unless you
              explicitly save it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-white">
              What we don&apos;t do
            </h2>
            <p>
              We don&apos;t sell your data, and we don&apos;t run behavioral
              ad targeting on this site.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-white">
              Your controls
            </h2>
            <p>
              You can delete your account and associated uploads at any time
              from the dashboard, or by emailing us. Deleting your account
              removes your stored profile data; content you&apos;ve shared
              publicly (like a published workflow) may need to be removed
              separately — ask and we&apos;ll take it down.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-white">Contact</h2>
            <p>
              Questions about this policy or a data request? Reach out via
              the{" "}
              <a
                href="https://github.com/shawnp30/neuraldrift.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                GitHub repo
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

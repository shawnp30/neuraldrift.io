import React from "react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/terms",
  "Terms of Service",
  "The terms for using NeuralDrift's guides, tools, and workflow library."
);

export default function TermsPage() {
  return (
    <div className="nh-section flex min-h-[70vh] flex-col items-center pt-32">
      <div className="nh-container w-full max-w-3xl">
        <div className="nh-section-label mb-6">
          <span className="nh-nl-dot"></span> Terms of Service
        </div>
        <h1 className="nh-h2 mb-4">The Fine Print</h1>
        <p className="mb-10 text-sm text-zinc-500">Last updated August 2026</p>

        <div className="space-y-8 leading-relaxed text-zinc-400">
          <section>
            <h2 className="mb-3 text-lg font-bold text-white">
              Using NeuralDrift
            </h2>
            <p>
              NeuralDrift provides ComfyUI workflows, guides, and tools
              (hardware optimizer, VRAM calculator, caption generator, and
              similar utilities) for local and cloud AI image/video
              generation. Everything is provided &quot;as is&quot; — hardware
              recommendations, benchmark numbers, and pricing shown for
              third-party GPU providers are estimates, not guarantees, and can
              change without notice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-white">
              Accounts &amp; uploads
            </h2>
            <p>
              If you create an account to upload workflows, proofs, or
              datasets, you&apos;re responsible for what you upload. Don&apos;t
              upload content you don&apos;t have the rights to share, or
              anything illegal, malicious, or infringing. We can remove
              content or suspend accounts that violate this.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-white">
              Workflows &amp; models
            </h2>
            <p>
              Workflows, models, and datasets linked or hosted here may carry
              their own licenses from their original authors (Hugging Face,
              Civitai, individual creators, etc.). You&apos;re responsible for
              complying with those licenses when you use the underlying
              model or workflow, not just our site&apos;s terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-white">
              Third-party links
            </h2>
            <p>
              Some links (cloud GPU providers, marketplaces, ComfyUI docs)
              point to third-party sites we don&apos;t control. We&apos;re not
              responsible for their content, pricing, or availability.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-white">Changes</h2>
            <p>
              We may update these terms as the site evolves. Material changes
              will be reflected here with an updated date.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-white">Contact</h2>
            <p>
              Questions about these terms? Reach out via the{" "}
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

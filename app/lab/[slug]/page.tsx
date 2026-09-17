import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/seo";
import { TRACKED_MODELS, getTrackedModelBySlug, type ClaimBasis } from "@/lib/emergingModels";
import { getRelatedGuides, getRelatedTutorials, getRelatedWorkflows } from "@/lib/relationships";

interface Props {
  params: { slug: string };
}

const BASIS_LABEL: Record<ClaimBasis, string> = {
  neuraldrift_tested: "NeuralDrift tested",
  upstream_claim: "Upstream claim",
  community_reported: "Community reported",
  unknown: "Unknown",
};

// Reuses the site's existing nd-badge tone system rather than inventing a parallel one.
const BASIS_CLASS: Record<ClaimBasis, string> = {
  neuraldrift_tested: "nd-badge-tested",
  upstream_claim: "nd-badge-blue",
  community_reported: "nd-badge-amber",
  unknown: "nd-badge-unknown",
};

const STATUS_LABEL: Record<string, string> = {
  discovered: "DISCOVERED",
  documented: "DOCUMENTED",
  dependency_verified: "DEPENDENCY VERIFIED",
  execution_tested: "EXECUTION TESTED",
  benchmarked: "BENCHMARKED",
  level_5_verified: "LEVEL-5 VERIFIED",
};

export function generateStaticParams() {
  return TRACKED_MODELS.map((m) => ({ slug: m.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const model = getTrackedModelBySlug(params.slug);
  if (!model) {
    return { title: "Not Found | NeuralDrift Lab", robots: { index: false, follow: true } };
  }
  return pageMeta(
    `/lab/${model.slug}`,
    `${model.shortName} — NeuralDrift Lab`,
    model.summary
  );
}

function BasisBadge({ basis }: { basis: ClaimBasis }) {
  return <span className={`nd-badge ${BASIS_CLASS[basis]}`}>{BASIS_LABEL[basis]}</span>;
}

export default function TrackedModelPage({ params }: Props) {
  const model = getTrackedModelBySlug(params.slug);
  if (!model) notFound();

  const topic = { title: model.name, description: model.summary, tags: model.tags };
  const relatedGuides = getRelatedGuides(topic, 3);
  const relatedTutorials = getRelatedTutorials(topic, 2);
  const relatedWorkflows = getRelatedWorkflows(topic, 3);

  return (
    <div className="nd-site">
      <div className="nd-shell nd-page">
        <Link className="nd-text-link" href="/lab">← NeuralDrift Lab</Link>

        <header className="nd-section">
          <p className="nd-eyebrow">NEURALDRIFT LAB / TRACKED MODEL · {STATUS_LABEL[model.status]}</p>
          <h1>{model.name}</h1>
          <p className="nd-lead">{model.summary}</p>
          <div className="nd-actions">
            <span className="nd-subtle">{model.statusReason}</span>
          </div>
        </header>

        <section className="nd-card nd-card-body" aria-labelledby="lab-status">
          <p className="nd-eyebrow">RTX 5080 LAB STATUS</p>
          <h2 id="lab-status">Status: NOT TESTED</h2>
          <p>{model.neuralDriftLabStatus}</p>
        </section>

        {model.baseModel && (
          <section className="nd-section nd-prose">
            <h2>Relationship to base {model.baseModel.name}</h2>
            <p>{model.baseModel.note}</p>
          </section>
        )}

        <section className="nd-grid nd-section" aria-label="Capabilities">
          <div className="nd-card nd-card-body">
            <p className="nd-eyebrow">SUPPORTED</p>
            <h3>What it does</h3>
            <ul>
              {model.capabilities.supported.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
          <div className="nd-card nd-card-body">
            <p className="nd-eyebrow">NOT SUPPORTED IN THIS RELEASE</p>
            <h3>What it doesn&apos;t do</h3>
            <ul>
              {model.capabilities.notSupported.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </section>

        {model.distillation && (
          <section className="nd-section nd-prose" aria-labelledby="distillation">
            <h2 id="distillation">How it&apos;s distilled</h2>
            <dl>
              <dt>Method</dt><dd>{model.distillation.method}</dd>
              <dt>Sparsity</dt><dd>{model.distillation.sparsity}</dd>
              <dt>Inference steps</dt><dd>{model.distillation.steps}</dd>
              <dt>Scheduler</dt><dd>{model.distillation.schedulerNote}</dd>
            </dl>
          </section>
        )}

        <section className="nd-section" aria-labelledby="requirements">
          <h2 id="requirements">What running it requires</h2>
          <div className="nd-card nd-card-body">
            <dl>
              <dt>Attention backend</dt><dd>{model.requirements.attentionBackend}</dd>
              <dt>Approx. weight size</dt><dd>{model.requirements.approxWeightSize}</dd>
              <dt>Native ComfyUI checkpoint?</dt><dd>{model.requirements.comfyUiNative ? "Yes" : "No"}</dd>
            </dl>
            <p className="nd-subtle">{model.requirements.approxWeightSizeBasis}</p>
            <p>{model.requirements.comfyUiNote}</p>
            <h3>Dependencies</h3>
            <ul>
              {model.requirements.dependencies.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </div>
        </section>

        <section className="nd-section" aria-labelledby="gpu-compat">
          <h2 id="gpu-compat">GPU compatibility</h2>
          <p className="nd-subtle">Distinguishes what NeuralDrift has verified from what upstream or the community claims. Nothing here reflects an actual NeuralDrift execution unless labeled so.</p>
          <div className="nd-grid">
            {model.gpuCompatibility.map((row) => (
              <div className="nd-card nd-card-body" key={row.label}>
                <div className="nd-actions" style={{ marginBottom: "0.5rem" }}>
                  <h3 style={{ margin: 0 }}>{row.label}</h3>
                  <BasisBadge basis={row.basis} />
                </div>
                <p>{row.note}</p>
              </div>
            ))}
          </div>
        </section>

        {model.baseModel && (() => {
          const baseModelName = model.baseModel.name;
          return (
            <section className="nd-section" aria-labelledby="comparison">
              <h2 id="comparison">{baseModelName} vs. {model.shortName}</h2>
              <p className="nd-subtle">Fields NeuralDrift has not measured are marked &quot;Not Tested&quot; or &quot;No Evidence Yet&quot; rather than estimated.</p>
              <div className="nd-grid">
                {model.comparisonToBase.map((row) => (
                  <div className="nd-card nd-card-body" key={row.metric}>
                    <div className="nd-actions" style={{ marginBottom: "0.5rem" }}>
                      <h3 style={{ margin: 0 }}>{row.metric}</h3>
                      <BasisBadge basis={row.basis} />
                    </div>
                    <dl>
                      <dt>Base {baseModelName}</dt><dd>{row.baseValue}</dd>
                      <dt>{model.shortName}</dt><dd>{row.trackedValue}</dd>
                    </dl>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        <section className="nd-section" aria-labelledby="limitations">
          <h2 id="limitations">Known limitations</h2>
          <div className="nd-grid">
            {model.limitations.map((l) => (
              <div className="nd-card nd-card-body" key={l.text}>
                <BasisBadge basis={l.basis} />
                <p>{l.text}</p>
              </div>
            ))}
          </div>
        </section>

        {model.relatedProjects.length > 0 && (
          <section className="nd-section nd-prose" aria-labelledby="related-projects">
            <h2 id="related-projects">Don&apos;t confuse this with…</h2>
            {model.relatedProjects.map((p) => (
              <div key={p.name} style={{ marginBottom: "1.5rem" }}>
                <h3>{p.name}</h3>
                <p>{p.relationship}</p>
                <a className="nd-text-link" href={p.sourceUrl} target="_blank" rel="noopener noreferrer">Source ↗</a>
              </div>
            ))}
          </section>
        )}

        <section className="nd-section" aria-labelledby="sources">
          <h2 id="sources">Sources</h2>
          <ul>
            {model.sources.map((s) => (
              <li key={s.url}>
                <a className="nd-text-link" href={s.url} target="_blank" rel="noopener noreferrer">{s.label} ↗</a>
              </li>
            ))}
          </ul>
        </section>

        <section className="nd-card nd-card-body" aria-labelledby="cloud-option">
          <p className="nd-eyebrow">WANT TO RUN SOMETHING TODAY?</p>
          <h2 id="cloud-option">Local consumer-GPU fit is not yet verified</h2>
          <p>
            If you have access to larger VRAM through a cloud GPU provider, that&apos;s currently the more
            realistic path to trying FastVideo&apos;s own reference stack. NeuralDrift&apos;s cloud GPU hub
            covers provider options and pricing you can evaluate yourself — treat any pricing there as the
            provider&apos;s own listed rate, not a NeuralDrift benchmark.
          </p>
          <Link className="nd-button" href="/gpu-guide">Browse cloud GPU providers →</Link>
        </section>

        {(relatedGuides.length > 0 || relatedTutorials.length > 0 || relatedWorkflows.length > 0) && (
          <section className="nd-section" aria-labelledby="related-content">
            <h2 id="related-content">Related on NeuralDrift</h2>
            <div className="nd-grid">
              {relatedWorkflows.map((w) => (
                <article className="nd-card nd-card-body" key={`w-${w.id}`}>
                  <p className="nd-eyebrow">WORKFLOW</p>
                  <h3><Link href={`/workflows/${w.id}`}>{w.title}</Link></h3>
                </article>
              ))}
              {relatedGuides.map((g) => (
                <article className="nd-card nd-card-body" key={`g-${g.slug}`}>
                  <p className="nd-eyebrow">GUIDE</p>
                  <h3><Link href={`/guides/${g.slug}`}>{g.title}</Link></h3>
                </article>
              ))}
              {relatedTutorials.map((t) => (
                <article className="nd-card nd-card-body" key={`t-${t.slug}`}>
                  <p className="nd-eyebrow">TUTORIAL</p>
                  <h3><Link href={`/tutorials/${t.slug}`}>{t.title}</Link></h3>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

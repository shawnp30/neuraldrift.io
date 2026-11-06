// app/lab/research/page.tsx
// News → action: developments NeuralDrift investigated, what changed, why it matters locally,
// and what NeuralDrift decided to do. Every claim carries its source and evidence class.

import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { getDevelopments } from '@/lib/intelligence';
import { EvidenceClassBadge } from '@/components/lab/EvidenceClassBadge';

export const metadata = pageMeta(
  '/lab/research',
  'Local AI Research & Decisions — What Changed and What NeuralDrift Did',
  'Investigated local-AI developments (runtimes, ComfyUI, 3D, audio) with primary sources, evidence classes, RTX 5080 relevance, and the action NeuralDrift took: track, test, benchmark or skip.'
);

export default function ResearchPage() {
  const developments = getDevelopments();
  return (
    <div className="nd-site">
      <div className="nd-shell nd-page">
        <header className="nd-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Link href="/lab" className="nd-text-link">← NeuralDrift Lab</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="nd-eyebrow" style={{ margin: 0 }}>RESEARCH &amp; DECISIONS</span>
          </div>
          <h1>Research &amp; Decisions</h1>
          <p className="nd-lead">
            Not a news feed. Each entry is a development NeuralDrift checked against primary sources, with what it changes for local AI, whether it can be tested on the RTX 5080 workstation, and the decision taken. Upstream statements are labelled as such until NeuralDrift reproduces them.
          </p>
        </header>

        <section className="nd-section">
          {developments.map((d) => (
            <article className="nd-card nd-card-body" id={d.id} key={d.id} style={{ marginBottom: '1rem', scrollMarginTop: '5rem' }}>
              <p className="nd-eyebrow">{d.area.toUpperCase()} · UPSTREAM {d.upstreamDate} · REVIEWED {d.reviewedAt} · {d.status.replace('_', ' ').toUpperCase()}</p>
              <h2 style={{ marginTop: '0.25rem' }}>{d.title}</h2>
              <p><strong>What changed:</strong> {d.whatChanged}</p>
              <p><strong>Why it matters:</strong> {d.whyItMatters}</p>
              <p><strong>RTX 5080 / 16 GB:</strong> {d.hardwareFit}</p>
              {d.safeInstallPath && <p className="nd-subtle"><strong>Safe path:</strong> {d.safeInstallPath}</p>}
              <p>
                <strong>Decision:</strong> {d.decision}{' '}
                {d.actions.map((a) => <span key={a} className="nd-badge" style={{ marginRight: '0.35rem' }}>{a.replace(/_/g, ' ')}</span>)}
              </p>
              {d.alreadyTracked && <p className="nd-subtle">Related NeuralDrift coverage: <code>{d.alreadyTracked}</code></p>}
              <details>
                <summary style={{ cursor: 'pointer' }}>Claims and sources ({d.claims.length})</summary>
                <ul style={{ paddingLeft: '1.1rem', marginTop: '0.5rem' }}>
                  {d.claims.map((c) => (
                    <li key={c.claim} style={{ marginBottom: '0.5rem' }}>
                      <EvidenceClassBadge level={c.evidenceClass} /> {c.claim}{' '}
                      <span className="nd-subtle">— <a className="nd-text-link" href={c.source.url} target="_blank" rel="noopener noreferrer">{c.source.title}</a>, retrieved {c.source.retrievedAt}{c.version ? `, ${c.version}` : ''}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        </section>

        <section className="nd-section nd-prose">
          <p>
            Tested results live in the <Link href="/lab">Lab</Link> and <Link href="/lab/audio">Local Audio AI</Link>; runtime versions and everyday status are on <Link href="/lab/runtimes">Runtimes</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}

// app/lab/runtimes/page.tsx
// Local-AI runtimes: what NeuralDrift has proved about each, and separately whether it is usable
// day to day on the NeuralDrift workstation.

import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { RUNTIMES, MATURITY_LABEL } from '@/lib/runtimes';
import { EvidenceClassBadge } from '@/components/lab/EvidenceClassBadge';

export const metadata = pageMeta(
  '/lab/runtimes',
  'Local AI Runtimes — Tested Versions, Evidence & Everyday Status | NeuralDrift Lab',
  'audio.cpp, ACE-Step, ComfyUI, WanGP, llama.cpp, LM Studio and vLLM: the versions NeuralDrift actually ran, licenses, known issues, and which claims are tested versus upstream-reported.'
);

const cell = { padding: '6px 0', verticalAlign: 'top', borderBottom: '1px solid rgba(255,255,255,0.06)' } as const;

export default function RuntimesPage() {
  return (
    <div className="nd-site">
      <div className="nd-shell nd-page">
        <header className="nd-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Link href="/lab" className="nd-text-link">← NeuralDrift Lab</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="nd-eyebrow" style={{ margin: 0 }}>RUNTIMES</span>
          </div>
          <h1>Local AI Runtimes</h1>
          <p className="nd-lead">
            The engines that actually run models. For each: the version NeuralDrift detected or tested, its license (separate from any model&apos;s license), what NeuralDrift has proved, and — as a separate question — whether it is ready for everyday use on the NeuralDrift workstation.
          </p>
          <nav className="nd-actions" aria-label="Runtimes">
            {RUNTIMES.map((r) => <a key={r.slug} className="nd-text-link" href={`#${r.slug}`}>{r.name}</a>)}
          </nav>
        </header>

        <section className="nd-section">
          {RUNTIMES.map((r) => (
            <article className="nd-card nd-card-body" id={r.slug} key={r.slug} style={{ marginBottom: '1rem', scrollMarginTop: '5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'baseline' }}>
                <h2 style={{ margin: 0 }}>{r.name}</h2>
                <span className="nd-subtle">{r.license} · {r.platforms}</span>
              </div>
              <p>{r.summary}</p>
              <div className="nd-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                <div>
                  <p className="nd-eyebrow">NEURALDRIFT EVIDENCE</p>
                  <EvidenceClassBadge level={r.evidence.level} />
                  <p className="nd-subtle" style={{ marginTop: '0.5rem' }}>
                    {r.evidence.summary} {r.evidence.href && <Link className="nd-text-link" href={r.evidence.href}>See evidence →</Link>}
                  </p>
                </div>
                <div>
                  <p className="nd-eyebrow">EVERYDAY USE ON THE WORKSTATION</p>
                  <span className={`nd-badge ${r.everyday.maturity === 'EVERYDAY_READY' || r.everyday.maturity === 'PRIMARY_TOOL' ? 'nd-badge-tested' : ''}`}>{MATURITY_LABEL[r.everyday.maturity].toUpperCase()}</span>
                  <p className="nd-subtle" style={{ marginTop: '0.5rem' }}>{r.everyday.summary}</p>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginTop: '0.75rem' }}>
                <tbody>
                  {r.facts.map((f) => (
                    <tr key={f.label}>
                      <td style={{ ...cell, color: 'rgba(255,255,255,0.6)', width: '28%' }}>{f.label}</td>
                      <td style={cell}>{f.value}{f.sourceUrl && <> · <a className="nd-text-link" href={f.sourceUrl} target="_blank" rel="noopener noreferrer">source</a></>}</td>
                      <td style={{ ...cell, textAlign: 'right', whiteSpace: 'nowrap' }}><EvidenceClassBadge level={f.evidenceClass} /> <span className="nd-subtle" style={{ fontSize: '0.75rem' }}>{f.checkedAt}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {r.knownIssues.length > 0 && (
                <>
                  <p className="nd-eyebrow" style={{ marginTop: '0.75rem' }}>KNOWN ISSUES</p>
                  <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>{r.knownIssues.map((k) => <li key={k}>{k}</li>)}</ul>
                </>
              )}
              <p className="nd-subtle" style={{ marginTop: '0.75rem' }}><a className="nd-text-link" href={r.repository} target="_blank" rel="noopener noreferrer">Official source</a></p>
            </article>
          ))}
        </section>

        <section className="nd-section nd-prose">
          <p>
            Versions are detected on the NeuralDrift workstation or read from official releases, never assumed. See <Link href="/lab/research">research &amp; decisions</Link> for how new releases turn into tests, and <Link href="/lab/audio">Local Audio AI</Link> for full benchmark evidence.
          </p>
        </section>
      </div>
    </div>
  );
}

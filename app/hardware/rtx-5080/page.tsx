// app/hardware/rtx-5080/page.tsx
// Authoritative evidence dossier for RTX 5080 testbench runs.

import Link from 'next/link';
import { EXECUTIONS, evidenceFreshness } from '@/lib/hardware/executions';
import { pageMeta } from '@/lib/seo';
import { CATALOG, WORKFLOW_TESTS } from '@/lib/catalog';
import { getAllEvidenceRecords } from '@/lib/hardware/evidence';

export const metadata = pageMeta(
  '/hardware/rtx-5080',
  'NVIDIA GeForce RTX 5080 ComfyUI Testbench Dossier | NeuralDrift',
  'Empirical execution evidence for 37 ComfyUI workflows tested on the NVIDIA GeForce RTX 5080 (16GB). Real measured runtimes, model families, and verified constraints.'
);

export default function Rtx5080EvidencePage() {
  const allEvidence = getAllEvidenceRecords(CATALOG.map(w => ({ id: w.id, title: w.title })));
  const currentIds = new Set(EXECUTIONS.filter(r => r.hardwareProfileId === 'local-rtx-5080' && r.outcome === 'SUCCESS' && evidenceFreshness(r) === 'CURRENT').map(r => r.workflowId));
  const testedRecords = Object.values(allEvidence).filter(e => currentIds.has(e.workflowId));
  const unexecutedRecords = Object.values(allEvidence).filter(e => e.status !== 'completed');

  // Group tested by family
  const families: Record<string, typeof testedRecords> = {};
  for (const r of testedRecords) {
    const fam = r.modelFamily || 'Other';
    if (!families[fam]) families[fam] = [];
    families[fam].push(r);
  }

  return (
    <div className="nd-site">
      <div className="nd-shell nd-page">
        <Link className="nd-text-link" href="/compatibility">
          ← Back to Compatibility Matrix
        </Link>

        <header className="nd-section" style={{ marginTop: '1rem' }}>
          <p className="nd-eyebrow">PRIMARY LOCAL TESTBENCH DOSSIER</p>
          <h1>NVIDIA GeForce RTX 5080 (16GB) Evidence</h1>
          <p className="nd-lead">
            Authoritative local hardware verification results. {testedRecords.length} workflows have current successful evidence on the RTX 5080. Historical runs remain unclassified because STANDARD versus OPTIMIZED settings were not recorded. See each workflow for its complete execution history.
          </p>
        </header>

        {/* Hardware Specifications Card */}
        <section className="nd-card nd-card-body" style={{ background: '#0a101d', border: '1px solid #1e293b', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.8rem' }}>Test Environment Specifications</h2>
          <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: 0 }}>
            <div>
              <dt style={{ fontSize: '0.75rem', color: '#64748b' }}>GPU & Memory</dt>
              <dd style={{ margin: 0, fontWeight: 600, color: '#f8fafc' }}>NVIDIA RTX 5080 (16GB GDDR7)</dd>
            </div>
            <div>
              <dt style={{ fontSize: '0.75rem', color: '#64748b' }}>Architecture / Generation</dt>
              <dd style={{ margin: 0, fontWeight: 600, color: '#38bdf8' }}>Blackwell (sm_120) · RTX 50-Series</dd>
            </div>
            <div>
              <dt style={{ fontSize: '0.75rem', color: '#64748b' }}>Host System RAM</dt>
              <dd style={{ margin: 0, fontWeight: 600, color: '#f8fafc' }}>61.64 GiB reported usable RAM (historical ComfyUI observation)</dd>
            </div>
            <div>
              <dt style={{ fontSize: '0.75rem', color: '#64748b' }}>Software Stack</dt>
              <dd style={{ margin: 0, fontWeight: 600, color: '#f8fafc' }}>PyTorch 2.11 (Nightly) + CUDA 12.8</dd>
            </div>
            <div>
              <dt style={{ fontSize: '0.75rem', color: '#64748b' }}>ComfyUI Version</dt>
              <dd style={{ margin: 0, fontWeight: 600, color: '#f8fafc' }}>ComfyUI v0.33.0 (historical win32 record)</dd>
            </div>
            <div>
              <dt style={{ fontSize: '0.75rem', color: '#64748b' }}>Execution Coverage</dt>
              <dd style={{ margin: 0, fontWeight: 600, color: '#34d399' }}>{testedRecords.length} / {CATALOG.length} workflows with current success</dd>
            </div>
          </dl>
        </section>

        {/* Essential Limitations & Caveats */}
        <section className="nd-card nd-card-body" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.25)', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.15rem', margin: '0 0 0.5rem', color: '#fbbf24' }}>
            Hardware Limitations & Scope Caveats
          </h2>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#fde68a', fontSize: '0.85rem', lineHeight: 1.6 }}>
            <li>
              <strong>We do NOT claim the RTX 5080 runs 100% of workflows:</strong> 13 catalog entries have not been executed. 5 are blocked by frontend subgraphs requiring canvas expansion, and 8 remain on hold due to model weight footprints (&gt;15–30 GB).
            </li>
            <li>
              <strong>No Lower-VRAM Guarantees:</strong> Success on this 16GB setup does not prove that an 8GB or 12GB GPU will succeed. Lower VRAM configurations must be evaluated conservatively.
            </li>
            <li>
              <strong>PyTorch / CUDA Requirements:</strong> Running on Blackwell requires modern PyTorch builds with CUDA 12.8+ support (`cudaMallocAsync`).
            </li>
          </ul>
        </section>

        {/* Tested Workflows by Model Family */}
        <section className="nd-section">
          <h2>Verified Execution Records by Model Family ({testedRecords.length} Workflows)</h2>
          <p className="nd-subtle">
            Records below retain their saved execution artifacts. Workflow hashes match this build; semantic output review is not implied by execution success. Click any entry to inspect settings and download JSON.
          </p>

          <div style={{ display: 'grid', gap: '2rem', marginTop: '1.5rem' }}>
            {Object.entries(families).map(([fam, records]) => (
              <div key={fam} className="nd-card nd-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #28374d', paddingBottom: '0.6rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#38bdf8' }}>{fam} ({records.length})</h3>
                  <span className="nd-badge nd-badge-emerald">EXECUTION TESTED</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                        <th style={{ padding: '0.5rem' }}>ID</th>
                        <th style={{ padding: '0.5rem' }}>Workflow Title</th>
                        <th style={{ padding: '0.5rem' }}>Resolution / Frames</th>
                        <th style={{ padding: '0.5rem' }}>Steps / Sampler</th>
                        <th style={{ padding: '0.5rem' }}>Runtime</th>
                        <th style={{ padding: '0.5rem' }}>Output</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map(r => (
                        <tr key={r.workflowId} style={{ borderBottom: '1px solid #1e293b' }}>
                          <td style={{ padding: '0.5rem', fontFamily: 'var(--font-ibm-plex-mono), monospace' }}>{r.workflowId}</td>
                          <td style={{ padding: '0.5rem' }}>
                            <Link href={`/workflows/${r.workflowId}`} className="nd-text-link">
                              {r.workflowTitle}
                            </Link>
                          </td>
                          <td style={{ padding: '0.5rem', color: '#cbd5e1' }}>
                            {r.resolutionWidth && r.resolutionHeight ? `${r.resolutionWidth}×${r.resolutionHeight}` : 'Default'}
                            {r.frameCount ? ` (${r.frameCount}f)` : ''}
                          </td>
                          <td style={{ padding: '0.5rem', color: '#94a3b8' }}>
                            {r.steps ? `${r.steps} steps` : '—'} {r.sampler ? `(${r.sampler})` : ''}
                          </td>
                          <td style={{ padding: '0.5rem', color: '#34d399', fontWeight: 600, fontFamily: 'var(--font-ibm-plex-mono), monospace' }}>
                            {r.runtimeSeconds ? `${r.runtimeSeconds.toFixed(2)}s` : '—'}
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            {r.artifact ? (
                              <a href={r.artifact} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: '0.75rem' }}>
                                View Artifact ↗
                              </a>
                            ) : 'None'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The 13 Unexecuted Workflows & Factual Blockers */}
        <section className="nd-section" style={{ marginTop: '3rem' }}>
          <h2>Remaining 13 Unexecuted Workflows</h2>
          <p className="nd-subtle">
            These workflows have not completed execution on our testbench. Factual reasons are detailed below to distinguish testbed availability constraints from GPU compatibility limitations.
          </p>

          <div className="nd-card nd-card-body" style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '0.5rem' }}>ID</th>
                  <th style={{ padding: '0.5rem' }}>Workflow</th>
                  <th style={{ padding: '0.5rem' }}>Classification</th>
                  <th style={{ padding: '0.5rem' }}>Factual Reason</th>
                </tr>
              </thead>
              <tbody>
                {unexecutedRecords.map(r => (
                  <tr key={r.workflowId} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.5rem', fontFamily: 'var(--font-ibm-plex-mono), monospace' }}>{r.workflowId}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <Link href={`/workflows/${r.workflowId}`} className="nd-text-link">
                        {r.workflowTitle}
                      </Link>
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <span className={`nd-badge ${r.blockerType === 'SUBGRAPH_FRONTEND_REQUIRED' ? 'nd-badge-rose' : 'nd-badge-amber'}`}>
                        {r.blockerType === 'SUBGRAPH_FRONTEND_REQUIRED' ? 'SUBGRAPH BLOCKER' : 'MODEL HOLD'}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem', color: '#94a3b8' }}>
                      {r.blockerDetails || r.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

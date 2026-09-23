// app/lab/compare/page.tsx
// NeuralDrift Lab Scientific Benchmark Comparison Engine.
// Enforces strict comparability rules, prevents invalid conclusions, and compares individual metrics.

import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { getAllBenchmarks, getBenchmarkById } from '@/lib/benchmarks/registry';
import { checkComparability } from '@/lib/benchmarks/fingerprint';

interface Props {
  searchParams: { a?: string; b?: string };
}

export function generateMetadata({ searchParams }: Props): Metadata {
  const base = pageMeta(
    '/lab/compare',
    'Benchmark Comparison Engine — NeuralDrift Lab',
    'Scientifically compare local AI benchmark runs across hardware, runtimes, and models with strict comparability validation.'
  );
  return { ...base, robots: { index: !searchParams.a && !searchParams.b, follow: true } };
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return 'N/A';
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
}

export default function BenchmarkComparePage({ searchParams }: Props) {
  const allRuns = getAllBenchmarks();
  const runAId = searchParams.a || allRuns[0]?.id;
  const runBId = searchParams.b || (allRuns[1]?.id || allRuns[0]?.id);

  const runA = runAId ? getBenchmarkById(runAId) : undefined;
  const runB = runBId ? getBenchmarkById(runBId) : undefined;

  const comparability = runA && runB ? checkComparability(runA, runB) : null;

  return (
    <div className="nd-site">
      <div className="nd-shell nd-page">
        <header className="nd-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Link href="/lab" className="nd-text-link">← NeuralDrift Lab</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="nd-eyebrow" style={{ margin: 0 }}>COMPARISON ENGINE</span>
          </div>
          <h1>Scientific Benchmark Comparison</h1>
          <p className="nd-lead">
            Isolate independent variables across local LLM inference and agent workloads. NeuralDrift never collapses multi-dimensional performance into a single misleading composite score.
          </p>
        </header>

        {allRuns.length < 2 ? (
          <section className="nd-section">
            <div className="nd-card nd-card-body">
              <p className="nd-eyebrow">INSUFFICIENT DATA</p>
              <h3>At least two benchmark runs are required for comparison.</h3>
              <p className="nd-subtle">
                Currently recorded runs: {allRuns.length}. Execute benchmarks across different models, runtimes, or hardware to generate comparisons.
              </p>
              <Link href="/lab" className="nd-button" style={{ marginTop: '1rem' }}>
                Return to Lab Hub
              </Link>
            </div>
          </section>
        ) : (
          <>
            {/* Run Selectors */}
            <section className="nd-section">
              <div className="nd-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">RUN A (BASELINE)</p>
                  <form method="GET" action="/lab/compare">
                    <input type="hidden" name="b" value={runBId} />
                    <select
                      name="a"
                      defaultValue={runAId}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    >
                      {allRuns.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.model.displayName} ({r.workloadId} on {r.hardware.gpuName})
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="nd-button" style={{ marginTop: '0.75rem', width: '100%' }}>
                      Update Run A
                    </button>
                  </form>
                </div>

                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">RUN B (CANDIDATE)</p>
                  <form method="GET" action="/lab/compare">
                    <input type="hidden" name="a" value={runAId} />
                    <select
                      name="b"
                      defaultValue={runBId}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    >
                      {allRuns.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.model.displayName} ({r.workloadId} on {r.hardware.gpuName})
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="nd-button" style={{ marginTop: '0.75rem', width: '100%' }}>
                      Update Run B
                    </button>
                  </form>
                </div>
              </div>
            </section>

            {/* Comparability Guardrail Notice */}
            {comparability && (
              <section className="nd-section">
                {!comparability.comparable ? (
                  <div className="nd-card nd-card-body" style={{ borderColor: '#f87171', background: 'rgba(239, 68, 68, 0.08)' }}>
                    <p className="nd-eyebrow" style={{ color: '#f87171' }}>COMPARISON BLOCKED / SCIENTIFICALLY INVALID</p>
                    <h3 style={{ color: '#fca5a5' }}>These runs cannot be directly compared.</h3>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', color: '#fca5a5' }}>
                      {comparability.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ) : comparability.warnings.length > 0 ? (
                  <div className="nd-card nd-card-body" style={{ borderColor: '#fbbf24', background: 'rgba(245, 158, 11, 0.08)' }}>
                    <p className="nd-eyebrow" style={{ color: '#fbbf24' }}>MATERIAL CONFIGURATION DIFFERENCES</p>
                    <h3 style={{ color: '#fde68a' }}>Comparison carries configuration caveats:</h3>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', color: '#fde68a' }}>
                      {comparability.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="nd-card nd-card-body" style={{ borderColor: '#5eead4', background: 'rgba(94, 234, 212, 0.08)' }}>
                    <p className="nd-eyebrow" style={{ color: '#5eead4' }}>CONTROLLED SCIENTIFIC COMPARISON</p>
                    <h3 style={{ color: '#a7f3d0' }}>Configurations share workload version and material parameters.</h3>
                  </div>
                )}
              </section>
            )}

            {/* Side-by-Side Telemetry Table */}
            {runA && runB && (
              <section className="nd-section">
                <h2>Direct Metric Comparison</h2>
                <div className="nd-card" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                        <th style={{ textAlign: 'left', padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>Metric</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Run A: {runA.model.displayName}</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Run B: {runB.model.displayName}</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>Observation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>Workload</td>
                        <td style={{ padding: '12px 16px' }}>{runA.workloadId} v{runA.workloadVersion}</td>
                        <td style={{ padding: '12px 16px' }}>{runB.workloadId} v{runB.workloadVersion}</td>
                        <td style={{ padding: '12px 16px' }}>{runA.workloadId === runB.workloadId ? 'Identical Task' : 'Different Tasks'}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>Hardware GPU</td>
                        <td style={{ padding: '12px 16px' }}>{runA.hardware.gpuName}</td>
                        <td style={{ padding: '12px 16px' }}>{runB.hardware.gpuName}</td>
                        <td style={{ padding: '12px 16px' }}>{runA.hardware.gpuName === runB.hardware.gpuName ? 'Same GPU' : 'Cross-Hardware'}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>Runtime</td>
                        <td style={{ padding: '12px 16px' }}>{runA.runtime.runtime} ({runA.runtime.runtimeVersion})</td>
                        <td style={{ padding: '12px 16px' }}>{runB.runtime.runtime} ({runB.runtime.runtimeVersion})</td>
                        <td style={{ padding: '12px 16px' }}>{runA.runtime.runtime === runB.runtime.runtime ? 'Same Runtime' : 'Cross-Runtime'}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>Outcome</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`nd-badge ${runA.outcome === 'PASS' ? 'nd-badge-tested' : 'nd-badge-amber'}`}>{runA.outcome}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`nd-badge ${runB.outcome === 'PASS' ? 'nd-badge-tested' : 'nd-badge-amber'}`}>{runB.outcome}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{runA.outcome === runB.outcome ? 'Both ' + runA.outcome : 'Outcome Divergence'}</td>
                      </tr>

                      {/* Raw Inference Rows */}
                      {runA.rawInferenceMetrics && runB.rawInferenceMetrics && (
                        <>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>Time to First Token (TTFT)</td>
                            <td style={{ padding: '12px 16px' }}>{runA.rawInferenceMetrics.ttftMs?.toFixed(1)} ms</td>
                            <td style={{ padding: '12px 16px' }}>{runB.rawInferenceMetrics.ttftMs?.toFixed(1)} ms</td>
                            <td style={{ padding: '12px 16px' }}>
                              {runA.rawInferenceMetrics.ttftMs && runB.rawInferenceMetrics.ttftMs
                                ? `${Math.abs(runA.rawInferenceMetrics.ttftMs - runB.rawInferenceMetrics.ttftMs).toFixed(1)} ms difference`
                                : 'N/A'}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>Generation Speed</td>
                            <td style={{ padding: '12px 16px' }}>{runA.rawInferenceMetrics.generationTokensPerSec?.toFixed(1)} tok/s</td>
                            <td style={{ padding: '12px 16px' }}>{runB.rawInferenceMetrics.generationTokensPerSec?.toFixed(1)} tok/s</td>
                            <td style={{ padding: '12px 16px' }}>
                              {runA.rawInferenceMetrics.generationTokensPerSec && runB.rawInferenceMetrics.generationTokensPerSec
                                ? `${(runB.rawInferenceMetrics.generationTokensPerSec - runA.rawInferenceMetrics.generationTokensPerSec).toFixed(1)} tok/s delta`
                                : 'N/A'}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>Prompt Processing</td>
                            <td style={{ padding: '12px 16px' }}>{runA.rawInferenceMetrics.promptTokensPerSec?.toFixed(0)} tok/s</td>
                            <td style={{ padding: '12px 16px' }}>{runB.rawInferenceMetrics.promptTokensPerSec?.toFixed(0)} tok/s</td>
                            <td style={{ padding: '12px 16px' }}>Context ingest rate</td>
                          </tr>
                        </>
                      )}

                      {/* Workload Rows */}
                      {runA.workloadMetrics && runB.workloadMetrics && (
                        <>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>Task Completion Time</td>
                            <td style={{ padding: '12px 16px' }}>{(runA.workloadMetrics.taskCompletionTimeMs / 1000).toFixed(2)} s</td>
                            <td style={{ padding: '12px 16px' }}>{(runB.workloadMetrics.taskCompletionTimeMs / 1000).toFixed(2)} s</td>
                            <td style={{ padding: '12px 16px' }}>
                              {Math.abs(runA.workloadMetrics.taskCompletionTimeMs - runB.workloadMetrics.taskCompletionTimeMs).toFixed(0)} ms delta
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>Tool Calls Succeeded</td>
                            <td style={{ padding: '12px 16px' }}>{runA.workloadMetrics.successfulToolCalls}</td>
                            <td style={{ padding: '12px 16px' }}>{runB.workloadMetrics.successfulToolCalls}</td>
                            <td style={{ padding: '12px 16px' }}>Tool resolution count</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>Tool Latency</td>
                            <td style={{ padding: '12px 16px' }}>{runA.workloadMetrics.toolCallLatencyMs?.toFixed(2)} ms</td>
                            <td style={{ padding: '12px 16px' }}>{runB.workloadMetrics.toolCallLatencyMs?.toFixed(2)} ms</td>
                            <td style={{ padding: '12px 16px' }}>Tool overhead</td>
                          </tr>
                        </>
                      )}

                      <tr>
                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>Peak VRAM</td>
                        <td style={{ padding: '12px 16px' }}>{formatBytes(runA.rawInferenceMetrics?.peakVramBytes || runA.workloadMetrics?.peakVramBytes)}</td>
                        <td style={{ padding: '12px 16px' }}>{formatBytes(runB.rawInferenceMetrics?.peakVramBytes || runB.workloadMetrics?.peakVramBytes)}</td>
                        <td style={{ padding: '12px 16px' }}>Hardware footprint</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

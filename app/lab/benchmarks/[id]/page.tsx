// app/lab/benchmarks/[id]/page.tsx
// NeuralDrift Lab Benchmark Result Detail Page.
// Displays complete telemetry, objective validation, environment, and configuration fingerprint.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { pageMeta } from '@/lib/seo';
import { getBenchmarkById, getAllBenchmarks } from '@/lib/benchmarks/registry';

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return getAllBenchmarks().map((b) => ({ id: b.id }));
}

export function generateMetadata({ params }: Props): Metadata {
  const benchmark = getBenchmarkById(params.id);
  if (!benchmark) {
    return { title: 'Benchmark Not Found | NeuralDrift Lab', robots: { index: false, follow: true } };
  }
  return pageMeta(
    `/lab/benchmarks/${benchmark.id}`,
    `${benchmark.model.displayName} on ${benchmark.hardware.gpuName} — NeuralDrift Benchmark`,
    `Measured ${benchmark.workloadId} workload performance on ${benchmark.hardware.gpuName} via ${benchmark.runtime.runtime}. Validated outcome: ${benchmark.outcome}.`
  );
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return 'Not Measured';
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
}

export default function BenchmarkDetailPage({ params }: Props) {
  const benchmark = getBenchmarkById(params.id);
  if (!benchmark) notFound();

  const isRaw = benchmark.paradigm === 'raw_inference';
  const rawMetrics = benchmark.rawInferenceMetrics;
  const workMetrics = benchmark.workloadMetrics;

  return (
    <div className="nd-site">
      <div className="nd-shell nd-page">
        {/* Header Breadcrumb & Actions */}
        <header className="nd-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Link href="/lab" className="nd-text-link">← NeuralDrift Lab</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="nd-eyebrow" style={{ margin: 0 }}>BENCHMARK RESULT</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '1rem', marginTop: '0.5rem' }}>
            <h1 style={{ margin: 0 }}>{benchmark.model.displayName}</h1>
            <span className={`nd-badge ${benchmark.outcome === 'PASS' ? 'nd-badge-tested' : 'nd-badge-amber'}`}>
              {benchmark.outcome}
            </span>
            <span className="nd-badge nd-badge-blue">
              {benchmark.evidenceLevel.toUpperCase().replace(/_/g, ' ')}
            </span>
          </div>

          <p className="nd-lead" style={{ marginTop: '0.75rem' }}>
            Workload <strong>{benchmark.workloadId}</strong> evaluated on <strong>{benchmark.hardware.gpuName}</strong> via <strong>{benchmark.runtime.runtime}</strong> ({benchmark.runtime.runtimeVersion}) using {benchmark.runtime.backend.toUpperCase()} backend.
          </p>

          <div className="nd-actions">
            <Link href={`/lab/compare?a=${benchmark.id}`} className="nd-button">
              Compare this run →
            </Link>
            <a href={benchmark.rawEvidenceUrl} download className="nd-text-link" target="_blank" rel="noopener noreferrer">
              Download raw evidence JSON
            </a>
          </div>
        </header>

        {/* Primary Telemetry Grid */}
        <section className="nd-section">
          <h2>Measured Telemetry</h2>
          <p className="nd-subtle">
            {isRaw
              ? 'Raw inference metrics capturing model execution throughput and sub-second token latency.'
              : 'End-to-end agentic metrics capturing tool selection, argument execution, and task completion.'}
          </p>

          <div className="nd-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {isRaw && rawMetrics ? (
              <>
                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">TIME TO FIRST TOKEN (TTFT)</p>
                  <h2>{rawMetrics.ttftMs != null ? `${rawMetrics.ttftMs.toFixed(1)} ms` : 'Not Measured'}</h2>
                  <p className="nd-subtle">Streaming latency to initial token emission.</p>
                </div>
                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">GENERATION THROUGHPUT</p>
                  <h2>{rawMetrics.generationTokensPerSec != null ? `${rawMetrics.generationTokensPerSec.toFixed(1)} tok/s` : 'Not Measured'}</h2>
                  <p className="nd-subtle">Sustained token generation rate.</p>
                </div>
                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">PROMPT PROCESSING</p>
                  <h2>{rawMetrics.promptTokensPerSec != null ? `${rawMetrics.promptTokensPerSec.toFixed(0)} tok/s` : 'Not Measured'}</h2>
                  <p className="nd-subtle">Context ingestion rate ({rawMetrics.promptTokens} tokens in {rawMetrics.promptProcessingMs?.toFixed(1)} ms).</p>
                </div>
                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">TOTAL TIME</p>
                  <h2>{(rawMetrics.totalExecutionTimeMs / 1000).toFixed(2)} s</h2>
                  <p className="nd-subtle">Total wall-clock duration for {rawMetrics.totalTokens} tokens.</p>
                </div>
                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">PEAK VRAM OBSERVED</p>
                  <h2>{formatBytes(rawMetrics.peakVramBytes)}</h2>
                  <p className="nd-subtle">Dedicated GPU memory usage during generation.</p>
                </div>
                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">GPU UTILIZATION</p>
                  <h2>{rawMetrics.gpuUtilizationPct != null ? `${rawMetrics.gpuUtilizationPct}%` : 'Not Measured'}</h2>
                  <p className="nd-subtle">Active compute engine utilization.</p>
                </div>
              </>
            ) : workMetrics ? (
              <>
                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">TASK COMPLETION TIME</p>
                  <h2>{(workMetrics.taskCompletionTimeMs / 1000).toFixed(2)} s</h2>
                  <p className="nd-subtle">End-to-end task time including agent reasoning & tools.</p>
                </div>
                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">TOOL CALLS</p>
                  <h2>{workMetrics.successfulToolCalls} / {workMetrics.toolCallsCount}</h2>
                  <p className="nd-subtle">Successful calls vs total attempted invocations.</p>
                </div>
                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">TOOL LATENCY</p>
                  <h2>{workMetrics.toolCallLatencyMs != null ? `${workMetrics.toolCallLatencyMs.toFixed(2)} ms` : 'N/A'}</h2>
                  <p className="nd-subtle">Average local tool execution resolution time.</p>
                </div>
                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">TASK OUTCOME</p>
                  <h2 style={{ color: workMetrics.finalTaskSuccess ? '#5eead4' : '#f87171' }}>
                    {workMetrics.finalTaskSuccess ? 'SUCCESS' : 'FAILED'}
                  </h2>
                  <p className="nd-subtle">Validated objective result.</p>
                </div>
                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">PEAK VRAM OBSERVED</p>
                  <h2>{formatBytes(workMetrics.peakVramBytes)}</h2>
                  <p className="nd-subtle">Dedicated GPU memory usage during agent run.</p>
                </div>
                <div className="nd-card nd-card-body">
                  <p className="nd-eyebrow">RETRIES REQUIRED</p>
                  <h2>{workMetrics.retriesCount}</h2>
                  <p className="nd-subtle">Error recovery turns needed.</p>
                </div>
              </>
            ) : (
              <p className="nd-subtle">No telemetry recorded for this run.</p>
            )}
          </div>
        </section>

        {/* Validation Details */}
        <section className="nd-section">
          <h2>Objective Validation</h2>
          <div className="nd-card nd-card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p className="nd-eyebrow" style={{ margin: 0 }}>VALIDATOR: {benchmark.validation.validator.toUpperCase()}</p>
              <span className={`nd-badge ${benchmark.validation.passed ? 'nd-badge-tested' : 'nd-badge-amber'}`}>
                {benchmark.validation.passed ? 'VALIDATION PASSED' : 'VALIDATION FAILED'}
              </span>
            </div>
            <p>{benchmark.validation.details || 'Output satisfied required validation rules.'}</p>

            <p className="nd-eyebrow" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>OUTPUT RECEIVED</p>
            <pre style={{
              background: 'rgba(0,0,0,0.5)',
              padding: '1rem',
              borderRadius: '8px',
              overflowX: 'auto',
              fontSize: '0.875rem',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <code>{benchmark.validation.actualOutput}</code>
            </pre>
          </div>
        </section>

        {/* Environment & Provenance */}
        <section className="nd-section">
          <h2>Environment & Reproducibility</h2>
          <div className="nd-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            <div className="nd-card nd-card-body">
              <p className="nd-eyebrow">HARDWARE PROFILE</p>
              <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>GPU</td><td style={{ textAlign: 'right' }}>{benchmark.hardware.gpuName}</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>Architecture</td><td style={{ textAlign: 'right' }}>{benchmark.hardware.gpuArch}</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>VRAM Capacity</td><td style={{ textAlign: 'right' }}>{formatBytes(benchmark.hardware.vramBytes)}</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>System RAM</td><td style={{ textAlign: 'right' }}>{formatBytes(benchmark.hardware.systemRamBytes)}</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>CPU</td><td style={{ textAlign: 'right' }}>{benchmark.hardware.cpuModel || 'Not Captured'}</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>Form Factor</td><td style={{ textAlign: 'right' }}>{benchmark.hardware.formFactor.toUpperCase()}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="nd-card nd-card-body">
              <p className="nd-eyebrow">SOFTWARE & RUNTIME</p>
              <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>Runtime</td><td style={{ textAlign: 'right' }}>{benchmark.runtime.runtime} ({benchmark.runtime.runtimeVersion})</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>Backend</td><td style={{ textAlign: 'right' }}>{benchmark.runtime.backendVersion || benchmark.runtime.backend}</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>GPU Driver</td><td style={{ textAlign: 'right' }}>{benchmark.software.driverVersion}</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>Operating System</td><td style={{ textAlign: 'right' }}>{benchmark.software.os}</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>Model Quantization</td><td style={{ textAlign: 'right' }}>{benchmark.model.quantization}</td></tr>
                  <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>Context Limit</td><td style={{ textAlign: 'right' }}>{benchmark.model.contextLength ? `${benchmark.model.contextLength} tokens` : 'Default'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="nd-card nd-card-body" style={{ marginTop: '1.5rem' }}>
            <p className="nd-eyebrow">CONFIGURATION FINGERPRINT</p>
            <p className="nd-subtle">
              Deterministic SHA-256 hash across model, quantization, runtime, runtime version, GPU, driver, workload version, and generation settings. Two runs must share material variables to be directly comparable.
            </p>
            <code style={{
              display: 'block',
              padding: '0.75rem 1rem',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '6px',
              wordBreak: 'break-all',
              fontSize: '0.9rem',
              color: '#5eead4',
              border: '1px solid rgba(94, 234, 212, 0.2)'
            }}>
              {benchmark.configFingerprint}
            </code>
            <p className="nd-subtle" style={{ marginTop: '0.75rem' }}>
              Run ID: <code>{benchmark.id}</code> · Recorded at: {benchmark.timestamp} · Benchmark Suite v{benchmark.benchmarkVersion}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

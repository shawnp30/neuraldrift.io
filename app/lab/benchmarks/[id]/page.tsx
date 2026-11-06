// app/lab/benchmarks/[id]/page.tsx
// NeuralDrift Lab Benchmark Result Detail Page.
// Displays complete telemetry, objective validation, environment, and configuration fingerprint.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { pageMeta } from '@/lib/seo';
import { getBenchmarkById, getAllBenchmarks } from '@/lib/benchmarks/registry';
import { servedArtifactUrls } from '@/lib/benchmarks/publicArtifacts';
import { MetricsGrid, getMetricsView, formatBytes } from '@/components/lab/BenchmarkMetrics';
import { ArtifactPanel, FailurePanel, HashedFilesTable, LicensePanel, LimitationsPanel } from '@/components/lab/EvidencePanels';
import { AUDIO_TASKS, audioTaskOf } from '@/lib/audio/catalog';
import { knownLimitationsFor } from '@/lib/audio/comparison';
import { ConditionsPanel, ErrataPanel, SessionPanel, TelemetryPanel } from '@/components/lab/SessionTelemetryPanels';
import { errataFor, isInvalidated } from '@/lib/benchmarks/errata';

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return getAllBenchmarks().map((b) => ({ id: b.id }));
}

export function generateMetadata({ params }: Props): Metadata {
  const benchmark = getBenchmarkById(params.id);
  if (!benchmark) {
    return { title: 'Benchmark Not Found', robots: { index: false, follow: true } };
  }
  const meta = pageMeta(
    `/lab/benchmarks/${benchmark.id}`,
    `${benchmark.model.displayName} on ${benchmark.hardware.gpuName} via ${benchmark.runtime.runtime} — ${benchmark.workloadId}, ${benchmark.timestamp.slice(0, 16).replace("T", " ")} UTC`,
    `Measured ${benchmark.workloadId} workload performance on ${benchmark.hardware.gpuName} via ${benchmark.runtime.runtime}. Validated outcome: ${benchmark.outcome}.`
  );
  // Invalidated records remain public with an explanation but are not offered for indexing.
  return isInvalidated(benchmark.id) ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default function BenchmarkDetailPage({ params }: Props) {
  const benchmark = getBenchmarkById(params.id);
  if (!benchmark) notFound();

  const view = getMetricsView(benchmark);
  const audioTask = audioTaskOf(benchmark);
  const taskLabel = AUDIO_TASKS.find((t) => t.id === audioTask)?.label;
  const limitations = knownLimitationsFor(benchmark);
  const errata = errataFor(benchmark.id);
  const hasLicense = Boolean(benchmark.runtime.license || benchmark.model.license);

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
            {taskLabel && <span className="nd-badge">{taskLabel.toUpperCase()}</span>}
            {benchmark.variant && <span className="nd-badge nd-badge-amber">VARIANT: {benchmark.variant.toUpperCase()}</span>}
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
            {audioTask && <Link href="/lab/audio" className="nd-text-link">Local Audio AI →</Link>}
          </div>
        </header>

        {isInvalidated(benchmark.id) && (
          <section className="nd-section" data-invalidated>
            <div className="nd-card nd-card-body" style={{ borderColor: '#f87171', background: 'rgba(239, 68, 68, 0.08)' }}>
              <p className="nd-eyebrow" style={{ color: '#f87171' }}>INVALIDATED RECORD · KEPT FOR TRANSPARENCY</p>
              <p style={{ margin: 0 }}>This run did not execute the configuration its workload defines, so it is excluded from all NeuralDrift statistics and comparisons. See the errata below for what went wrong and what replaced it.</p>
            </div>
          </section>
        )}

        {/* Primary Telemetry Grid */}
        <section className="nd-section">
          <h2>Measured Telemetry</h2>
          <p className="nd-subtle">{view?.description ?? 'No telemetry recorded for this run.'}</p>
          {benchmark.executionConditions && <div style={{ marginBottom: '1rem' }}><ConditionsPanel conditions={benchmark.executionConditions} /></div>}
          <MetricsGrid run={benchmark} />
          {benchmark.sessionMetrics && <div style={{ marginTop: '1rem' }}><SessionPanel session={benchmark.sessionMetrics} startupErratum={errata.find((e) => e.field === 'sessionMetrics.startupAndLoadMs') ?? null} /></div>}
          {errata.length > 0 && <div style={{ marginTop: '1rem' }}><ErrataPanel errata={errata} /></div>}
          {benchmark.telemetry ? (
            <div style={{ marginTop: '1rem' }}><TelemetryPanel telemetry={benchmark.telemetry} /></div>
          ) : benchmark.outputMetrics?.telemetryMethod ? (
            <p className="nd-subtle" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>Method: {benchmark.outputMetrics.telemetryMethod}</p>
          ) : null}
        </section>

        {benchmark.failure && (
          <section className="nd-section">
            <h2>Failure Evidence</h2>
            <FailurePanel failure={benchmark.failure} />
          </section>
        )}

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

        {benchmark.artifacts && (
          <section className="nd-section">
            <h2>Generated Artifact</h2>
            <ArtifactPanel artifacts={benchmark.artifacts} playableUrls={servedArtifactUrls(benchmark)} />
          </section>
        )}

        {hasLicense && (
          <section className="nd-section">
            <h2>License</h2>
            <LicensePanel run={benchmark} />
          </section>
        )}

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
                  {benchmark.runtime.precision && <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>Runtime Precision</td><td style={{ textAlign: 'right' }}>{benchmark.runtime.precision}</td></tr>}
                  {benchmark.runtime.attentionBackend && <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>Attention</td><td style={{ textAlign: 'right' }}>{benchmark.runtime.attentionBackend}</td></tr>}
                  {benchmark.software.pythonVersion && <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>Python</td><td style={{ textAlign: 'right' }}>{benchmark.software.pythonVersion}</td></tr>}
                  {benchmark.software.cudaVersion && <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>Driver CUDA Version</td><td style={{ textAlign: 'right' }}>{benchmark.software.cudaVersion}</td></tr>}
                  {!audioTask && <tr><td style={{ padding: '6px 0', color: 'rgba(255,255,255,0.6)' }}>Context Limit</td><td style={{ textAlign: 'right' }}>{benchmark.model.contextLength ? `${benchmark.model.contextLength} tokens` : 'Default'}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="nd-card nd-card-body" style={{ marginTop: '1.5rem' }}>
            <p className="nd-eyebrow">CONFIGURATION FINGERPRINT</p>
            <p className="nd-subtle">
              Deterministic SHA-256 hash across model, quantization, runtime, runtime version, backend, GPU, driver, and workload ID and version (which pin the prompt and generation settings), plus, when recorded, model-file and input content hashes, workflow hash, runtime flags, precision and attention backend. Two runs must share material variables to be directly comparable.
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

          {benchmark.model.files?.length ? (
            <div className="nd-card nd-card-body" style={{ marginTop: '1.5rem' }}>
              <p className="nd-eyebrow">MODEL FILES (CONTENT-HASHED)</p>
              <HashedFilesTable files={benchmark.model.files} />
            </div>
          ) : null}
          {benchmark.inputs?.length ? (
            <div className="nd-card nd-card-body" style={{ marginTop: '1.5rem' }}>
              <p className="nd-eyebrow">WORKLOAD INPUTS (CONTENT-HASHED)</p>
              <HashedFilesTable files={benchmark.inputs} />
            </div>
          ) : null}
        </section>

        {limitations.length > 0 && (
          <section className="nd-section">
            <h2>Known Limitations</h2>
            <LimitationsPanel items={limitations} />
          </section>
        )}
      </div>
    </div>
  );
}

// components/lab/SessionTelemetryPanels.tsx
// Warm-session iteration tables and telemetry method panels for benchmark results.

import type { DistributionStats, ExecutionConditions, SessionMetrics, TelemetrySummary } from '@/lib/benchmarks/types';
import { formatBytes } from './BenchmarkMetrics';
import type { Erratum } from '@/lib/benchmarks/errata';

const cell = { padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' } as const;
const headCell = { ...cell, color: 'rgba(255,255,255,0.6)', fontWeight: 500 } as const;
const secs = (ms: number | null | undefined) => (ms == null ? '—' : `${(ms / 1000).toFixed(2)} s`);

function StatsRow({ label, stats, fmt }: { label: string; stats: DistributionStats | null; fmt: (v: number) => string }) {
  if (!stats) return null;
  return (
    <tr>
      <td style={{ ...cell, textAlign: 'left' }}>{label}</td>
      <td style={cell}>{stats.n}</td>
      <td style={cell}>{fmt(stats.median)}</td>
      <td style={cell}>{fmt(stats.mean)}</td>
      <td style={cell}>{fmt(stats.min)}</td>
      <td style={cell}>{fmt(stats.max)}</td>
      <td style={cell}>{fmt(stats.stdev)}</td>
      <td style={cell}>{(stats.cv * 100).toFixed(1)}%</td>
      <td style={cell}>{stats.p95 == null ? 'n < 20' : fmt(stats.p95)}</td>
    </tr>
  );
}

export function SessionPanel({ session, startupErratum = null }: { session: SessionMetrics; startupErratum?: Erratum | null }) {
  const startup = startupErratum ? (startupErratum.correctedValue as number | null) : session.startupAndLoadMs;
  return (
    <div className="nd-card nd-card-body" data-session-panel>
      <p className="nd-eyebrow">WARM SESSION · {session.warmupIterations} WARM-UP + {session.measuredIterations} MEASURED</p>
      <p className="nd-subtle">
        Start-up and model load: <strong>{secs(startup)}</strong> ({startupErratum ? `${startupErratum.correctedBasis}, corrected; recorded ${secs(startupErratum.recordedValue as number)}` : session.startupAndLoadBasis}) · whole session {secs(session.processWallMs)} ·
        distinct outputs at a fixed seed: <strong>{session.distinctMeasuredOutputs} of {session.measuredIterations}</strong>. {session.generationSource}
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr>{['Measured iterations', 'n', 'Median', 'Mean', 'Min', 'Max', 'Std dev', 'CV', 'p95'].map((h, i) => <th key={h} style={i ? headCell : { ...headCell, textAlign: 'left' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            <StatsRow label="Generation time" stats={session.generationMs} fmt={(v) => secs(v)} />
            <StatsRow label="Real-time factor" stats={session.realTimeFactor} fmt={(v) => v.toFixed(3)} />
          </tbody>
        </table>
      </div>
      <details style={{ marginTop: '0.75rem' }}>
        <summary style={{ cursor: 'pointer' }}>Every iteration ({session.iterations.length})</summary>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>{['#', 'Kind', 'Generation', 'Output', 'RTF', 'Valid', 'Artifact SHA-256'].map((h, i) => <th key={h} style={i === 6 ? { ...headCell, textAlign: 'left' } : headCell}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {session.iterations.map((it) => (
                <tr key={it.index}>
                  <td style={cell}>{it.index}</td>
                  <td style={cell}>{it.warmup ? 'warm-up' : 'measured'}</td>
                  <td style={cell}>{secs(it.generationMs)}</td>
                  <td style={cell}>{it.outputDurationSec == null ? '—' : `${it.outputDurationSec.toFixed(2)} s`}</td>
                  <td style={cell}>{it.realTimeFactor?.toFixed(3) ?? '—'}</td>
                  <td style={cell}>{it.passed ? 'PASS' : 'FAIL'}</td>
                  <td style={{ ...cell, textAlign: 'left' }}><code style={{ fontSize: '0.75rem' }}>{it.artifactSha256?.slice(0, 16) ?? '—'}…</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export function TelemetryPanel({ telemetry }: { telemetry: TelemetrySummary }) {
  const rows: [string, string][] = [
    ['Process-tree dedicated VRAM, peak', formatBytes(telemetry.processVramPeakBytes, 'Not sampled')],
    ['Process-tree shared GPU memory, peak', formatBytes(telemetry.processSharedGpuMemoryPeakBytes, 'Not sampled')],
    ...(telemetry.adapterSharedGpuMemoryPeakBytes != null ? [['Adapter shared GPU memory, first sample → peak', `${formatBytes(telemetry.adapterSharedGpuMemoryStartBytes, '—')} → ${formatBytes(telemetry.adapterSharedGpuMemoryPeakBytes, '—')}`] as [string, string]] : []),
    ['Device VRAM baseline → peak', `${formatBytes(telemetry.vramBaselineBytes, '—')} → ${formatBytes(telemetry.vramPeakBytes, '—')}`],
    ['Process-tree RAM, peak', formatBytes(telemetry.processRamPeakBytes, 'Not sampled')],
    ['System RAM baseline → peak', `${formatBytes(telemetry.systemRamBaselineBytes, '—')} → ${formatBytes(telemetry.systemRamPeakBytes, '—')}`],
    ['GPU utilization, peak / mean', `${telemetry.gpuUtilizationPeakPct ?? '—'}% / ${telemetry.gpuUtilizationMeanPct ?? '—'}%`],
    ['GPU memory-controller utilization, peak', telemetry.gpuMemoryUtilizationPeakPct == null ? '—' : `${telemetry.gpuMemoryUtilizationPeakPct}%`],
    ['GPU power, peak / mean', `${telemetry.gpuPowerPeakW ?? '—'} W / ${telemetry.gpuPowerMeanW ?? '—'} W`],
    ['GPU temperature, peak', telemetry.gpuTemperaturePeakC == null ? '—' : `${telemetry.gpuTemperaturePeakC} °C`],
    ['GPU SM clock, minimum', telemetry.gpuSmClockMinMHz == null ? '—' : `${telemetry.gpuSmClockMinMHz} MHz`],
    ['CPU utilization, peak / mean', `${telemetry.cpuUtilizationPeakPct ?? '—'}% / ${telemetry.cpuUtilizationMeanPct ?? '—'}%`],
    ['Samples (GPU / process / process GPU)', `${telemetry.gpuSamples} every ${telemetry.gpuSampleIntervalMs} ms / ${telemetry.processSamples} / ${telemetry.processGpuSamples}`],
  ];
  return (
    <div className="nd-card nd-card-body" data-telemetry-panel>
      <p className="nd-eyebrow">TELEMETRY · NEURALDRIFT MEASURED</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}><td style={{ ...cell, textAlign: 'left', color: 'rgba(255,255,255,0.6)' }}>{k}</td><td style={cell}>{v}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="nd-subtle" style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>Method: {telemetry.method}</p>
    </div>
  );
}

export function ConditionsPanel({ conditions }: { conditions: ExecutionConditions }) {
  return (
    <div className="nd-card nd-card-body" style={{ borderColor: 'rgba(251,191,36,0.5)' }} data-conditions-panel>
      <p className="nd-eyebrow" style={{ color: '#fbbf24' }}>CONSTRAINED VRAM · NOT A DIFFERENT GPU</p>
      <p>
        {formatBytes(conditions.vramBallastBytes)} of VRAM was held by another process for the whole run, leaving{' '}
        {formatBytes(conditions.freeVramBeforeRunBytes, 'an unmeasured amount')} free. This shows what executes when less VRAM is available on this GPU; it is not evidence that a GPU with less memory behaves the same way.
      </p>
      <p className="nd-subtle">{conditions.method}</p>
    </div>
  );
}

export function ErrataPanel({ errata }: { errata: Erratum[] }) {
  return (
    <div className="nd-card nd-card-body" style={{ borderColor: 'rgba(251,191,36,0.5)' }} data-errata-panel>
      <p className="nd-eyebrow" style={{ color: '#fbbf24' }}>ERRATA · RECORDED EVIDENCE IS UNCHANGED</p>
      {errata.map((e) => (
        <div key={e.field} style={{ marginBottom: '0.75rem' }}>
          <p style={{ margin: 0 }}><code>{e.field}</code>: recorded <strong>{String(e.recordedValue)}</strong>, corrected to <strong>{String(e.correctedValue)}</strong> ({e.correctedBasis}, {e.recordedAt}).</p>
          <p className="nd-subtle" style={{ margin: '0.25rem 0 0' }}>{e.issue}</p>
          <p className="nd-subtle" style={{ margin: '0.25rem 0 0' }}>Correction: {e.correctionMethod}</p>
        </div>
      ))}
    </div>
  );
}

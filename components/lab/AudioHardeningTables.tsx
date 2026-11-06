// components/lab/AudioHardeningTables.tsx
// Warm-session, planner-bypass and memory-configuration tables for the Local Audio hub. Every row
// is computed from registered benchmark records; nothing here is typed in by hand.

import Link from 'next/link';
import type { BenchmarkRecord } from '@/lib/benchmarks/types';
import type { ConfigurationRow, WarmSessionRow } from '@/lib/audio/comparison';
import { stat } from '@/lib/audio/comparison';
import { formatBytes } from './BenchmarkMetrics';
import { effectiveValue } from '@/lib/benchmarks/errata';

const cell = { padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', verticalAlign: 'top' } as const;
const head = { ...cell, textAlign: 'left', color: 'rgba(255,255,255,0.6)', fontWeight: 500 } as const;
const secs = (ms: number | null | undefined) => (ms == null ? '—' : `${(ms / 1000).toFixed(2)} s`);

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
        <thead><tr>{headers.map((h) => <th key={h} style={head}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function WarmSessionTable({ rows }: { rows: WarmSessionRow[] }) {
  if (!rows.length) return <p className="nd-subtle">No sessions recorded yet.</p>;
  return (
    <Table headers={['Configuration', 'Outcome', 'Median warm generation', 'Mean ± SD (CV)', 'Range', 'Start-up + load', 'RTF (median)', 'Process VRAM peak', 'Shared GPU memory peak', 'Distinct audio outputs']}>
      {rows.map(({ record: r, label, startupAndLoadMs, startupCorrected }) => {
        const s = r.sessionMetrics!;
        const g = s.generationMs;
        return (
          <tr key={r.id}>
            <td style={cell}><Link href={`/lab/benchmarks/${r.id}`}>{label}</Link><br /><span className="nd-subtle">{r.timestamp.slice(0, 16).replace('T', ' ')} UTC</span></td>
            <td style={cell}><span className={`nd-badge ${r.outcome === 'PASS' ? 'nd-badge-tested' : 'nd-badge-amber'}`}>{r.outcome}</span></td>
            <td style={cell}><strong>{secs(g?.median)}</strong> (n = {g?.n ?? 0})</td>
            <td style={cell}>{g ? `${secs(g.mean)} ± ${secs(g.stdev)} (${(g.cv * 100).toFixed(1)}%)` : '—'}</td>
            <td style={cell}>{g ? `${secs(g.min)} – ${secs(g.max)}` : '—'}</td>
            <td style={cell}>{secs(startupAndLoadMs)}{startupCorrected ? ' (corrected, see erratum)' : s.startupAndLoadBasis === 'derived' ? ' (derived)' : ''}</td>
            <td style={cell}>{s.realTimeFactor?.median.toFixed(3) ?? '—'}</td>
            <td style={cell}>{formatBytes(r.telemetry?.processVramPeakBytes, '—')}</td>
            <td style={cell}>{formatBytes(r.telemetry?.processSharedGpuMemoryPeakBytes, '—')}</td>
            <td style={cell}>{effectiveValue<number>(r, 'sessionMetrics.distinctMeasuredOutputs').value} of {s.measuredIterations}{effectiveValue(r, 'sessionMetrics.distinctMeasuredOutputs').erratum ? ' (corrected)' : ''}</td>
          </tr>
        );
      })}
    </Table>
  );
}

const telemetryOf = (runs: BenchmarkRecord[]) => runs.filter((r) => r.telemetry);

export function ConfigurationTable({ rows }: { rows: ConfigurationRow[] }) {
  if (!rows.length) return <p className="nd-subtle">No runs recorded yet.</p>;
  return (
    <Table headers={['Configuration', 'Runs passing', 'Wall time median (range)', 'Process VRAM peak (median)', 'Shared GPU memory peak (max)', 'Free VRAM before run', 'Runs']}>
      {rows.map((row) => {
        const wall = stat(row.runs.map((r) => r.outputMetrics?.generationTimeMs));
        const withTelemetry = telemetryOf(row.runs);
        const vram = stat(withTelemetry.map((r) => r.telemetry!.processVramPeakBytes));
        const shared = stat(withTelemetry.map((r) => r.telemetry!.processSharedGpuMemoryPeakBytes));
        return (
          <tr key={row.runs[0].configFingerprint}>
            <td style={cell}>
              {row.label}
              {row.constrainedVramBallastBytes ? <><br /><span className="nd-badge nd-badge-amber">CONSTRAINED · NOT A DIFFERENT GPU</span></> : null}
            </td>
            <td style={cell}>{row.passCount} / {row.runs.length}</td>
            <td style={cell}>{wall ? `${secs(wall.median)} (${secs(wall.min)} – ${secs(wall.max)})` : '—'}</td>
            <td style={cell}>{vram ? formatBytes(vram.median) : 'not sampled'}{vram && withTelemetry.length < row.runs.length ? ` (${withTelemetry.length} of ${row.runs.length} runs sampled)` : ''}</td>
            <td style={cell}>{shared ? formatBytes(shared.max, '0') : 'not sampled'}</td>
            <td style={cell}>{row.freeVramBeforeRunBytes != null ? formatBytes(row.freeVramBeforeRunBytes) : '—'}</td>
            <td style={cell}>{row.runs.map((r, i) => <span key={r.id}>{i ? ', ' : ''}<Link href={`/lab/benchmarks/${r.id}`}>{r.outcome === 'PASS' ? i + 1 : `${i + 1} (${r.outcome})`}</Link></span>)}</td>
          </tr>
        );
      })}
    </Table>
  );
}

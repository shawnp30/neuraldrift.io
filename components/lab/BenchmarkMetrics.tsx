// components/lab/BenchmarkMetrics.tsx
// Output-kind-aware metric views for benchmark records. Each kind maps to one view builder, so a
// new output kind is added by registering one more builder instead of editing every page.

import type { BenchmarkRecord } from '@/lib/benchmarks/types';

export interface MetricItem {
  label: string;
  value: string;
  note?: string;
  tone?: 'good' | 'bad';
}

export interface MetricsView {
  kind: string;
  description: string;
  cards: MetricItem[];   // Full telemetry grid (detail page)
  summary: MetricItem[]; // Four-item summary (lists)
}

const GiB = 1024 * 1024 * 1024;
export function formatBytes(bytes: number | null | undefined, missing = 'Not Measured'): string {
  if (!bytes) return missing;
  return `${(bytes / GiB).toFixed(2)} GB`;
}
const seconds = (ms: number | null | undefined, digits = 2) => (ms == null ? 'Not Measured' : `${(ms / 1000).toFixed(digits)} s`);

type ViewBuilder = (run: BenchmarkRecord) => MetricsView | null;

const rawInferenceView: ViewBuilder = (run) => {
  const m = run.rawInferenceMetrics;
  if (!m) return null;
  return {
    kind: 'raw_inference',
    description: 'Raw inference metrics capturing model execution throughput and sub-second token latency.',
    cards: [
      { label: 'TIME TO FIRST TOKEN (TTFT)', value: m.ttftMs != null ? `${m.ttftMs.toFixed(1)} ms` : 'Not Measured', note: 'Streaming latency to initial token emission.' },
      { label: 'GENERATION THROUGHPUT', value: m.generationTokensPerSec != null ? `${m.generationTokensPerSec.toFixed(1)} tok/s` : 'Not Measured', note: 'Sustained token generation rate.' },
      { label: 'PROMPT PROCESSING', value: m.promptTokensPerSec != null ? `${m.promptTokensPerSec.toFixed(0)} tok/s` : 'Not Measured', note: `Context ingestion rate (${m.promptTokens} tokens in ${m.promptProcessingMs?.toFixed(1)} ms).` },
      { label: 'TOTAL TIME', value: seconds(m.totalExecutionTimeMs), note: `Total wall-clock duration for ${m.totalTokens} tokens.` },
      { label: 'PEAK VRAM OBSERVED', value: formatBytes(m.peakVramBytes), note: 'Dedicated GPU memory usage during generation.' },
      { label: 'GPU UTILIZATION', value: m.gpuUtilizationPct != null ? `${m.gpuUtilizationPct}%` : 'Not Measured', note: 'Active compute engine utilization.' },
    ],
    summary: [
      { label: 'TTFT', value: m.ttftMs != null ? `${m.ttftMs.toFixed(1)} ms` : 'N/A' },
      { label: 'Speed', value: m.generationTokensPerSec != null ? `${m.generationTokensPerSec.toFixed(1)} tok/s` : 'N/A' },
      { label: 'Prompt', value: m.promptTokensPerSec != null ? `${m.promptTokensPerSec.toFixed(0)} tok/s` : 'N/A' },
      { label: 'Peak VRAM', value: formatBytes(m.peakVramBytes) },
    ],
  };
};

const workloadView: ViewBuilder = (run) => {
  const m = run.workloadMetrics;
  if (!m) return null;
  return {
    kind: 'workload',
    description: 'End-to-end agentic metrics capturing tool selection, argument execution, and task completion.',
    cards: [
      { label: 'TASK COMPLETION TIME', value: seconds(m.taskCompletionTimeMs), note: 'End-to-end task time including agent reasoning & tools.' },
      { label: 'TOOL CALLS', value: `${m.successfulToolCalls} / ${m.toolCallsCount}`, note: 'Successful calls vs total attempted invocations.' },
      { label: 'TOOL LATENCY', value: m.toolCallLatencyMs != null ? `${m.toolCallLatencyMs.toFixed(2)} ms` : 'N/A', note: 'Average local tool execution resolution time.' },
      { label: 'TASK OUTCOME', value: m.finalTaskSuccess ? 'SUCCESS' : 'FAILED', note: 'Validated objective result.', tone: m.finalTaskSuccess ? 'good' : 'bad' },
      { label: 'PEAK VRAM OBSERVED', value: formatBytes(m.peakVramBytes), note: 'Dedicated GPU memory usage during agent run.' },
      { label: 'RETRIES REQUIRED', value: String(m.retriesCount), note: 'Error recovery turns needed.' },
    ],
    summary: [
      { label: 'Task Time', value: seconds(m.taskCompletionTimeMs) },
      { label: 'Tool Calls', value: `${m.successfulToolCalls}/${m.toolCallsCount}` },
      { label: 'Tool Latency', value: m.toolCallLatencyMs != null ? `${m.toolCallLatencyMs.toFixed(2)} ms` : 'N/A' },
      { label: 'Peak VRAM', value: formatBytes(m.peakVramBytes) },
    ],
  };
};

const audioView: ViewBuilder = (run) => {
  const m = run.outputMetrics;
  if (m?.kind !== 'audio') return null;
  const rtf = m.realTimeFactor;
  return {
    kind: 'audio',
    description: 'Audio generation metrics. Wall time runs from process start to exit and includes model loading. Output properties come from decoding the generated file.',
    cards: [
      { label: 'GENERATION TIME', value: seconds(m.generationTimeMs), note: 'Process wall time, model load included.' },
      { label: 'OUTPUT DURATION', value: m.outputDurationSec != null ? `${m.outputDurationSec.toFixed(2)} s` : 'Not Measured', note: `Decoded from the artifact (requested ${m.requestedDurationSec ?? '—'} s).` },
      { label: 'REAL-TIME FACTOR', value: rtf != null ? rtf.toFixed(3) : 'Not Measured', note: rtf != null ? `Generation time ÷ output duration; ${rtf < 1 ? `${(1 / rtf).toFixed(2)}× faster than real time` : `${rtf.toFixed(2)}× slower than real time`}.` : 'Requires a decoded output.' },
      { label: 'SAMPLE RATE / CHANNELS', value: m.sampleRateHz != null ? `${(m.sampleRateHz / 1000).toFixed(1)} kHz · ${m.channels ?? '?'} ch` : 'Not Measured', note: 'Read from the WAV header and verified by decoding.' },
      { label: 'PEAK VRAM (DEVICE)', value: formatBytes(m.peakVramBytes), note: `Device-wide peak; ${formatBytes(m.vramBaselineBytes, 'unknown')} was in use before the run.` },
      { label: 'PEAK RAM (PROCESS TREE)', value: formatBytes(m.peakRamBytes), note: 'Sampled working set of the generation process and its children.' },
      { label: 'GPU UTILIZATION', value: m.gpuUtilizationPct != null ? `${m.gpuUtilizationPct}%` : 'Not Measured', note: 'Peak sampled utilization.' },
    ],
    summary: [
      { label: 'Gen Time', value: seconds(m.generationTimeMs) },
      { label: 'Output', value: m.outputDurationSec != null ? `${m.outputDurationSec.toFixed(1)} s` : 'N/A' },
      { label: 'RTF', value: rtf != null ? rtf.toFixed(3) : 'N/A' },
      { label: 'Peak VRAM', value: formatBytes(m.peakVramBytes) },
    ],
  };
};

// Output-kind views take precedence; legacy text records fall through to their metric blocks.
const OUTPUT_VIEWS: Record<string, ViewBuilder> = { audio: audioView };
const LEGACY_VIEWS: ViewBuilder[] = [rawInferenceView, workloadView];

export function getMetricsView(run: BenchmarkRecord): MetricsView | null {
  if (run.outputMetrics) return OUTPUT_VIEWS[run.outputMetrics.kind]?.(run) ?? null;
  // Preserve the historical precedence: raw-inference records try token metrics first; workload
  // records only ever showed workload metrics.
  const ordered = run.paradigm === 'raw_inference' ? LEGACY_VIEWS : [workloadView];
  for (const build of ordered) {
    const view = build(run);
    if (view) return view;
  }
  return null;
}

export function MetricsGrid({ run }: { run: BenchmarkRecord }) {
  const view = getMetricsView(run);
  if (!view) return <p className="nd-subtle">No telemetry recorded for this run.</p>;
  return (
    <div className="nd-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }} data-metrics-kind={view.kind}>
      {view.cards.map((card) => (
        <div className="nd-card nd-card-body" key={card.label}>
          <p className="nd-eyebrow">{card.label}</p>
          <h2 style={card.tone ? { color: card.tone === 'good' ? '#5eead4' : '#f87171' } : undefined}>{card.value}</h2>
          {card.note && <p className="nd-subtle">{card.note}</p>}
        </div>
      ))}
    </div>
  );
}

export function MetricsSummary({ run }: { run: BenchmarkRecord }) {
  const view = getMetricsView(run);
  if (!view) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }} data-metrics-kind={view.kind}>
      {view.summary.map((item) => (
        <div key={item.label}><strong>{item.label}:</strong> {item.value}</div>
      ))}
    </div>
  );
}

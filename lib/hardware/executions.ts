import legacy from '@/data/workflow-tests.json';
import stored from '@/data/workflow-executions.json';
import profiles from '@/data/hardware-profiles.json';
import hashes from '@/data/workflow-hashes.json';

export interface HardwareProfile {
  id: string;
  gpuId: string;
  name: string;
  vendor: string;
  formFactor: 'desktop' | 'laptop';
  vramBytes: number;
  systemRamBytes: number | null;
  source: string;
  verification: 'observed';
}
export type ExecutionProfile = 'STANDARD' | 'OPTIMIZED' | 'UNCLASSIFIED';
export interface ExecutionRecord {
  id: string;
  workflowId: string;
  hardwareProfileId: string;
  workflowSha256: string | null;
  promptSha256: string | null;
  testDate: string;
  executionProfile: ExecutionProfile;
  outcome: 'SUCCESS' | 'FAILURE' | 'INDETERMINATE';
  failure: { stage: 'preflight' | 'execution' | 'transport'; type: string; message: string } | null;
  settings: Record<string, unknown>;
  environment: Record<string, unknown>;
  models: { filename: string; sha256: string | null }[];
  runtimeSeconds: number | null;
  artifact: string | null;
  evidenceUrl: string;
  optimizationNotes: string | null;
  // Recorded by scripts/run-execution.mjs; absent on legacy records. coldStartCheck is only
  // present when the unload was confirmed by device-wide free memory, not PyTorch's counter.
  coldStart?: boolean;
  coldStartCheck?: { method: string; torchReservedBytes: number; vramFreeBytes: number } | null;
  // Nodes ComfyUI reused from its cache. Non-empty means /free had not been applied.
  cachedNodes?: string[] | null;
  peakVram?: { status: 'MEASURED'; method: string; baselineBytes: number; peakBytes: number; sampleCount: number } | { status: 'UNAVAILABLE'; reason: string } | null;
  // Only complete manifests (including inputs, models, node versions and run protocol)
  // may participate in timing comparisons. Legacy records intentionally lack one.
  comparisonManifest: Record<string, unknown> | null;
}
export const HARDWARE_PROFILES = profiles as HardwareProfile[];
export const WORKFLOW_HASHES: Record<string, string> = hashes;
const imported: ExecutionRecord[] = Object.values(legacy).map(t => ({
  id: `legacy-${t.workflowId}-${t.testDate}`,
  workflowId: t.workflowId,
  hardwareProfileId: HARDWARE_PROFILES.find(p => t.gpu.includes(p.name))?.id ?? 'unattributed',
  workflowSha256: t.workflowSha256,
  promptSha256: null,
  testDate: t.testDate,
  executionProfile: 'UNCLASSIFIED',
  outcome: 'SUCCESS',
  failure: null,
  settings: { ...('settings' in t ? t.settings : {}), resolution: t.resolution, batchSize: t.batchSize },
  environment: { os: t.os, python: t.python, comfyUI: t.comfyUI, pytorch: t.pytorch, customNodes: t.customNodes },
  models: [{ filename: t.model, sha256: t.modelSha256 }],
  runtimeSeconds: t.generationSeconds,
  artifact: t.preview,
  evidenceUrl: `/workflow-tests/${t.workflowId}-record.json`,
  optimizationNotes: 'Historical run: STANDARD versus OPTIMIZED was not recorded. Original evidence preserved.',
  comparisonManifest: null,
}));
export const EXECUTIONS: ExecutionRecord[] = [...imported, ...stored as ExecutionRecord[]];
export function evidenceFreshness(record: ExecutionRecord, currentHashes = WORKFLOW_HASHES): 'CURRENT' | 'STALE' | 'UNKNOWN' {
  const current = currentHashes[record.workflowId];
  if (!record.workflowSha256 || !current) return 'UNKNOWN';
  return record.workflowSha256 === current ? 'CURRENT' : 'STALE';
}
export function workflowExecutions(workflowId: string, records = EXECUTIONS) {
  return records.filter(r => r.workflowId === workflowId).slice().sort((a, b) =>
    b.testDate.localeCompare(a.testDate) || a.id.localeCompare(b.id));
}
export function selectExactExecution(workflowId: string, gpuId: string, records = EXECUTIONS, hardware = HARDWARE_PROFILES, currentHashes = WORKFLOW_HASHES) {
  const exact = workflowExecutions(workflowId, records).filter(r =>
    evidenceFreshness(r, currentHashes) === 'CURRENT' && hardware.some(p => p.id === r.hardwareProfileId && p.gpuId === gpuId));
  // A preflight failure (missing input file, unconvertible graph) never reached the GPU, so it
  // supersedes nothing; it is selected only when no attempt reached the GPU, and stays in history.
  const reachedGpu = exact.filter(r => r.failure?.stage !== 'preflight');
  // Most recent result per actual testbench and execution mode supersedes older results.
  const latest = new Map<string, ExecutionRecord>();
  for (const r of reachedGpu) {
    const key = `${r.hardwareProfileId}:${r.executionProfile}`;
    if (!latest.has(key)) latest.set(key, r);
  }
  const candidates = [...latest.values()];
  for (const mode of ['STANDARD', 'OPTIMIZED'] as const) {
    const success = candidates.find(r => r.executionProfile === mode && r.outcome === 'SUCCESS');
    if (success) return success;
  }
  // A classified failure must not be hidden by an older unclassified success.
  return candidates.find(r => r.executionProfile !== 'UNCLASSIFIED') ?? candidates[0] ?? exact[0] ?? null;
}
export interface ColdStartSummary {
  runs: number;
  medianSeconds: number;
  minSeconds: number;
  maxSeconds: number;
  // Device-wide nvidia-smi figures: the highest peak, and the baseline of that same run.
  peakVramBytes: number | null;
  peakBaselineBytes: number | null;
  latestTestDate: string;
  // From the latest run's submitted prompt: what actually ran, not the legacy test settings.
  steps: number | null;
  cfg: number | null;
  sampler: string | null;
  scheduler: string | null;
  seed: number | null;
  width: number | null;
  height: number | null;
  batchSize: number | null;
  comfyUI: string | null;
  pytorch: string | null;
  ramTotalBytes: number | null;
  modelFiles: string[];
  artifact: string | null;
  evidenceUrl: string;
}
function firstPromptInput(prompt: unknown, name: string): number | string | null {
  if (!prompt || typeof prompt !== 'object') return null;
  for (const node of Object.values(prompt)) {
    if (!node || typeof node !== 'object' || !('inputs' in node) || !node.inputs || typeof node.inputs !== 'object') continue;
    // Linked inputs are [nodeId, slot] arrays; only literal values describe the run.
    for (const [key, value] of Object.entries(node.inputs)) if (key === name && (typeof value === 'number' || typeof value === 'string')) return value;
  }
  return null;
}
const numberOrNull = (value: unknown) => (typeof value === 'number' ? value : null);
const stringOrNull = (value: unknown) => (typeof value === 'string' ? value : null);
// Successful STANDARD runs with a verified cold start on one testbench and the current
// workflow hash: memory released before the run and no node reused from ComfyUI's cache.
// Legacy and pre-check records are excluded, so these runtimes are comparable.
export function coldStartSummary(workflowId: string, hardwareProfileId: string, records = EXECUTIONS, currentHashes = WORKFLOW_HASHES): ColdStartSummary | null {
  const runs = records.filter(r => r.workflowId === workflowId && r.hardwareProfileId === hardwareProfileId
    && r.executionProfile === 'STANDARD' && r.outcome === 'SUCCESS' && r.runtimeSeconds != null
    && r.coldStart === true && r.coldStartCheck && Array.isArray(r.cachedNodes) && r.cachedNodes.length === 0
    && evidenceFreshness(r, currentHashes) === 'CURRENT');
  if (!runs.length) return null;
  const seconds = runs.flatMap(r => r.runtimeSeconds ?? []).sort((a, b) => a - b);
  const mid = Math.floor(seconds.length / 2);
  let peak: { peakBytes: number; baselineBytes: number } | null = null;
  for (const r of runs) if (r.peakVram?.status === 'MEASURED' && (!peak || r.peakVram.peakBytes > peak.peakBytes)) peak = r.peakVram;
  const latest = runs.reduce((a, r) => (r.testDate > a.testDate ? r : a));
  const prompt = latest.settings.prompt;
  return {
    runs: runs.length,
    medianSeconds: seconds.length % 2 ? seconds[mid] : (seconds[mid - 1] + seconds[mid]) / 2,
    minSeconds: seconds[0],
    maxSeconds: seconds[seconds.length - 1],
    peakVramBytes: peak?.peakBytes ?? null,
    peakBaselineBytes: peak?.baselineBytes ?? null,
    latestTestDate: latest.testDate,
    steps: numberOrNull(firstPromptInput(prompt, 'steps')),
    cfg: numberOrNull(firstPromptInput(prompt, 'cfg')),
    sampler: stringOrNull(firstPromptInput(prompt, 'sampler_name')),
    scheduler: stringOrNull(firstPromptInput(prompt, 'scheduler')),
    seed: numberOrNull(firstPromptInput(prompt, 'seed')),
    width: numberOrNull(firstPromptInput(prompt, 'width')),
    height: numberOrNull(firstPromptInput(prompt, 'height')),
    batchSize: numberOrNull(firstPromptInput(prompt, 'batch_size')),
    comfyUI: stringOrNull(latest.environment.comfyui_version),
    pytorch: stringOrNull(latest.environment.pytorch_version),
    ramTotalBytes: numberOrNull(latest.environment.ram_total),
    modelFiles: latest.models.map(m => m.filename),
    artifact: latest.artifact,
    evidenceUrl: latest.evidenceUrl,
  };
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value);
}
export function comparableExecutions(a: ExecutionRecord, b: ExecutionRecord, hardware = HARDWARE_PROFILES, currentHashes = WORKFLOW_HASHES) {
  const pa = hardware.find(p => p.id === a.hardwareProfileId);
  const pb = hardware.find(p => p.id === b.hardwareProfileId);
  const required = ['promptSha256', 'inputHashes', 'modelHashes', 'nodeVersions', 'software', 'precision', 'launchArgs', 'timingProtocol'];
  const manifest = a.comparisonManifest;
  return Boolean(pa && pb && pa.gpuId !== pb.gpuId && a.outcome === 'SUCCESS' && b.outcome === 'SUCCESS'
    && a.workflowId === b.workflowId && evidenceFreshness(a, currentHashes) === 'CURRENT' && evidenceFreshness(b, currentHashes) === 'CURRENT'
    && a.executionProfile !== 'UNCLASSIFIED' && a.executionProfile === b.executionProfile
    && a.runtimeSeconds && b.runtimeSeconds && a.promptSha256 && a.promptSha256 === b.promptSha256
    && a.models.length && a.models.every(m => m.sha256) && canonical(a.models) === canonical(b.models)
    && manifest && b.comparisonManifest && required.every(k => manifest[k] != null && b.comparisonManifest?.[k] != null)
    && canonical(a.settings) === canonical(b.settings) && canonical(manifest) === canonical(b.comparisonManifest));
}
export function crossGpuComparisons(workflowId: string, source = EXECUTIONS, currentHashes = WORKFLOW_HASHES) {
  const records = workflowExecutions(workflowId, source);
  return records.flatMap((a, i) => records.slice(i + 1).filter(b => comparableExecutions(a, b, HARDWARE_PROFILES, currentHashes)).map(b => ({
    recordA: a.id, recordB: b.id, secondsA: a.runtimeSeconds, secondsB: b.runtimeSeconds,
  })));
}

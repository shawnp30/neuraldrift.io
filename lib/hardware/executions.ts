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
  // Most recent result per actual testbench and execution mode supersedes older results.
  const latest = new Map<string, ExecutionRecord>();
  for (const r of exact) {
    const key = `${r.hardwareProfileId}:${r.executionProfile}`;
    if (!latest.has(key)) latest.set(key, r);
  }
  const candidates = [...latest.values()];
  for (const mode of ['STANDARD', 'OPTIMIZED'] as const) {
    const success = candidates.find(r => r.executionProfile === mode && r.outcome === 'SUCCESS');
    if (success) return success;
  }
  // A classified failure must not be hidden by an older unclassified success.
  return candidates.find(r => r.executionProfile !== 'UNCLASSIFIED') ?? candidates[0] ?? null;
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

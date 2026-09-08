// lib/hardware/compatibility.ts
// Deterministic GPU compatibility intelligence engine for NeuralDrift.
// Implements evidence-backed matching, strict confidence tiers, and false-positive prevention.

import { GPUDefinition, findGpuBySlug } from './gpuData';
import { getHardwareEvidence } from './evidence';
import { EXECUTIONS, WORKFLOW_HASHES, HARDWARE_PROFILES, ExecutionRecord, evidenceFreshness, workflowExecutions, selectExactExecution, crossGpuComparisons } from './executions';
import { WorkflowEntry } from '@/lib/workflowsData';
import { memoryEstimate, WORKFLOW_TESTS, CATALOG } from '@/lib/catalog';

export type CompatibilityState = 
  | 'DIRECT_TESTED'
  | 'CLOSE_TESTED'
  | 'ESTIMATED'
  | 'UNKNOWN'
  | 'BLOCKED'
  | 'TESTED_FAILURE';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export interface ClosestEvidence {
  gpu: string;
  vramGb: number;
  runtimeSeconds: number | null;
  resolution: string | null;
  steps: number | null;
  isExactWorkflow: boolean;
  limitationNote: string;
}

export interface CompatibilityResult {
  executionRecords: (ExecutionRecord & { freshness: string })[];
  selectedExecutionId: string | null;
  crossGpuComparisons: ReturnType<typeof crossGpuComparisons>;
  state: CompatibilityState;
  confidence: ConfidenceLevel;
  badgeLabel: string;
  badgeTone: 'emerald' | 'amber' | 'blue' | 'zinc' | 'rose';
  headline: string;
  reason: string;
  closestEvidence: ClosestEvidence | null;
  runtimeEvidence: {
    runtimeSeconds: number | null;
    resolution: string | null;
    steps: number | null;
    sampler: string | null;
    batchSize: number | null;
    testDate: string | null;
  } | null;
  documentedMinimumVram: number | null;
  selectedVramGb: number;
  selectedGpu?: GPUDefinition;
  warnings: string[];
  recommendedAlternatives: {
    id: string;
    title: string;
    category: string;
    vram: string;
    tested: boolean;
  }[];
}

export interface HardwareTarget {
  gpu?: GPUDefinition;
  vramGb: number;
}

/**
 * Resolves a hardware target from either a GPU slug or raw VRAM number.
 */
export function resolveHardwareTarget(gpuSlugOrName?: string | null, vramTier?: number | string | null): HardwareTarget | null {
  if (gpuSlugOrName) {
    const gpu = findGpuBySlug(gpuSlugOrName);
    if (gpu) return { gpu, vramGb: gpu.vramGb };
  }

  if (vramTier) {
    const parsed = Number(vramTier);
    if (Number.isFinite(parsed) && parsed > 0) {
      return { vramGb: parsed };
    }
  }

  return null;
}

/**
 * Deterministic compatibility matcher.
 */
export function evaluateCompatibility(workflow: WorkflowEntry, target: HardwareTarget, records = EXECUTIONS, currentHashes = WORKFLOW_HASHES): CompatibilityResult {
  const docReq = memoryEstimate(workflow);
  const evidence = getHardwareEvidence(workflow.id, workflow.title);
  const history = workflowExecutions(workflow.id, records);
  const warnings: string[] = [];
  if (target.gpu?.vendor === 'AMD') warnings.push('AMD GPU selected: CUDA tests do not prove ROCm or DirectML compatibility.');
  if (target.gpu?.vendor === 'Apple') warnings.push('Apple Silicon selected: CUDA tests do not prove Metal/MPS compatibility.');
  if (history.some(r => evidenceFreshness(r, currentHashes) !== 'CURRENT')) warnings.push('Historical evidence is stale or has no workflow hash; it cannot establish current compatibility.');
  const result: CompatibilityResult = {
    state: docReq === null ? 'UNKNOWN' : 'ESTIMATED',
    confidence: docReq === null ? 'UNKNOWN' : 'LOW',
    badgeLabel: docReq === null ? 'UNKNOWN REQUIREMENT' : target.vramGb < docReq ? `ESTIMATED - NEEDS ${docReq}GB+` : `ESTIMATED - ${docReq}GB documented`,
    badgeTone: docReq === null ? 'zinc' : target.vramGb < docReq ? 'rose' : 'blue',
    headline: docReq === null ? 'Unknown Hardware Requirement' : 'Estimated from Documented Requirements',
    reason: docReq === null ? 'No current exact execution or documented memory requirement establishes compatibility.' : `Documented requirement: ${docReq}GB VRAM. Not execution-tested on the selected hardware; some model downloads were deferred.`,
    closestEvidence: null, runtimeEvidence: null,
    documentedMinimumVram: docReq, selectedVramGb: target.vramGb, selectedGpu: target.gpu,
    warnings, recommendedAlternatives: getAlternatives(workflow, target.vramGb),
    executionRecords: history.map(r => ({ ...r, freshness: evidenceFreshness(r, currentHashes) })),
    selectedExecutionId: null, crossGpuComparisons: crossGpuComparisons(workflow.id, records, currentHashes),
  };
  const exact = target.gpu && target.vramGb === target.gpu.vramGb ? selectExactExecution(workflow.id, target.gpu.id, records, HARDWARE_PROFILES, currentHashes) : null;
  const reference = exact ?? history.find(r => r.outcome === 'SUCCESS' && evidenceFreshness(r, currentHashes) === 'CURRENT' && HARDWARE_PROFILES.some(p => p.id === r.hardwareProfileId));
  if (reference) {
    const hardware = HARDWARE_PROFILES.find(p => p.id === reference.hardwareProfileId)!;
    const vram = Math.round(hardware.vramBytes / 1024 ** 3);
    const resolution = typeof reference.settings.resolution === 'string' ? reference.settings.resolution : null;
    const steps = typeof reference.settings.steps === 'number' ? reference.settings.steps : null;
    result.closestEvidence = { gpu: hardware.name, vramGb: vram, runtimeSeconds: reference.runtimeSeconds, resolution, steps, isExactWorkflow: true, limitationNote: exact ? 'Exact GPU model and current workflow hash; applies only to the recorded settings and software.' : 'Measured on another GPU. Runtime is not a prediction for your hardware.' };
    if (reference.outcome === 'SUCCESS') result.runtimeEvidence = { runtimeSeconds: reference.runtimeSeconds, resolution, steps, sampler: typeof reference.settings.sampler === 'string' ? reference.settings.sampler : null, batchSize: typeof reference.settings.batchSize === 'number' ? reference.settings.batchSize : null, testDate: reference.testDate };
    if (exact) {
      result.selectedExecutionId = exact.id;
      result.confidence = 'HIGH';
      if (exact.outcome === 'INDETERMINATE') {
        result.state = 'UNKNOWN'; result.confidence = 'UNKNOWN'; result.badgeTone = 'zinc';
        result.badgeLabel = 'EXECUTION OUTCOME UNKNOWN'; result.headline = 'Terminal execution evidence unavailable';
        result.reason = exact.failure?.message ?? 'The attempt has no confirmed success or execution failure.';
      } else if (exact.outcome === 'FAILURE') {
        result.state = 'TESTED_FAILURE'; result.badgeTone = 'rose'; result.badgeLabel = 'RECORDED FAILURE';
        result.headline = `${exact.executionProfile} attempt failed on ${hardware.name}`;
        result.reason = `${exact.failure?.stage}: ${exact.failure?.type}: ${exact.failure?.message}. This is an observed attempt failure, not a blanket claim that this GPU cannot run the workflow.`;
      } else {
        result.state = 'DIRECT_TESTED'; result.badgeTone = 'emerald';
        result.badgeLabel = `TESTED ON ${target.gpu!.shortName} - ${exact.executionProfile}`;
        result.headline = `Directly Tested on ${hardware.name}`;
        result.reason = `Current workflow hash matches the successful ${exact.executionProfile.toLowerCase()} execution. Success applies to its recorded settings.`;
        if (exact.executionProfile === 'OPTIMIZED') result.reason += ` Optimizations: ${exact.optimizationNotes}`;
        if (exact.executionProfile === 'UNCLASSIFIED') result.warnings.push('Historical success: STANDARD versus OPTIMIZED was not recorded.');
        if (history.some(r => r.outcome === 'FAILURE' && r.hardwareProfileId === exact.hardwareProfileId && evidenceFreshness(r, currentHashes) === 'CURRENT')) result.warnings.push('This GPU also has recorded failed attempts. Inspect all execution settings below.');
        result.recommendedAlternatives = [];
      }
      return result;
    }
    // Capacity alone never establishes direct evidence or cross-backend compatibility.
    if (target.gpu?.vendor === hardware.vendor && target.vramGb >= vram) {
      result.state = 'CLOSE_TESTED'; result.confidence = 'MEDIUM'; result.badgeTone = 'amber';
      result.badgeLabel = `LIKELY COMPATIBLE - tested on ${vram}GB`;
      result.headline = 'Related Hardware Evidence';
      result.reason = `A current workflow execution succeeded on ${hardware.name} (${vram}GB). Selected hardware has sufficient capacity relative to that test, but architecture, software and execution settings remain unverified.`;
    }
  }
  if (evidence.blockerType === 'SUBGRAPH_FRONTEND_REQUIRED') {
    result.state = 'BLOCKED'; result.confidence = 'HIGH'; result.badgeTone = 'rose'; result.badgeLabel = 'DEPENDENCY BLOCKED';
    result.headline = 'Frontend Subgraph Expansion Required';
    result.reason = 'The saved preflight reports frontend composite subgraphs requiring canvas expansion. This is a tooling blocker, not an observed GPU execution failure.';
  }
  return result;
}

/**
 * Deterministic alternative workflow recommendation.
 * Returns up to 3 lower-memory or tested workflows in the same category.
 */
function getAlternatives(workflow: WorkflowEntry, maxVram: number) {
  return CATALOG
    .filter(w => {
      if (w.id === workflow.id) return false;
      const mem = memoryEstimate(w);
      // Prefer workflows that fit within user's VRAM
      if (mem !== null && mem > maxVram) return false;
      // Prefer same category
      return w.category === workflow.category || workflow.tags.some(t => w.tags.includes(t));
    })
    .sort((a, b) => {
      // Prioritize Level 5 tested workflows first
      const aTested = WORKFLOW_TESTS[a.id]?.status === 'completed' ? 1 : 0;
      const bTested = WORKFLOW_TESTS[b.id]?.status === 'completed' ? 1 : 0;
      if (bTested !== aTested) return bTested - aTested;
      return (memoryEstimate(a) ?? 99) - (memoryEstimate(b) ?? 99);
    })
    .slice(0, 3)
    .map(w => ({
      id: w.id,
      title: w.title,
      category: w.category,
      vram: memoryEstimate(w) ? `${memoryEstimate(w)}GB` : 'Unknown',
      tested: WORKFLOW_TESTS[w.id]?.status === 'completed'
    }));
}

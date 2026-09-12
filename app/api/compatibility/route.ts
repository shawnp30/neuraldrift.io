// app/api/compatibility/route.ts
// Deterministic GPU compatibility intelligence API.

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { HARDWARE_PROFILES, EXECUTIONS } from '@/lib/hardware/executions';
import { CATALOG } from '@/lib/catalog';
import { resolveHardwareTarget, evaluateCompatibility } from '@/lib/hardware/compatibility';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get('workflow');
  const gpu = searchParams.get('gpu');
  const vram = searchParams.get('vram');

  if (!workflowId) {
    return NextResponse.json(
      { error: 'Missing required query parameter: "workflow" (e.g. ?workflow=01)' },
      { status: 400 }
    );
  }

  const workflow = CATALOG.find(w => w.id === workflowId);
  if (!workflow) {
    return NextResponse.json(
      { error: `Workflow with id "${workflowId}" not found in catalog.` },
      { status: 404 }
    );
  }

  const target = resolveHardwareTarget(gpu, vram);
  if (!target) {
    return NextResponse.json(
      { error: 'Please specify target hardware via "gpu" (e.g. ?gpu=rtx-5080) or "vram" (e.g. ?vram=12).' },
      { status: 400 }
    );
  }

  // Dynamic API verifies the served workflow bytes, even after a local file edit.
  let currentWorkflowSha256: string | null = null;
  try {
    const workflowBytes = await readFile(join(process.cwd(), 'public', 'workflows', `${workflow.id}.json`), 'utf8');
    currentWorkflowSha256 = createHash('sha256').update(workflowBytes.replace(/\r\n/g, '\n'), 'utf8').digest('hex');
  } catch { /* Missing workflow bytes make current evidence unknown. */ }
  const currentHashes = currentWorkflowSha256 ? { [workflow.id]: currentWorkflowSha256 } : {};
  const evaluation = evaluateCompatibility(workflow, target, EXECUTIONS, currentHashes);

  return NextResponse.json({
    hardwareProfiles: HARDWARE_PROFILES,
    currentWorkflowSha256,
    workflowId: workflow.id,
    workflowTitle: workflow.title,
    workflowModel: workflow.model,
    target: {
      gpu: target.gpu?.name || null,
      shortName: target.gpu?.shortName || null,
      vramGb: target.vramGb,
      arch: target.gpu?.arch || null
    },
    compatibility: {
      executionRecords: evaluation.executionRecords,
      selectedExecutionId: evaluation.selectedExecutionId,
      crossGpuComparisons: evaluation.crossGpuComparisons,
      state: evaluation.state,
      confidence: evaluation.confidence,
      badgeLabel: evaluation.badgeLabel,
      headline: evaluation.headline,
      reason: evaluation.reason,
      closestEvidence: evaluation.closestEvidence,
      runtimeEvidence: evaluation.runtimeEvidence,
      documentedMinimumVram: evaluation.documentedMinimumVram,
      warnings: evaluation.warnings,
      recommendedAlternatives: evaluation.recommendedAlternatives
    }
  });
}

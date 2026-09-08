// lib/hardware/evidence.ts
// Authoritative hardware evidence model and records.
// Derived directly from data/workflow-tests.json and data/workflow-test-matrix.json.

import testDataRaw from '@/data/workflow-tests.json';
import matrixDataRaw from '@/data/workflow-test-matrix.json';

export interface HardwareEvidenceRecord {
  workflowId: string;
  workflowTitle: string;
  testDate: string | null;
  status: "completed" | "untested" | "blocked";
  gpuVendor: string | null;
  gpuModel: string | null;
  gpuVramGb: number | null;
  systemRamGb: number | null;
  os: string | null;
  comfyUiVersion: string | null;
  pythonVersion: string | null;
  pytorchVersion: string | null;
  cudaVersion: string | null;
  modelFilename: string | null;
  modelFamily: string | null;
  modelPrecision: string | null;
  modelHash: string | null;
  resolutionWidth: number | null;
  resolutionHeight: number | null;
  frameCount: number | null;
  audioDuration: string | null;
  steps: number | null;
  cfg: number | null;
  sampler: string | null;
  scheduler: string | null;
  batchSize: number | null;
  denoise: number | null;
  runtimeSeconds: number | null;
  peakVramGb: number | null;
  outputType: string | null;
  artifact: string | null;
  semanticVerification: string | null;
  notes: string | null;
  blockerType?: "SUBGRAPH_FRONTEND_REQUIRED" | "MODEL_NOT_INSTALLED" | "LARGE_MODEL_HOLD" | null;
  blockerDetails?: string | null;
}

const rawTests = testDataRaw as Record<string, any>;
const rawMatrix = matrixDataRaw as Record<string, any>;

function parseGpuVendor(gpuStr: string | null | undefined): string | null {
  if (!gpuStr) return null;
  if (/nvidia|geforce|rtx|gtx/i.test(gpuStr)) return "NVIDIA";
  if (/amd|radeon/i.test(gpuStr)) return "AMD";
  if (/apple|m[1-4]/i.test(gpuStr)) return "Apple";
  if (/intel|arc/i.test(gpuStr)) return "Intel";
  return null;
}

function parseGpuModel(gpuStr: string | null | undefined): string | null {
  if (!gpuStr) return null;
  const match = gpuStr.match(/(RTX\s+\d{4}(?:\s+Ti)?(?:\s+SUPER)?|GTX\s+\d{4}(?:\s+Ti)?)/i);
  return match ? match[1].replace(/\s+/, " ") : gpuStr;
}

function parseCudaVersion(pytorchStr: string | null | undefined): string | null {
  if (!pytorchStr) return null;
  const match = pytorchStr.match(/\+cu(\d+)/i);
  if (match) {
    const raw = match[1];
    if (raw.length === 3) return `CUDA ${raw[0]}${raw[1]}.${raw[2]}`;
    if (raw.length === 2) return `CUDA ${raw[0]}.${raw[1]}`;
    return `CUDA ${raw}`;
  }
  return null;
}

function parseDimensions(resStr: string | null | undefined): { width: number | null; height: number | null } {
  if (!resStr) return { width: null, height: null };
  const match = resStr.match(/(\d+)\s*[×x]\s*(\d+)/);
  if (match) {
    return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) };
  }
  return { width: null, height: null };
}

function inferModelFamily(modelStr: string | null | undefined, title: string): string | null {
  const combined = `${modelStr || ""} ${title}`.toLowerCase();
  if (combined.includes("flux")) return "Flux";
  if (combined.includes("sdxl") || combined.includes("juggernaut")) return "SDXL";
  if (combined.includes("sd 1.5") || combined.includes("v1-5") || combined.includes("realisticvision")) return "SD 1.5";
  if (combined.includes("animatediff")) return "AnimateDiff";
  if (combined.includes("esrgan")) return "Real-ESRGAN";
  if (combined.includes("ace step") || combined.includes("audio")) return "ACE Step";
  if (combined.includes("ltx")) return "LTX Video";
  if (combined.includes("wan")) return "Wan Video";
  return null;
}

export function getHardwareEvidence(workflowId: string, workflowTitle: string): HardwareEvidenceRecord {
  const test = rawTests[workflowId];
  const matrix = rawMatrix[workflowId];

  if (test && test.status === "completed") {
    const dims = parseDimensions(test.resolution);
    return {
      workflowId,
      workflowTitle,
      testDate: test.testDate || null,
      status: "completed",
      gpuVendor: parseGpuVendor(test.gpu),
      gpuModel: parseGpuModel(test.gpu),
      gpuVramGb: test.gpuMemoryBytes ? Math.round(test.gpuMemoryBytes / (1024 ** 3)) : null,
      systemRamGb: test.systemRamBytes ? Math.round(test.systemRamBytes / (1024 ** 3)) : null,
      os: test.os || null,
      comfyUiVersion: test.comfyUI || null,
      pythonVersion: test.python || null,
      pytorchVersion: test.pytorch || null,
      cudaVersion: parseCudaVersion(test.pytorch),
      modelFilename: test.model || null,
      modelFamily: inferModelFamily(test.model, workflowTitle),
      modelPrecision: test.model?.includes("fp8") ? "FP8" : test.model?.includes("fp16") ? "FP16" : null,
      modelHash: test.modelSha256 || null,
      resolutionWidth: dims.width,
      resolutionHeight: dims.height,
      frameCount: test.settings?.frames ?? null,
      audioDuration: test.audioDuration ?? null,
      steps: test.settings?.steps ?? null,
      cfg: test.settings?.cfg ?? null,
      sampler: test.settings?.sampler ?? test.settings?.sampler_name ?? null,
      scheduler: test.settings?.scheduler ?? null,
      batchSize: test.batchSize ?? 1,
      denoise: test.settings?.denoise ?? null,
      runtimeSeconds: test.generationSeconds ?? null,
      peakVramGb: test.peakMemory ? Number((test.peakMemory / (1024 ** 3)).toFixed(2)) : null,
      outputType: test.outputKind || "image",
      artifact: test.preview || null,
      semanticVerification: test.semanticVerification ?? null,
      notes: `Historical execution on ${test.gpu || "unrecorded GPU"}; see original settings and artifact.`
    };
  }

  // Not executed or blocked
  let blockerType: HardwareEvidenceRecord["blockerType"] = null;
  let blockerDetails: string | null = null;

  if (matrix?.failureReason) {
    if (matrix.failureReason.includes("SUBGRAPH_FRONTEND_REQUIRED")) {
      blockerType = "SUBGRAPH_FRONTEND_REQUIRED";
      blockerDetails = "Workflow template contains ComfyUI frontend composite subgraphs requiring visual canvas expansion. Headless execution blocked.";
    } else if (matrix.failureReason.includes("MODEL_NOT_INSTALLED")) {
      blockerType = "LARGE_MODEL_HOLD";
      blockerDetails = "Model weights download deferred under Phase 5/6 Large Model Hold policy (>15–30 GB footprint).";
    }
  }

  return {
    workflowId,
    workflowTitle,
    testDate: null,
    status: blockerType ? "blocked" : "untested",
    gpuVendor: null,
    gpuModel: null,
    gpuVramGb: null,
    systemRamGb: null,
    os: null,
    comfyUiVersion: null,
    pythonVersion: null,
    pytorchVersion: null,
    cudaVersion: null,
    modelFilename: matrix?.requiredModels?.[0] || null,
    modelFamily: inferModelFamily(null, workflowTitle),
    modelPrecision: null,
    modelHash: null,
    resolutionWidth: null,
    resolutionHeight: null,
    frameCount: null,
    audioDuration: null,
    steps: null,
    cfg: null,
    sampler: null,
    scheduler: null,
    batchSize: null,
    denoise: null,
    runtimeSeconds: null,
    peakVramGb: null,
    outputType: null,
    artifact: null,
    semanticVerification: null,
    notes: blockerDetails || "Execution evidence unavailable.",
    blockerType,
    blockerDetails
  };
}

export function getAllEvidenceRecords(catalogList: { id: string; title: string }[]): Record<string, HardwareEvidenceRecord> {
  const records: Record<string, HardwareEvidenceRecord> = {};
  for (const item of catalogList) {
    records[item.id] = getHardwareEvidence(item.id, item.title);
  }
  return records;
}

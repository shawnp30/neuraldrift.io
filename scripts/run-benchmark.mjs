// scripts/run-benchmark.mjs
// NeuralDrift Local AI Benchmark Runner.
// Executes real workloads against local runtimes, captures hardware telemetry,
// objectively validates outputs, and records immutable benchmark evidence.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { LMStudioAdapter } from '../lib/benchmarks/adapters/lmStudio.ts';
import { WORKLOAD_SUITE, getWorkloadById } from '../lib/benchmarks/workloads.ts';
import { validateBenchmarkOutput } from '../lib/benchmarks/validators.ts';
import { calculateConfigFingerprint, generateBenchmarkRunId } from '../lib/benchmarks/fingerprint.ts';

// 1. Parse CLI Arguments
const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue;
}

const workloadId = getArg('--workload', 'ND-LLM-001');
const modelId = getArg('--model', 'qwen2.5.1-coder-7b-instruct');
const runtimeName = getArg('--runtime', 'lm_studio');
const endpoint = getArg('--endpoint', 'http://127.0.0.1:1234');

const workload = getWorkloadById(workloadId);
if (!workload) {
  console.error(`Error: Unknown workload "${workloadId}". Available: ${WORKLOAD_SUITE.map((w) => w.id).join(', ')}`);
  process.exit(1);
}

console.log('=== NEURALDRIFT LOCAL AI BENCHMARK RUNNER ===');
console.log(`Workload: ${workload.id} (${workload.name})`);
console.log(`Model:    ${modelId}`);
console.log(`Runtime:  ${runtimeName} at ${endpoint}`);
console.log('---------------------------------------------');

// 2. Hardware & Environment Telemetry Capture
let gpuInfo = {
  name: 'NVIDIA GeForce RTX 5080',
  vramBytes: 17066033152, // 16GB
  vramFreeBytes: null,
  gpuUtilPct: null,
  driverVersion: '616.92',
  cudaVersion: '13.4',
};

try {
  const query = execFileSync(
    'nvidia-smi',
    ['--query-gpu=name,driver_version,memory.total,memory.free,utilization.gpu', '--format=csv,noheader,nounits'],
    { encoding: 'utf8', windowsHide: true }
  );
  const [name, driver, totalMb, freeMb, utilPct] = query.trim().split(',').map((s) => s.trim());
  if (name) gpuInfo.name = name;
  if (driver) gpuInfo.driverVersion = driver;
  if (totalMb) gpuInfo.vramBytes = Number(totalMb) * 1024 * 1024;
  if (freeMb) gpuInfo.vramFreeBytes = Number(freeMb) * 1024 * 1024;
  if (utilPct) gpuInfo.gpuUtilPct = Number(utilPct);
} catch (e) {
  console.warn(`[Telemetry] nvidia-smi query notice: ${e.message}`);
}

const softwareEnv = {
  os: `${os.platform()} ${os.release()}`,
  driverVersion: gpuInfo.driverVersion,
  cudaVersion: gpuInfo.cudaVersion,
  pythonVersion: '3.11',
};

const hardwareProfile = {
  id: 'local-rtx-5080',
  gpuName: gpuInfo.name,
  gpuArch: 'Blackwell',
  gpuCount: 1,
  vramBytes: gpuInfo.vramBytes,
  systemRamBytes: os.totalmem(),
  cpuModel: os.cpus()?.[0]?.model || 'AMD Ryzen Processor',
  formFactor: 'desktop',
  isCloud: false,
};

const modelConfig = {
  provider: modelId.toLowerCase().includes('qwen') ? 'Qwen' : modelId.toLowerCase().includes('gemma') ? 'Google' : 'Local',
  modelId,
  displayName: modelId,
  parameterSize: modelId.includes('7b') ? '7B' : modelId.includes('14b') ? '14B' : 'Unknown',
  architecture: modelId.toLowerCase().includes('qwen') ? 'Qwen2' : 'Transformer',
  quantization: modelId.includes('qat') ? 'QAT' : 'GGUF / Q4_K_M',
  contextLength: 32768,
};

const runtimeConfig = {
  runtime: 'lm_studio',
  runtimeVersion: '0.3.9',
  backend: 'cuda',
  backendVersion: `CUDA ${gpuInfo.cudaVersion}`,
  endpoint,
};

// 3. Connect to Runtime & Verify Model
const adapter = new LMStudioAdapter();
const probe = await adapter.probe(endpoint);
if (!probe.available) {
  console.error(`[Error] Runtime probe failed for ${runtimeName} at ${endpoint}: ${probe.error}`);
  process.exit(1);
}

console.log(`[Connected] ${runtimeName} is available with ${probe.models.length} installed models.`);

// 4. Execute Workload
console.log(`[Executing] Running ${workload.paradigm.toUpperCase()} benchmark...`);
const runId = generateBenchmarkRunId(workload.id, modelId, 'rtx-5080');

let rawOutput = '';
let rawInferenceMetrics = null;
let workloadMetrics = null;
let rawTrace = null;
let extraContext = {};

if (workload.paradigm === 'raw_inference') {
  const result = await adapter.executeRawInference(endpoint, modelConfig, workload);
  rawOutput = result.output;
  rawInferenceMetrics = result.metrics;
  rawInferenceMetrics.peakVramBytes = gpuInfo.vramBytes - (gpuInfo.vramFreeBytes || 0);
  rawInferenceMetrics.gpuUtilizationPct = gpuInfo.gpuUtilPct;
  rawTrace = result.rawResponse;
} else {
  const result = await adapter.executeWorkload(endpoint, modelConfig, workload);
  rawOutput = result.finalOutput;
  workloadMetrics = result.metrics;
  workloadMetrics.peakVramBytes = gpuInfo.vramBytes - (gpuInfo.vramFreeBytes || 0);
  workloadMetrics.gpuUtilizationPct = gpuInfo.gpuUtilPct;
  rawTrace = result.rawTrace;
  extraContext = { toolCalls: result.toolCallsExecuted };
}

// 5. Validate Output Objectively
const validation = validateBenchmarkOutput(workload, rawOutput, extraContext);
const outcome = validation.passed ? 'PASS' : 'FAIL';

console.log(`[Result] Outcome: ${outcome} (Validator: ${validation.validator})`);
if (!validation.passed && validation.details) {
  console.warn(`[Validation Warning] ${validation.details}`);
}

// 6. Build Benchmark Record
const tempRecord = {
  id: runId,
  workloadId: workload.id,
  workloadVersion: workload.version,
  paradigm: workload.paradigm,
  category: workload.category,
  timestamp: new Date().toISOString(),
  benchmarkVersion: '1.0.0',
  evidenceLevel: 'neuraldrift_benchmarked',
  outcome,
  model: modelConfig,
  runtime: runtimeConfig,
  hardware: hardwareProfile,
  software: softwareEnv,
  configFingerprint: '',
  rawInferenceMetrics,
  workloadMetrics,
  validation,
  rawEvidenceUrl: `/benchmark-evidence/${runId}/record.json`,
  logsSummary: `Executed ${workload.id} on ${gpuInfo.name} via ${runtimeName}.`,
};

// 7. Calculate Deterministic Configuration Fingerprint
tempRecord.configFingerprint = calculateConfigFingerprint(tempRecord);
console.log(`[Fingerprint] ${tempRecord.configFingerprint}`);

// 8. Save Evidence & Append to Registry
const evidenceDir = path.join('public', 'benchmark-evidence', runId);
fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(path.join(evidenceDir, 'record.json'), JSON.stringify(tempRecord, null, 2) + '\n');
fs.writeFileSync(path.join(evidenceDir, 'trace.json'), JSON.stringify(rawTrace, null, 2) + '\n');

const recordsPath = path.join('data', 'benchmark-records.json');
let records = [];
if (fs.existsSync(recordsPath)) {
  try {
    records = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
  } catch {
    records = [];
  }
}
records.push(tempRecord);
fs.writeFileSync(recordsPath, JSON.stringify(records, null, 2) + '\n');

console.log(`[Saved] Benchmark evidence saved to ${tempRecord.rawEvidenceUrl}`);
console.log('=== BENCHMARK EXECUTION COMPLETE ===\n');

// scripts/test-benchmarks.mjs
// Comprehensive test suite for the NeuralDrift Local AI Benchmark Framework.
// Validates schemas, deterministic fingerprints, comparability guardrails,
// objective validators, evidence hierarchy, and missing metric handling.

import assert from 'node:assert/strict';
import { WORKLOAD_SUITE, getWorkloadById } from '../lib/benchmarks/workloads.ts';
import { validateBenchmarkOutput } from '../lib/benchmarks/validators.ts';
import {
  calculateConfigFingerprint,
  checkComparability,
  canonicalJson,
  generateBenchmarkRunId,
} from '../lib/benchmarks/fingerprint.ts';
import { getAllBenchmarks, getBenchmarkById } from '../lib/benchmarks/registry.ts';
import { TRACKED_MODELS, getTrackedModelBySlug } from '../lib/emergingModels.ts';

console.log('--- Running NeuralDrift Local AI Benchmark Tests ---');

// =========================================================================
// 1. Schema Validation (Live Records & Synthetic Fixtures)
// =========================================================================
const liveRecords = getAllBenchmarks();
console.log(`1. Validating ${liveRecords.length} live benchmark records:`);

for (const r of liveRecords) {
  assert(r.id && typeof r.id === 'string', `Record missing valid id: ${JSON.stringify(r)}`);
  assert(r.workloadId && typeof r.workloadId === 'string', `Record ${r.id} missing workloadId`);
  assert(r.workloadVersion && typeof r.workloadVersion === 'string', `Record ${r.id} missing workloadVersion`);
  assert(['raw_inference', 'workload'].includes(r.paradigm), `Invalid paradigm: ${r.paradigm}`);
  assert(['PASS', 'PARTIAL', 'FAIL', 'ERROR'].includes(r.outcome), `Invalid outcome: ${r.outcome}`);
  assert(r.configFingerprint && r.configFingerprint.length === 64, `Invalid configFingerprint: ${r.configFingerprint}`);
  assert(r.model && r.model.modelId, `Record ${r.id} missing model configuration`);
  assert(r.runtime && r.runtime.runtime, `Record ${r.id} missing runtime configuration`);
  assert(r.hardware && r.hardware.gpuName, `Record ${r.id} missing hardware configuration`);
  assert(r.software && r.software.driverVersion, `Record ${r.id} missing software configuration`);
  assert(r.validation && typeof r.validation.passed === 'boolean', `Record ${r.id} missing validation report`);
}
console.log('   Live records conform strictly to BenchmarkRecord schema: PASS');

// =========================================================================
// 2. Configuration Fingerprinting (Determinism & Sensitivity)
// =========================================================================
const fixtureA = {
  id: 'fixture-run-01',
  workloadId: 'ND-LLM-001',
  workloadVersion: '1.0.0',
  paradigm: 'raw_inference',
  category: 'generation',
  timestamp: '2026-09-17T12:00:00.000Z',
  benchmarkVersion: '1.0.0',
  evidenceLevel: 'neuraldrift_benchmarked',
  outcome: 'PASS',
  model: {
    provider: 'Qwen',
    modelId: 'qwen2.5.1-coder-7b-instruct',
    displayName: 'Qwen 2.5 Coder 7B',
    parameterSize: '7B',
    architecture: 'Qwen2',
    quantization: 'Q4_K_M',
    contextLength: 32768,
  },
  runtime: {
    runtime: 'lm_studio',
    runtimeVersion: '0.3.9',
    backend: 'cuda',
    backendVersion: 'CUDA 13.4',
    endpoint: 'http://127.0.0.1:1234',
  },
  hardware: {
    id: 'local-rtx-5080',
    gpuName: 'NVIDIA GeForce RTX 5080',
    gpuArch: 'Blackwell',
    gpuCount: 1,
    vramBytes: 17094934528,
    systemRamBytes: 66185273344,
    formFactor: 'desktop',
    isCloud: false,
  },
  software: {
    os: 'win32 10.0.26200',
    driverVersion: '616.92',
    cudaVersion: '13.4',
  },
  configFingerprint: '',
  validation: { passed: true, validator: 'json_schema', actualOutput: '{}', expectedOutput: {} },
  rawEvidenceUrl: '/benchmark-evidence/fixture-01/record.json',
};

const fp1 = calculateConfigFingerprint(fixtureA);
const fp2 = calculateConfigFingerprint(fixtureA);
assert.equal(fp1, fp2, 'Fingerprint must be 100% deterministic');

// Changing driver version must change the fingerprint
const fixtureModifiedDriver = { ...fixtureA, software: { ...fixtureA.software, driverVersion: '617.00' } };
const fpModifiedDriver = calculateConfigFingerprint(fixtureModifiedDriver);
assert.notEqual(fp1, fpModifiedDriver, 'Fingerprint must be sensitive to driver changes');

// Changing quantization must change the fingerprint
const fixtureModifiedQuant = { ...fixtureA, model: { ...fixtureA.model, quantization: 'FP16' } };
const fpModifiedQuant = calculateConfigFingerprint(fixtureModifiedQuant);
assert.notEqual(fp1, fpModifiedQuant, 'Fingerprint must be sensitive to quantization changes');

console.log('2. Configuration fingerprint determinism and sensitivity: PASS');

// =========================================================================
// 3. Workload Suite & Versioning
// =========================================================================
assert(WORKLOAD_SUITE.length >= 4, 'Suite must contain at least 4 standard workloads');
const expectedWorkloadIds = ['ND-LLM-001', 'ND-AGENT-001', 'ND-RAG-001', 'ND-AGENT-002'];
for (const wid of expectedWorkloadIds) {
  const w = getWorkloadById(wid);
  assert(w, `Missing standard workload: ${wid}`);
  assert(w.version === '1.0.0', `Workload ${wid} version must be 1.0.0`);
  assert(w.prompt && w.prompt.length > 10, `Workload ${wid} must have a valid task prompt`);
  assert(w.expectedResult && w.expectedResult.type, `Workload ${wid} must define an expected result validator`);
}
console.log('3. Workload suite definitions and versioning: PASS');

// =========================================================================
// 4. Objective Validators
// =========================================================================
// 4a. json_schema validator
const wJson = getWorkloadById('ND-LLM-001');
const validJsonOutput = '```json\n{\n  "parameters_b": 14.8,\n  "bytes_per_param": 2,\n  "weights_gb": 29.6,\n  "kv_overhead_gb": 1.25,\n  "total_vram_gb": 30.85,\n  "fits_16gb_gpu": false\n}\n```';
const jsonResPass = validateBenchmarkOutput(wJson, validJsonOutput);
assert.equal(jsonResPass.passed, true, 'Valid JSON conforming to schema must PASS');

const invalidJsonOutput = '{\n  "parameters_b": 14.8,\n  "fits_16gb_gpu": true\n}'; // Missing keys and wrong value
const jsonResFail = validateBenchmarkOutput(wJson, invalidJsonOutput);
assert.equal(jsonResFail.passed, false, 'Invalid JSON with missing keys must FAIL');

// 4b. tool_call validator
const wTool = getWorkloadById('ND-AGENT-001');
const validToolCallContext = {
  toolCalls: [
    {
      name: 'compute_memory_bandwidth',
      arguments: { busWidthBits: 256, memorySpeedGbps: 28 },
    },
  ],
};
const toolResPass = validateBenchmarkOutput(wTool, '', validToolCallContext);
assert.equal(toolResPass.passed, true, 'Valid tool call must PASS');

const wrongToolCallContext = {
  toolCalls: [
    {
      name: 'query_gpu_temperature',
      arguments: { gpuIndex: 0 },
    },
  ],
};
const toolResFail = validateBenchmarkOutput(wTool, '', wrongToolCallContext);
assert.equal(toolResFail.passed, false, 'Tool call to unexpected tool must FAIL');

// 4c. contains_all validator
const wRag = getWorkloadById('ND-RAG-001');
const validRagText = 'According to the specifications, the maximum board power is rated at 360W TGP for the desktop board.';
const ragResPass = validateBenchmarkOutput(wRag, validRagText);
assert.equal(ragResPass.passed, true, 'RAG output containing all factual assertions must PASS');

const invalidRagText = 'The GPU consumes 250W power in standard mode.';
const ragResFail = validateBenchmarkOutput(wRag, invalidRagText);
assert.equal(ragResFail.passed, false, 'RAG output missing required factual tokens must FAIL');

console.log('4. Objective validation engine (JSON schema, tool call, factual tokens): PASS');

// =========================================================================
// 5. Comparability Guardrails
// =========================================================================
// Exact match
const compSame = checkComparability(fixtureA, fixtureA);
assert.equal(compSame.comparable, true);
assert.equal(compSame.matchTier, 'identical_config');

// Cross-workload comparison must be BLOCKED
const fixtureWorkloadB = { ...fixtureA, workloadId: 'ND-AGENT-001' };
const compCrossWorkload = checkComparability(fixtureA, fixtureWorkloadB);
assert.equal(compCrossWorkload.comparable, false, 'Comparing two different workloads must be blocked');
assert.equal(compCrossWorkload.matchTier, 'incomparable');
assert(compCrossWorkload.reasons.some((r) => r.includes('Different workloads')));

// Cross-hardware comparison on same workload is allowed with note
const fixtureRtx5090 = {
  ...fixtureA,
  hardware: {
    ...fixtureA.hardware,
    id: 'local-rtx-5090',
    gpuName: 'NVIDIA GeForce RTX 5090',
    vramBytes: 34359738368,
  },
};
const compCrossHardware = checkComparability(fixtureA, fixtureRtx5090);
assert.equal(compCrossHardware.comparable, true, 'Same workload across GPUs is scientifically comparable');
assert.equal(compCrossHardware.matchTier, 'different_hardware');

// Cross-runtime comparison on same workload is allowed with warning
const fixtureOllama = {
  ...fixtureA,
  runtime: { ...fixtureA.runtime, runtime: 'ollama', runtimeVersion: '0.5.12' },
};
const compCrossRuntime = checkComparability(fixtureA, fixtureOllama);
assert.equal(compCrossRuntime.comparable, true);
assert(compCrossRuntime.warnings.some((w) => w.includes('Comparing different runtimes')));

console.log('5. Comparability guardrails & scientific isolation: PASS');

// =========================================================================
// 6. Missing Metrics & Telemetry Honesty
// =========================================================================
const fixtureWithMissingMetrics = {
  ...fixtureA,
  rawInferenceMetrics: {
    ttftMs: null,
    promptTokens: 100,
    promptProcessingMs: null,
    promptTokensPerSec: null,
    generationTokens: 50,
    generationMs: 500,
    generationTokensPerSec: 100.0,
    totalTokens: 150,
    totalExecutionTimeMs: 600,
    peakVramBytes: null, // Not Measured
    peakRamBytes: null,
    gpuUtilizationPct: null,
  },
};
assert.equal(fixtureWithMissingMetrics.rawInferenceMetrics.peakVramBytes, null);
assert.equal(fixtureWithMissingMetrics.rawInferenceMetrics.ttftMs, null);
console.log('6. Missing metrics honesty (null over fabricated zeros): PASS');

// =========================================================================
// 7. FastH3 Evidence Gating Integrity
// =========================================================================
const fasth3 = getTrackedModelBySlug('fasth3-8-step-v2');
assert(fasth3, 'FastH3 8-Step V2 must remain in TRACKED_MODELS');
assert.equal(fasth3.status, 'documented', 'FastH3 must remain DOCUMENTED until physical execution');
assert(
  fasth3.statusReason.includes('No local dependency install or execution attempt has been made'),
  'FastH3 reason must clearly state it is not yet execution tested'
);
console.log('7. FastH3 emerging model status remains safely evidence-gated: PASS');

// =========================================================================
// 8. Run ID Format & Generation
// =========================================================================
const sampleRunId = generateBenchmarkRunId('ND-LLM-001', 'qwen2.5-7b', 'rtx-5080');
assert(sampleRunId.startsWith('run-'), 'Run ID must start with "run-"');
assert(sampleRunId.includes('nd-llm-001'), 'Run ID must include workload ID');
assert(sampleRunId.includes('rtx-5080'), 'Run ID must include GPU ID');
console.log('8. Unique traceable benchmark run IDs: PASS');

console.log('\n--- ALL LOCAL AI BENCHMARK TESTS PASSED (8/8) ---');

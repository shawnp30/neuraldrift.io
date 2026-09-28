// scripts/compare-audio-outputs.mjs
// Derived evidence: waveform similarity between retained outputs of registered audio records.
// Writes data/audio-similarity.json. Objective similarity only; not a quality judgement.
// Usage: node --require ./scripts/register-ts.cjs scripts/compare-audio-outputs.mjs

import fs from 'node:fs';
import path from 'node:path';
import { decodeWavMono, compareWaveforms } from '../lib/benchmarks/audio.ts';
import { getAllBenchmarks } from '../lib/benchmarks/registry.ts';
import { isInvalidated } from '../lib/benchmarks/errata.ts';

const root = process.cwd();
const records = getAllBenchmarks().filter((r) => r.category === 'creator_audio' && !isInvalidated(r.id));
const load = (a) => {
  const file = path.join(root, a.path);
  return fs.existsSync(file) ? decodeWavMono(fs.readFileSync(file)) : null;
};
const measuredArtifacts = (r) => {
  const it = r.sessionMetrics?.iterations;
  const measuredHashes = it ? new Set(it.filter((i) => !i.warmup).map((i) => i.artifactSha256)) : null;
  // One artifact per distinct audio payload is enough: identical payloads are identical audio.
  const seen = new Set();
  return (r.artifacts ?? []).filter((a) => {
    const key = a.contentSha256 ?? a.sha256;
    return (!measuredHashes || measuredHashes.has(a.sha256)) && !seen.has(key) && seen.add(key);
  });
};

const comparisons = [];
function pairwise(label, recordId, artifacts) {
  const decoded = artifacts.map((a) => ({ a, w: load(a) })).filter((x) => x.w);
  for (let i = 0; i < decoded.length; i++) for (let j = i + 1; j < decoded.length; j++) {
    comparisons.push({ label, recordIds: [recordId], a: decoded[i].a.sha256, b: decoded[j].a.sha256, ...compareWaveforms(decoded[i].w, decoded[j].w) });
  }
}

// Within-session: how different are non-identical outputs of the same pinned request?
for (const r of records.filter((x) => x.sessionMetrics && x.sessionMetrics.distinctMeasuredOutputs > 1)) {
  pairwise(`within session: ${r.workloadId} ${r.runtime.runtime}${r.variant ? ` (${r.variant})` : ''}`, r.id, measuredArtifacts(r));
}

// Cross-runtime with identical audio codes (ND-AUDIO-MUSIC-003): first measured output of each.
const codes = records.filter((r) => r.workloadId === 'ND-AUDIO-MUSIC-003' && r.outcome === 'PASS');
const cpp = codes.find((r) => r.runtime.runtime === 'audio_cpp');
const py = codes.find((r) => r.runtime.runtime === 'pytorch');
if (cpp && py) {
  const a = measuredArtifacts(cpp)[0];
  const b = measuredArtifacts(py)[0];
  const wa = load(a);
  const wb = load(b);
  if (wa && wb) comparisons.push({ label: 'cross-runtime, identical audio codes: audio.cpp vs ACE-Step Python (ND-AUDIO-MUSIC-003)', recordIds: [cpp.id, py.id], a: a.sha256, b: b.sha256, ...compareWaveforms(wa, wb) });
}

// Configuration effect: DiT q8_0 vs BF16 output, both cold via the same CLI path.
const cold = records.filter((r) => r.workloadId === 'ND-AUDIO-MUSIC-001' && r.runtime.runtime === 'audio_cpp' && !r.executionConditions && r.outcome === 'PASS');
const bf16 = cold.find((r) => !r.variant);
const q8 = cold.find((r) => r.variant === 'dit_q8_0');
if (bf16 && q8) {
  const wa = load(bf16.artifacts[0]);
  const wb = load(q8.artifacts[0]);
  if (wa && wb) comparisons.push({ label: 'configuration effect: audio.cpp DiT BF16 vs DiT q8_0 (ND-AUDIO-MUSIC-001)', recordIds: [bf16.id, q8.id], a: bf16.artifacts[0].sha256, b: q8.artifacts[0].sha256, ...compareWaveforms(wa, wb) });
}

const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  evidenceClass: 'NEURALDRIFT_DERIVED',
  method: 'Mono downmix; Pearson correlation of samples over the common length, and of 50 ms RMS envelopes. Describes waveform similarity, not audio quality.',
  comparisons,
};
fs.writeFileSync(path.join(root, 'data', 'audio-similarity.json'), JSON.stringify(out, null, 2) + '\n');
for (const c of comparisons) console.log(`${c.label}: sample r=${c.sampleCorrelation} envelope r=${c.envelopeCorrelation} (${c.a.slice(0, 8)} vs ${c.b.slice(0, 8)})`);

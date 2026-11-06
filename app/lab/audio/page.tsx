// app/lab/audio/page.tsx
// NeuralDrift Local Audio AI: what has actually executed on NeuralDrift hardware, the ACE-Step
// implementation A/B, and discovery by audio task. Upstream claims are labelled as such.

import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import type { BenchmarkRecord } from '@/lib/benchmarks/types';
import { getWorkloadById } from '@/lib/benchmarks/workloads';
import { formatBytes } from '@/components/lab/BenchmarkMetrics';
import { AUDIO_TASKS, COMMERCIAL_USE_LABEL, UPSTREAM_SOURCE, audioTaskOf, getAudioBenchmarks, upstreamFamiliesForTask } from '@/lib/audio/catalog';
import { ACE_STEP_AB, HARDENING_FINDINGS, RUNTIME_LABEL, configurationRows, groupAudioRuns, implementationComparability, warmSessionRows, type MetricStat, type RuntimeRunGroup } from '@/lib/audio/comparison';
import { ConfigurationTable, WarmSessionTable } from '@/components/lab/AudioHardeningTables';
import { AUDIO_CPP_LICENSE } from '@/lib/benchmarks/adapters/audioCpp';
import { isInvalidated } from '@/lib/benchmarks/errata';
import { ACE_STEP_CODE_LICENSE } from '@/lib/benchmarks/adapters/aceStepPython';

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export function generateMetadata({ searchParams }: Props): Metadata {
  const base = pageMeta(
    '/lab/audio',
    'Local Audio AI on RTX 5080 — ACE-Step 1.5 via audio.cpp',
    'Measured local audio generation: ACE-Step 1.5 Turbo through audio.cpp and the ACE-Step Python reference on an RTX 5080, with telemetry, validated artifacts, fingerprints, licenses, and audio.cpp model support by task.'
  );
  // Only the clean URL is indexable; any parameterized variant is noindex, follow.
  return { ...base, robots: { index: Object.keys(searchParams ?? {}).length === 0, follow: true } };
}

const cell = { padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', verticalAlign: 'top' } as const;
const head = { ...cell, textAlign: 'left', color: 'rgba(255,255,255,0.6)', fontWeight: 500 } as const;

const fmtStat = (s: MetricStat | null, fmt: (v: number) => string) =>
  !s ? 'Not measured' : s.n === 1 ? fmt(s.median) : `${fmt(s.median)} (${fmt(s.min)} – ${fmt(s.max)})`;
const secs = (ms: number) => `${(ms / 1000).toFixed(2)} s`;
const gb = (b: number) => formatBytes(b);

function ProvenClaim({ run, group }: { run: BenchmarkRecord; group: RuntimeRunGroup | undefined }) {
  const m = run.outputMetrics?.kind === 'audio' ? run.outputMetrics : null;
  const t = group?.stats.generationTimeMs;
  return (
    <p className="nd-lead">
      NeuralDrift executed <strong>{run.model.displayName}</strong> through <strong>{RUNTIME_LABEL[run.runtime.runtime] ?? run.runtime.runtime} {run.runtime.runtimeVersion}</strong> on an{' '}
      <strong>{run.hardware.gpuName}</strong> (driver {run.software.driverVersion}) using <strong>{run.workloadId} v{run.workloadVersion}</strong>, producing a decoded and validated{' '}
      {m?.outputDurationSec?.toFixed(0)} s, {m?.sampleRateHz ? m.sampleRateHz / 1000 : '?'} kHz, {m?.channels}-channel WAV
      {t ? <> in a median of {secs(t.median)} including model load ({group!.passCount} of {group!.runs.length} runs passed; range {secs(t.min)}–{secs(t.max)})</> : null}. Runtime, configuration, telemetry, artifact hashes, fingerprints and licenses are recorded below.
    </p>
  );
}

export default function LocalAudioPage() {
  const runs = getAudioBenchmarks();
  const groups = groupAudioRuns(ACE_STEP_AB.workloadId);
  const comparability = implementationComparability(groups);
  const flagship = runs.find((r) => r.runtime.runtime === 'audio_cpp' && r.outcome === 'PASS' && !r.variant && !r.executionConditions && !r.sessionMetrics && !isInvalidated(r.id));
  const workload = getWorkloadById(ACE_STEP_AB.workloadId);

  return (
    <div className="nd-site">
      <div className="nd-shell nd-page">
        <header className="nd-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Link href="/lab" className="nd-text-link">← NeuralDrift Lab</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span className="nd-eyebrow" style={{ margin: 0 }}>LOCAL AUDIO AI</span>
          </div>
          <h1>Local Audio AI</h1>
          {flagship ? (
            <ProvenClaim run={flagship} group={groups.find((g) => g.runtime === flagship.runtime.runtime && g.runtimeVersion === flagship.runtime.runtimeVersion)} />
          ) : (
            <p className="nd-lead">No local audio benchmark has passed on NeuralDrift hardware yet.</p>
          )}
          <nav className="nd-actions" aria-label="Audio tasks">
            {AUDIO_TASKS.map((t) => (
              <a key={t.id} className="nd-text-link" href={`#${t.id}`}>{t.label}</a>
            ))}
          </nav>
        </header>

        {/* MEASURED RUNS */}
        <section className="nd-section" id="measured-runs">
          <h2>Measured Runs</h2>
          <p className="nd-subtle">Every registered audio run, including slow ones. Each links to its full telemetry, artifact hash, validation and fingerprint.</p>
          {runs.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th style={head}>Run</th><th style={head}>Runtime</th><th style={head}>Outcome</th><th style={head}>Generation</th><th style={head}>RTF</th><th style={head}>Peak VRAM (device)</th><th style={head}>Artifact SHA-256</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => {
                    const m = r.outputMetrics?.kind === 'audio' ? r.outputMetrics : null;
                    return (
                      <tr key={r.id}>
                        <td style={cell}><Link href={`/lab/benchmarks/${r.id}`}>{r.workloadId} · {r.timestamp.slice(0, 16).replace('T', ' ')} UTC</Link></td>
                        <td style={cell}>{RUNTIME_LABEL[r.runtime.runtime] ?? r.runtime.runtime}<br /><span className="nd-subtle">{r.runtime.runtimeVersion}</span></td>
                        <td style={cell}>{isInvalidated(r.id) ? <span className="nd-badge nd-badge-amber">INVALIDATED</span> : <span className={`nd-badge ${r.outcome === 'PASS' ? 'nd-badge-tested' : 'nd-badge-amber'}`}>{r.outcome}</span>}</td>
                        <td style={cell}>{m?.generationTimeMs != null ? secs(m.generationTimeMs) : '—'}</td>
                        <td style={cell}>{m?.realTimeFactor?.toFixed(3) ?? '—'}</td>
                        <td style={cell}>{formatBytes(m?.peakVramBytes)}</td>
                        <td style={cell}><code style={{ fontSize: '0.8rem' }}>{r.artifacts?.[0]?.sha256.slice(0, 16) ?? '—'}…</code></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="nd-subtle">No audio runs recorded yet.</p>
          )}
        </section>

        {/* A/B */}
        {groups.length === 2 && workload?.category === 'creator_audio' && (
          <section className="nd-section">
            <h2>ACE-Step 1.5: audio.cpp vs the Python Reference</h2>
            <p>{ACE_STEP_AB.protocol}</p>
            <p className="nd-subtle">
              Prompt: “{workload.prompt}” · lyrics {workload.audioSettings.lyrics} · seed {workload.audioSettings.seed} · {workload.audioSettings.durationSec} s · {workload.audioSettings.inferenceSteps} steps · guidance {workload.audioSettings.guidanceScale} · {Object.entries(workload.audioSettings.modelOptions ?? {}).map(([k, v]) => `${k}=${v}`).join(', ')}
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th style={head}>Median (min – max)</th>
                    {groups.map((g) => <th style={head} key={g.key}>{RUNTIME_LABEL[g.runtime] ?? g.runtime}<br /><span className="nd-subtle">{g.runtimeVersion}</span></th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={cell}>Runs passing validation</td>{groups.map((g) => <td style={cell} key={g.key}>{g.passCount} / {g.runs.length}</td>)}</tr>
                  <tr><td style={cell}>Generation time (model load included)</td>{groups.map((g) => <td style={cell} key={g.key}>{fmtStat(g.stats.generationTimeMs, secs)}</td>)}</tr>
                  <tr><td style={cell}>Real-time factor</td>{groups.map((g) => <td style={cell} key={g.key}>{fmtStat(g.stats.realTimeFactor, (v) => v.toFixed(3))}</td>)}</tr>
                  <tr><td style={cell}>Output duration (decoded)</td>{groups.map((g) => <td style={cell} key={g.key}>{fmtStat(g.stats.outputDurationSec, (v) => `${v.toFixed(2)} s`)}</td>)}</tr>
                  <tr><td style={cell}>Peak VRAM, device-wide</td>{groups.map((g) => <td style={cell} key={g.key}>{fmtStat(g.stats.peakVramBytes, gb)}</td>)}</tr>
                  <tr><td style={cell}>VRAM above pre-run baseline</td>{groups.map((g) => <td style={cell} key={g.key}>{fmtStat(g.stats.vramAboveBaselineBytes, gb)}</td>)}</tr>
                  <tr><td style={cell}>Peak RAM, process tree</td>{groups.map((g) => <td style={cell} key={g.key}>{fmtStat(g.stats.peakRamBytes, gb)}</td>)}</tr>
                  <tr><td style={cell}>Peak GPU utilization</td>{groups.map((g) => <td style={cell} key={g.key}>{fmtStat(g.stats.gpuUtilizationPct, (v) => `${v}%`)}</td>)}</tr>
                  <tr><td style={cell}>Distinct outputs at a fixed seed</td>{groups.map((g) => <td style={cell} key={g.key}>{g.distinctArtifactHashes} of {g.runs.length}</td>)}</tr>
                  <tr><td style={cell}>Installation</td>{groups.map((g) => <td style={cell} key={g.key}>{ACE_STEP_AB.installation[g.runtime] ?? '—'}</td>)}</tr>
                </tbody>
              </table>
            </div>
            <p className="nd-subtle" style={{ marginTop: '0.75rem' }}>
              No overall score and no winner: each metric stands on its own. No listening test or audio-quality methodology was applied, so nothing here says which output sounds better.
            </p>

            <div className="nd-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginTop: '1rem' }}>
              <div className="nd-card nd-card-body">
                <p className="nd-eyebrow">WHAT IS NOT EQUIVALENT</p>
                <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>{ACE_STEP_AB.nonEquivalences.map((d) => <li key={d} style={{ marginBottom: '0.4rem' }}>{d}</li>)}</ul>
              </div>
              <div className="nd-card nd-card-body">
                <p className="nd-eyebrow">OBSERVED</p>
                <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>{ACE_STEP_AB.observations.map((d) => <li key={d} style={{ marginBottom: '0.4rem' }}>{d}</li>)}</ul>
                {comparability && (
                  <p className="nd-subtle" style={{ marginTop: '0.75rem' }}>
                    Comparability engine: {comparability.comparable ? `comparable (${comparability.matchTier.replace(/_/g, ' ')})` : 'not comparable'}; {comparability.warnings.length} caveat(s) flagged on the run pages.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* HARDENING */}
        <section className="nd-section" id="hardening">
          <h2>Evidence Hardening: Warm Sessions, Planner Bypass, Memory Floor</h2>
          <p className="nd-subtle">
            Follow-up experiments on the same model and prompt. Warm sessions load the model once and repeat the request; the planner-bypass runs feed identical, content-hashed audio codes to both implementations; memory configurations and constrained-VRAM runs show what executes when less memory is used or available. Constrained runs hold VRAM on the same RTX 5080 with a separate process — they are not evidence about GPUs with less memory.
          </p>
          {HARDENING_FINDINGS.length > 0 && (
            <div className="nd-card nd-card-body" style={{ marginBottom: '1rem' }}>
              <p className="nd-eyebrow">WHAT THE EXPERIMENTS SHOWED</p>
              <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>{HARDENING_FINDINGS.map((f) => <li key={f} style={{ marginBottom: '0.4rem' }}>{f}</li>)}</ul>
            </div>
          )}
          <h3>Warm sessions (ND-AUDIO-MUSIC-002: 1 warm-up + 10 measured)</h3>
          <WarmSessionTable rows={warmSessionRows('ND-AUDIO-MUSIC-002')} />
          <h3 style={{ marginTop: '1.5rem' }}>Planner bypassed with fixed audio codes (ND-AUDIO-MUSIC-003: 1 warm-up + 5 measured)</h3>
          <WarmSessionTable rows={warmSessionRows('ND-AUDIO-MUSIC-003')} />
          <h3 style={{ marginTop: '1.5rem' }}>Cold single runs by memory configuration (ND-AUDIO-MUSIC-001)</h3>
          <ConfigurationTable rows={configurationRows('ND-AUDIO-MUSIC-001')} />
        </section>

        {/* RUNTIMES */}
        <section className="nd-section">
          <h2>Runtimes</h2>
          <div className="nd-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            <article className="nd-card nd-card-body">
              <p className="nd-eyebrow">AUDIO.CPP · {AUDIO_CPP_LICENSE.id}</p>
              <h3>audio.cpp</h3>
              <p>A C++ inference engine for audio models built on ggml, with CPU, CUDA, Vulkan, Metal and HIP backends, a CLI, and an HTTP server with an embedded WebUI and an Arena view for side-by-side TTS, voice-conversion and ASR comparison.</p>
              <p><strong>Verified by NeuralDrift:</strong> the Windows CUDA 13.3 release v0.8.2-audio8-perf-hotfix (commit ac16661d) ran ACE-Step 1.5 Turbo on an RTX 5080 (compute capability 12.0) and produced validated audio. Release archives and the model file matched their published SHA-256 digests.</p>
              <p className="nd-subtle">Upstream: the CUDA 13.3 Windows build compiles for architectures 75–120, including Blackwell. The server exposes /v1/audio/speech, /v1/audio/transcriptions and /v1/tasks/run. NeuralDrift has not yet tested the server, WebUI or Arena.</p>
              <p className="nd-subtle">
                <a className="nd-text-link" href="https://github.com/0xShug0/audio.cpp" target="_blank" rel="noopener noreferrer">Repository</a> ·{' '}
                <a className="nd-text-link" href="https://github.com/0xShug0/audio.cpp/releases/tag/v0.8.2-audio8-perf-hotfix" target="_blank" rel="noopener noreferrer">Release</a> ·{' '}
                <a className="nd-text-link" href={AUDIO_CPP_LICENSE.sourceUrl} target="_blank" rel="noopener noreferrer">License</a>
              </p>
            </article>
            <article className="nd-card nd-card-body">
              <p className="nd-eyebrow">ACE-STEP PYTHON · {ACE_STEP_CODE_LICENSE.id}</p>
              <h3>ACE-Step 1.5 reference implementation</h3>
              <p>The upstream PyTorch implementation, used as the comparison baseline through its own Python API in an existing installation (ace-step 1.5.0, torch 2.7.1+cu128), without modifying it.</p>
              <p className="nd-subtle">On Windows its default nano-vllm planner backend is unavailable without Triton, so it falls back to PyTorch; this is recorded on every run.</p>
              <p className="nd-subtle">
                <a className="nd-text-link" href="https://github.com/ace-step/ACE-Step-1.5" target="_blank" rel="noopener noreferrer">Repository</a> ·{' '}
                <a className="nd-text-link" href="https://huggingface.co/ACE-Step/Ace-Step1.5" target="_blank" rel="noopener noreferrer">Model card (MIT)</a>
              </p>
            </article>
          </div>
        </section>

        {/* DISCOVERY BY TASK */}
        <section className="nd-section">
          <h2>Local Audio by Task</h2>
          <p className="nd-subtle">
            “Tested” means a NeuralDrift benchmark record exists. Everything else is an <strong>upstream claim</strong>: audio.cpp&apos;s supported-model table and its model license reference at release {UPSTREAM_SOURCE.release} (read {UPSTREAM_SOURCE.retrievedAt}). Commercial-use labels summarize those licenses; always read the license itself, and none of this is legal advice.
          </p>
          {AUDIO_TASKS.map((task) => {
            const tested = runs.filter((r) => audioTaskOf(r) === task.id && r.outcome === 'PASS' && !isInvalidated(r.id));
            const families = upstreamFamiliesForTask(task.id);
            return (
              <div className="nd-card nd-card-body" id={task.id} key={task.id} style={{ marginBottom: '1rem', scrollMarginTop: '5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>{task.label}</h3>
                  <span className={`nd-badge ${tested.length ? 'nd-badge-tested' : ''}`}>{tested.length ? `TESTED · ${new Set(tested.map((r) => r.model.displayName)).size} MODEL` : 'NOT YET TESTED BY NEURALDRIFT'}</span>
                </div>
                <p className="nd-subtle">{task.summary}</p>
                {tested.length > 0 && (
                  <p>
                    Tested: {[...new Set(tested.map((r) => r.model.displayName))].join(', ')} on {tested[0].hardware.gpuName} via{' '}
                    {[...new Set(tested.map((r) => RUNTIME_LABEL[r.runtime.runtime] ?? r.runtime.runtime))].join(' and ')}. <a className="nd-text-link" href="#measured-runs">See runs above.</a>
                  </p>
                )}
                <details>
                  <summary style={{ cursor: 'pointer' }}>audio.cpp families listing this task upstream ({families.length})</summary>
                  <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead><tr><th style={head}>Family</th><th style={head}>Variants</th><th style={head}>Model license</th><th style={head}>Commercial use</th></tr></thead>
                      <tbody>
                        {families.map((f) => (
                          <tr key={f.family}>
                            <td style={cell}><code>{f.family}</code></td>
                            <td style={cell}>{f.variants.join('; ')}</td>
                            <td style={cell}>{f.licenseInfo.licenseSourceUrl ? <a className="nd-text-link" href={f.licenseInfo.licenseSourceUrl} target="_blank" rel="noopener noreferrer">{f.licenseInfo.license}</a> : f.licenseInfo.license}</td>
                            <td style={cell}>{COMMERCIAL_USE_LABEL[f.licenseInfo.commercialUse]}{f.licenseInfo.notes ? <><br /><span className="nd-subtle">{f.licenseInfo.notes}</span></> : null}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>
            );
          })}
          <p className="nd-subtle">
            Sources: <a className="nd-text-link" href={UPSTREAM_SOURCE.supportedModelsUrl} target="_blank" rel="noopener noreferrer">audio.cpp supported models</a> ·{' '}
            <a className="nd-text-link" href={UPSTREAM_SOURCE.licenseReferenceUrl} target="_blank" rel="noopener noreferrer">audio.cpp model license reference</a>
          </p>
        </section>

        {/* POLICY */}
        <section className="nd-section nd-prose">
          <h2>Artifact and Evidence Policy</h2>
          <p>
            Generated audio is decoded and validated (exists, decodes, sensible duration, not silent, expected sample rate and channels), then identified by its SHA-256. Artifacts are currently retained on the NeuralDrift testbench rather than published, so result pages show the hash and size without a player; a player appears only for a file the site actually serves. Model weights and workload inputs are identified by content hash, never by filename.
          </p>
          <p>
            Read the <Link href="/guides/local-ai-benchmark-methodology">benchmark methodology</Link>, compare individual runs in the <Link href="/lab/compare">comparison engine</Link>, see the <Link href="/hardware/rtx-5080">RTX 5080 hardware profile</Link>, or run ACE-Step 1.5 inside ComfyUI with the <Link href="/guides/ace-step-1-5-comfyui">ACE-Step 1.5 ComfyUI guide</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}

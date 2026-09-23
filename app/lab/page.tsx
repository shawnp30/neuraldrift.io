// app/lab/page.tsx
// NeuralDrift Lab — Real Local-AI Workload Benchmarking & Execution Evidence.

import Link from "next/link";
import { EXECUTIONS, HARDWARE_PROFILES, evidenceFreshness } from "@/lib/hardware/executions";
import { CATALOG } from "@/lib/catalog";
import { pageMeta } from "@/lib/seo";
import { getRelatedGuides, getRelatedTutorials } from "@/lib/relationships";
import { PRODUCTION_PACKS } from "@/lib/monetization";
import { PremiumPackInterest } from "@/components/monetization/PremiumPackInterest";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { TRACKED_MODELS } from "@/lib/emergingModels";
import { getAllBenchmarks } from "@/lib/benchmarks/registry";

export const metadata = pageMeta(
  "/lab",
  "NeuralDrift Lab — Local AI Workload Benchmarking & Evidence",
  "Transparent local AI workload evaluations: raw inference throughput, agentic tool execution, retrieval, ComfyUI graphs, and hardware telemetry on real testbenches."
);

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "Not Measured";
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
}

export default function LabPage() {
  const benchmarks = getAllBenchmarks();
  const current = EXECUTIONS.filter((record) => record.outcome === "SUCCESS" && evidenceFreshness(record) === "CURRENT");
  const failures = EXECUTIONS.filter((record) => record.outcome === "FAILURE" || record.outcome === "INDETERMINATE");
  const latestComfy = [...current].sort((a, b) => b.testDate.localeCompare(a.testDate)).slice(0, 8);
  const workflowTitle = new Map(CATALOG.map((workflow) => [workflow.id, workflow.title]));

  return (
    <div className="nd-site">
      <div className="nd-shell nd-page">
        {/* Header */}
        <header className="nd-section">
          <p className="nd-eyebrow">NEURALDRIFT LAB / EVIDENCE ARCHITECTURE</p>
          <h1>What has actually run?</h1>
          <p className="nd-lead">
            A transparent registry of recorded local executions. NeuralDrift evaluates real local-AI workloads — raw inference throughput, agent tool calling, retrieval, and creator pipelines across runtimes and GPUs. An availability claim or isolated TPS number is never presented as a proven setup.
          </p>
          <div className="nd-actions">
            <Link className="nd-button" href="/lab/compare">
              Compare benchmark runs →
            </Link>
            <Link className="nd-text-link" href="/guides/local-ai-benchmark-methodology">
              Read benchmark methodology →
            </Link>
            <Link className="nd-text-link" href="/compatibility">
              Compatibility policy →
            </Link>
          </div>
        </header>

        {/* Global Evidence Stat Counters */}
        <section className="nd-grid nd-section" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="nd-card nd-card-body">
            <p className="nd-eyebrow">WORKLOAD BENCHMARKS</p>
            <h2>{benchmarks.length}</h2>
            <p>Controlled LLM & agent benchmark records with reproducible fingerprints.</p>
          </div>
          <div className="nd-card nd-card-body">
            <p className="nd-eyebrow">COMFYUI RUNS</p>
            <h2>{current.length}</h2>
            <p>Recorded executions whose workflow hash still matches the downloadable graph.</p>
          </div>
          <div className="nd-card nd-card-body">
            <p className="nd-eyebrow">TESTED HARDWARE</p>
            <h2>{HARDWARE_PROFILES.length}</h2>
            <p>Active physical hardware profiles with observed telemetry.</p>
          </div>
          <div className="nd-card nd-card-body">
            <p className="nd-eyebrow">TRACKED MODELS</p>
            <h2>{TRACKED_MODELS.length}</h2>
            <p>Emerging architectures documented upstream, evidence-gated until tested.</p>
          </div>
          <div className="nd-card nd-card-body">
            <p className="nd-eyebrow">FAILURES / BLOCKERS</p>
            <h2>{failures.length}</h2>
            <p>Failures remain visible rather than being replaced with success-shaped fallbacks.</p>
          </div>
        </section>

        {/* WHAT WE TEST */}
        <section className="nd-section">
          <h2>What We Test</h2>
          <p className="nd-subtle">Real components tested under controlled local operating conditions.</p>
          <div className="nd-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="nd-card nd-card-body">
              <p className="nd-eyebrow">MODELS</p>
              <h3>Local LLMs & DiTs</h3>
              <p>Qwen, Gemma, Llama, Mistral, MiniMax H3, FastH3, and FLUX across quantized (GGUF, EXL2, AWQ, FP8) formats.</p>
            </div>
            <div className="nd-card nd-card-body">
              <p className="nd-eyebrow">HARDWARE</p>
              <h3>GPUs & Memory</h3>
              <p>Desktop GPUs (RTX 5080, RTX 5090, RTX 4090), laptop profiles, Apple Silicon unified memory, and cloud instances.</p>
            </div>
            <div className="nd-card nd-card-body">
              <p className="nd-eyebrow">RUNTIMES</p>
              <h3>Execution Engines</h3>
              <p>LM Studio, Ollama, llama.cpp, vLLM, OpenVINO, ROCm, and native ComfyUI torch environments.</p>
            </div>
            <div className="nd-card nd-card-body">
              <p className="nd-eyebrow">WORKLOADS</p>
              <h3>Useful Work</h3>
              <p>Deterministic calculation, tool selection, multi-step agent actions, RAG retrieval, and creator image/video synthesis.</p>
            </div>
          </div>
        </section>

        {/* HOW WE TEST */}
        <section className="nd-section">
          <h2>How We Test</h2>
          <p className="nd-subtle">
            Methodological inspiration from edge-agent and RAG benchmarking standards. We strictly distinguish raw inference throughput from end-to-end task completion.
          </p>
          <div className="nd-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className="nd-card nd-card-body">
              <p className="nd-eyebrow">PARADIGM 1</p>
              <h3>Raw Inference Benchmark</h3>
              <p>
                Measures model and runtime execution speed in isolation: Time to First Token (TTFT), prompt processing speed (tok/s), generation throughput (tok/s), peak VRAM allocation, and total execution time.
              </p>
              <p className="nd-subtle">Workload example: ND-LLM-001 (Deterministic Structured Generation).</p>
            </div>

            <div className="nd-card nd-card-body">
              <p className="nd-eyebrow">PARADIGM 2</p>
              <h3>End-to-End Workload Benchmark</h3>
              <p>
                Measures whether the AI system actually completes useful work: tool selection, argument validity, tool-call latency, retries, multi-turn reasoning, and objective output validation.
              </p>
              <p className="nd-subtle">Workload examples: ND-AGENT-001 (Tool Use), ND-RAG-001 (Retrieval QA).</p>
            </div>

            <div className="nd-card nd-card-body">
              <p className="nd-eyebrow">PARADIGM 3</p>
              <h3>Creator Pipeline Benchmark</h3>
              <p>
                Measures multi-node ComfyUI graph generation: model weight loading, attention offload, diffusion steps, VRAM limits, and artifact validation.
              </p>
              <p className="nd-subtle">Workload example: Level-5 verified image & video generation workflows.</p>
            </div>
          </div>
        </section>

        {/* RECENT BENCHMARK RESULTS */}
        <section className="nd-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>Recent Local AI Benchmark Runs</h2>
              <p className="nd-subtle" style={{ margin: '0.25rem 0 0 0' }}>
                Controlled executions on NeuralDrift testbenches with measured telemetry and objective validation.
              </p>
            </div>
            <Link href="/lab/compare" className="nd-button">
              Compare runs →
            </Link>
          </div>

          {benchmarks.length > 0 ? (
            <div className="nd-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
              {benchmarks.map((run) => {
                const isRaw = run.paradigm === 'raw_inference';
                return (
                  <article className="nd-card nd-card-body" key={run.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <p className="nd-eyebrow" style={{ margin: 0 }}>{run.workloadId} · {run.paradigm.toUpperCase().replace(/_/g, ' ')}</p>
                      <span className={`nd-badge ${run.outcome === 'PASS' ? 'nd-badge-tested' : 'nd-badge-amber'}`}>
                        {run.outcome}
                      </span>
                    </div>

                    <h3 style={{ margin: '0.25rem 0 0.5rem 0' }}>
                      <Link href={`/lab/benchmarks/${run.id}`}>{run.model.displayName}</Link>
                    </h3>

                    <p style={{ margin: 0 }}>
                      {run.hardware.gpuName} · {run.runtime.runtime} ({run.runtime.runtimeVersion})
                    </p>

                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', fontSize: '0.85rem' }}>
                      {isRaw && run.rawInferenceMetrics ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <div><strong>TTFT:</strong> {run.rawInferenceMetrics.ttftMs != null ? `${run.rawInferenceMetrics.ttftMs.toFixed(1)} ms` : 'N/A'}</div>
                          <div><strong>Speed:</strong> {run.rawInferenceMetrics.generationTokensPerSec != null ? `${run.rawInferenceMetrics.generationTokensPerSec.toFixed(1)} tok/s` : 'N/A'}</div>
                          <div><strong>Prompt:</strong> {run.rawInferenceMetrics.promptTokensPerSec != null ? `${run.rawInferenceMetrics.promptTokensPerSec.toFixed(0)} tok/s` : 'N/A'}</div>
                          <div><strong>Peak VRAM:</strong> {formatBytes(run.rawInferenceMetrics.peakVramBytes)}</div>
                        </div>
                      ) : run.workloadMetrics ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <div><strong>Task Time:</strong> {(run.workloadMetrics.taskCompletionTimeMs / 1000).toFixed(2)} s</div>
                          <div><strong>Tool Calls:</strong> {run.workloadMetrics.successfulToolCalls}/{run.workloadMetrics.toolCallsCount}</div>
                          <div><strong>Tool Latency:</strong> {run.workloadMetrics.toolCallLatencyMs != null ? `${run.workloadMetrics.toolCallLatencyMs.toFixed(2)} ms` : 'N/A'}</div>
                          <div><strong>Peak VRAM:</strong> {formatBytes(run.workloadMetrics.peakVramBytes)}</div>
                        </div>
                      ) : null}
                    </div>

                    <p className="nd-subtle" style={{ marginTop: '0.75rem', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                      Fingerprint: <code>{run.configFingerprint.slice(0, 16)}...</code>
                    </p>

                    <div className="nd-actions" style={{ marginTop: '0.75rem' }}>
                      <Link className="nd-text-link" href={`/lab/benchmarks/${run.id}`}>
                        View full telemetry & validation →
                      </Link>
                      <Link className="nd-text-link" href={`/lab/compare?a=${run.id}`}>
                        Compare →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="nd-subtle">No NeuralDrift benchmark evidence yet.</p>
          )}
        </section>

        {/* LATEST COMFYUI TESTS (PRESERVED) */}
        <section className="nd-section">
          <h2>Latest ComfyUI Graph Executions</h2>
          <p className="nd-subtle">Physical runs executing verified workflow JSON graphs.</p>
          {latestComfy.length ? (
            <div className="nd-grid">
              {latestComfy.map((record) => {
                const hardware = HARDWARE_PROFILES.find((profile) => profile.id === record.hardwareProfileId);
                const source = { title: workflowTitle.get(record.workflowId) || record.workflowId, tags: [], description: "" };
                const guides = getRelatedGuides(source, 1);
                const tutorials = getRelatedTutorials(source, 1);
                return (
                  <article className="nd-card nd-card-body" key={record.id}>
                    <p className="nd-eyebrow">{record.testDate}</p>
                    <h3><Link href={`/workflows/${record.workflowId}`}>{workflowTitle.get(record.workflowId) || record.workflowId}</Link></h3>
                    <p>{hardware?.name || "Hardware profile not attributed"}{record.runtimeSeconds == null ? "" : ` · ${record.runtimeSeconds.toFixed(2)}s`}</p>
                    <p className="nd-subtle">Evidence status: CURRENT · {record.executionProfile}</p>
                    <div className="nd-actions">
                      <Link className="nd-text-link" href="/compatibility">Compatibility →</Link>
                      {guides[0] && <Link className="nd-text-link" href={`/guides/${guides[0].slug}`}>Guide →</Link>}
                      {tutorials[0] && <Link className="nd-text-link" href={`/tutorials/${tutorials[0].slug}`}>Tutorial →</Link>}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="nd-subtle">No current successful execution records are available.</p>
          )}
        </section>

        {/* BEING INVESTIGATED / TRACKED EMERGING MODELS (FASTH3) */}
        {TRACKED_MODELS.length > 0 && (
          <section className="nd-section">
            <h2>Being Investigated / Documented</h2>
            <p className="nd-subtle">
              Newly released models NeuralDrift has researched and documented from primary sources, but has not yet run under controlled benchmark conditions. These are documented, not execution-tested.
            </p>
            <div className="nd-grid">
              {TRACKED_MODELS.map((model) => (
                <article className="nd-card nd-card-body" key={model.slug}>
                  <p className="nd-eyebrow">{model.status.toUpperCase().replace(/_/g, " ")}</p>
                  <h3><Link href={`/lab/${model.slug}`}>{model.shortName}</Link></h3>
                  <p>{model.summary}</p>
                  <p className="nd-subtle">Status: {model.statusReason}</p>
                  <Link className="nd-text-link" href={`/lab/${model.slug}`}>Read the writeup →</Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* EVIDENCE METHODOLOGY */}
        <section className="nd-section nd-prose">
          <h2>Evidence Methodology & Hierarchy</h2>
          <p>
            NeuralDrift maintains a transparent evidence chain: Upstream Claim → Community Result → Documented → Execution Tested → Benchmarked → Level-5 Verified. A test date, telemetry number, or compatibility assertion is only shown when supported by reproducible physical evidence.
          </p>
        </section>

        <NewsletterSignup source="lab" />

        {/* FUTURE MONETIZATION PACKS (PRESERVED) */}
        {PRODUCTION_PACKS.map((pack) => (
          <section className="nd-card nd-card-body" key={pack.id}>
            <p className="nd-eyebrow">FUTURE PRODUCT / INTEREST ONLY</p>
            <h2>{pack.name}</h2>
            <p>Potential production documentation built from existing workflow assets. No checkout, price, or delivery is active.</p>
            <p className="nd-subtle">Current workflow assets: {pack.workflowIds.join(", ")}. Missing: {pack.missingAssets.join(", ")}.</p>
            <PremiumPackInterest packName={pack.name} />
          </section>
        ))}
      </div>
    </div>
  );
}

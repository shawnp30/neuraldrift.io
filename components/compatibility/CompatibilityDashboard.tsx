'use client';

// components/compatibility/CompatibilityDashboard.tsx
// Interactive GPU compatibility intelligence dashboard.

import { useState, useMemo } from 'react';
import { EXECUTIONS, HARDWARE_PROFILES, evidenceFreshness } from '@/lib/hardware/executions';
import Link from 'next/link';
import { CATALOG, workflowKind, workflowKindLabel, WORKFLOW_TESTS } from '@/lib/catalog';
import { COMMON_GPUS, findGpuBySlug } from '@/lib/hardware/gpuData';
import { evaluateCompatibility, resolveHardwareTarget, CompatibilityResult } from '@/lib/hardware/compatibility';
import WorkflowCard from '@/components/workflows/WorkflowCard';

interface Props {
  initialGpuSlug?: string;
  initialVram?: string;
}

export function CompatibilityDashboard({ initialGpuSlug = 'rtx-5080', initialVram = '' }: Props) {
  const [selectedGpuSlug, setSelectedGpuSlug] = useState<string>(initialGpuSlug);
  const [selectedVram, setSelectedVram] = useState<string>(initialVram);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const target = useMemo(() => {
    if (selectedVram) {
      return resolveHardwareTarget(null, parseInt(selectedVram, 10));
    }
    return resolveHardwareTarget(selectedGpuSlug, null);
  }, [selectedGpuSlug, selectedVram]);

  // Evaluate compatibility for all 50 catalog workflows against the chosen target
  const evaluations = useMemo(() => {
    if (!target) return [];
    return CATALOG.map(w => ({
      workflow: w,
      result: evaluateCompatibility(w, target),
      kind: workflowKind(w)
    }));
  }, [target]);

  // Aggregated Counts for chosen hardware
  const counts = useMemo(() => {
    let directTested = 0;
    let likelyCompatible = 0;
    let estimated = 0;
    let blocked = 0;
    let unknown = 0;

    for (const item of evaluations) {
      if (item.result.state === 'DIRECT_TESTED') directTested++;
      else if (item.result.state === 'CLOSE_TESTED') likelyCompatible++;
      else if (item.result.state === 'ESTIMATED') estimated++;
      else if ((item.result.state === 'BLOCKED' || item.result.state === 'TESTED_FAILURE')) blocked++;
      else unknown++;
    }

    return { directTested, likelyCompatible, estimated, blocked, unknown };
  }, [evaluations]);

  // Overall Catalog Execution Counts (Authoritative)
  const executionStats = useMemo(() => {
    const current = EXECUTIONS.filter(r => evidenceFreshness(r) === 'CURRENT');
    const tested = new Set(current.filter(r => r.outcome === 'SUCCESS').map(r => r.workflowId)).size;
    return { tested, successful: current.filter(r => r.outcome === 'SUCCESS').length, unexecuted: CATALOG.length - tested,
      failures: current.filter(r => r.outcome === 'FAILURE').length,
      stale: EXECUTIONS.filter(r => evidenceFreshness(r) === 'STALE').length,
      standard: current.filter(r => r.outcome === 'SUCCESS' && r.executionProfile === 'STANDARD').length,
      optimized: current.filter(r => r.outcome === 'SUCCESS' && r.executionProfile === 'OPTIMIZED').length,
      unclassified: current.filter(r => r.outcome === 'SUCCESS' && r.executionProfile === 'UNCLASSIFIED').length };
  }, []);

  // Filtered workflows by active tab
  const filteredWorkflows = useMemo(() => {
    if (activeCategory === 'all') return evaluations;
    if (activeCategory === 'recommended') {
      return evaluations.filter(e => e.result.state === 'DIRECT_TESTED' || e.result.state === 'CLOSE_TESTED');
    }
    if (activeCategory === 'video') return evaluations.filter(e => e.kind === 'video');
    if (activeCategory === 'audio') return evaluations.filter(e => e.kind === 'audio');
    if (activeCategory === 'image') return evaluations.filter(e => e.kind === 'pipeline' || e.kind === 'preset' || e.kind === 'control' || e.kind === 'enhancement');
    if (activeCategory === 'blocked') return evaluations.filter(e => e.result.state === 'TESTED_FAILURE' || e.result.state === 'BLOCKED' || e.result.state === 'UNKNOWN');
    return evaluations;
  }, [evaluations, activeCategory]);

  return (
    <div>
      {/* Authoritative Global Trust Metric Banner (Phase 6B Wording Fix) */}
      <section className="nd-card nd-card-body" style={{ background: 'linear-gradient(180deg, rgba(14, 23, 38, 0.95) 0%, rgba(10, 16, 28, 0.95) 100%)', border: '1px solid #23344a', marginBottom: '2rem' }}>
        <div style={{ borderBottom: '1px solid #1e2c3e', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
          <p className="nd-eyebrow" style={{ margin: '0 0 0.4rem', color: '#5eead4' }}>
            LOCAL EXECUTION EVIDENCE
          </p>
          <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.35rem', color: '#f8fafc' }}>
            {executionStats.tested} workflows execution-tested on physical RTX 5080 hardware.
          </h2>
          <p className="nd-subtle" style={{ margin: 0, fontSize: '0.85rem' }}>
            We evaluate real generation runs rather than theoretical online minimums. Check the breakdown below or pick your GPU to inspect compatibility.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-ibm-plex-mono), monospace' }}>
              {executionStats.tested}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              execution-tested
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-ibm-plex-mono), monospace' }}>
              {executionStats.successful}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              current successful execution records
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-ibm-plex-mono), monospace' }}>
              {executionStats.unexecuted}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              not yet execution-tested
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-ibm-plex-mono), monospace' }}>
              {executionStats.failures}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              recorded failures
            </span>
          </div>
        </div>
        <p style={{ margin: '1rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
          {HARDWARE_PROFILES.length} observed hardware profile(s). STANDARD successes: {executionStats.standard}; OPTIMIZED successes: {executionStats.optimized}; unclassified historical successes: {executionStats.unclassified}; stale records: {executionStats.stale}. GPUs in the selector are reference specifications, not discovered machines.
        </p>
      </section>

      {/* Interactive Hardware Selector (Phase 6F) */}
      <section className="nd-card nd-card-body" style={{ marginBottom: '2.5rem', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.3rem', fontSize: '1.25rem' }}>Select Target Hardware</h2>
            <p className="nd-subtle" style={{ margin: 0 }}>
              Query compatibility against real execution records and conservative VRAM inference rules.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div>
              <label htmlFor="dash-gpu" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                GPU Model
              </label>
              <select
                id="dash-gpu"
                value={selectedVram ? '' : selectedGpuSlug}
                onChange={(e) => {
                  setSelectedGpuSlug(e.target.value);
                  setSelectedVram('');
                }}
                style={{
                  background: '#0d1522',
                  border: '1px solid #475569',
                  color: '#f8fafc',
                  borderRadius: '6px',
                  padding: '0.5rem 0.8rem',
                  fontSize: '0.85rem'
                }}
              >
                {COMMON_GPUS.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.shortName} ({g.vramGb}GB)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dash-vram" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
                Or VRAM Tier
              </label>
              <select
                id="dash-vram"
                value={selectedVram}
                onChange={(e) => {
                  setSelectedVram(e.target.value);
                }}
                style={{
                  background: '#0d1522',
                  border: '1px solid #475569',
                  color: '#f8fafc',
                  borderRadius: '6px',
                  padding: '0.5rem 0.8rem',
                  fontSize: '0.85rem'
                }}
              >
                <option value="">By GPU Model</option>
                {[6, 8, 10, 11, 12, 16, 24, 32, 48].map(v => (
                  <option key={v} value={v}>
                    {v} GB VRAM
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Selected Hardware Summary Breakdown */}
        {target && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid #28374d' }}>
            <p style={{ margin: '0 0 0.8rem', fontSize: '0.9rem', color: '#f1f5f9' }}>
              Compatibility verdict for <strong>{target.gpu ? target.gpu.name : `${target.vramGb}GB Dedicated VRAM`}</strong>:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: '#0d1522', padding: '0.8rem', borderRadius: '6px', borderLeft: '3px solid #34d399' }}>
                <span style={{ display: 'block', fontSize: '1.3rem', fontWeight: 700, color: '#34d399' }}>
                  {counts.directTested}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Directly Tested</span>
              </div>
              <div style={{ background: '#0d1522', padding: '0.8rem', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
                <span style={{ display: 'block', fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8' }}>
                  {counts.likelyCompatible}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Likely Compatible</span>
              </div>
              <div style={{ background: '#0d1522', padding: '0.8rem', borderRadius: '6px', borderLeft: '3px solid #fbbf24' }}>
                <span style={{ display: 'block', fontSize: '1.3rem', fontWeight: 700, color: '#fbbf24' }}>
                  {counts.estimated}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimated from Specs</span>
              </div>
              <div style={{ background: '#0d1522', padding: '0.8rem', borderRadius: '6px', borderLeft: '3px solid #f43f5e' }}>
                <span style={{ display: 'block', fontSize: '1.3rem', fontWeight: 700, color: '#f43f5e' }}>
                  {counts.blocked + counts.unknown}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Failures / Blocked / Unknown</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Category Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { id: 'all', label: `All Workflows (${evaluations.length})` },
          { id: 'recommended', label: `Recommended (${counts.directTested + counts.likelyCompatible})` },
          { id: 'image', label: 'Image & Control' },
          { id: 'video', label: 'Video' },
          { id: 'audio', label: 'Audio' },
          { id: 'blocked', label: `Failures / Blocked (${counts.blocked + counts.unknown})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            style={{
              background: activeCategory === tab.id ? '#2563eb' : '#0d1522',
              color: activeCategory === tab.id ? '#ffffff' : '#94a3b8',
              border: `1px solid ${activeCategory === tab.id ? '#3b82f6' : '#28374d'}`,
              borderRadius: '20px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workflows Grid with Target Evaluation */}
      <section className="nd-section" style={{ marginTop: '1rem' }}>
        <div className="nd-grid">
          {filteredWorkflows.map(({ workflow }) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              targetHardware={target || undefined}
            />
          ))}
        </div>
      </section>

      {/* Testing Methodology Section (Phase 6Q) */}
      <section className="nd-section nd-prose" style={{ marginTop: '4rem', borderTop: '1px solid #334155', paddingTop: '2.5rem' }}>
        <p className="nd-eyebrow">VERIFICATION STANDARDS</p>
        <h2>NeuralDrift 5-Level Validation Framework</h2>
        <p>
          Unlike generic catalog indexes that scrape online workflows without running them, NeuralDrift applies a rigorous 5-level verification hierarchy before declaring any workflow execution-tested.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginTop: '1.5rem' }}>
          <div style={{ background: '#0d1522', border: '1px solid #28374d', borderRadius: '6px', padding: '1.2rem' }}>
            <span style={{ color: '#38bdf8', fontFamily: 'var(--font-ibm-plex-mono), monospace', fontWeight: 700 }}>LEVEL 1 — File parses correctly</span>
            <h3 style={{ margin: '0.3rem 0', fontSize: '1rem' }}>JSON Schema Valid</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              The downloadable JSON is syntactically valid, has clean node mappings, and contains no malformed syntax errors.
            </p>
          </div>

          <div style={{ background: '#0d1522', border: '1px solid #28374d', borderRadius: '6px', padding: '1.2rem' }}>
            <span style={{ color: '#38bdf8', fontFamily: 'var(--font-ibm-plex-mono), monospace', fontWeight: 700 }}>LEVEL 2 — Workflow graph is valid</span>
            <h3 style={{ margin: '0.3rem 0', fontSize: '1rem' }}>Graph Connectivity Valid</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              Internal node links, inputs, and outputs form a valid acyclic execution graph with correct node type bindings.
            </p>
          </div>

          <div style={{ background: '#0d1522', border: '1px solid #28374d', borderRadius: '6px', padding: '1.2rem' }}>
            <span style={{ color: '#38bdf8', fontFamily: 'var(--font-ibm-plex-mono), monospace', fontWeight: 700 }}>LEVEL 3 — Dependencies identified</span>
            <h3 style={{ margin: '0.3rem 0', fontSize: '1rem' }}>Dependencies Identified</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              All checkpoints, diffusion models, VAEs, text encoders, and custom nodes are inventoried with exact filenames and directories.
            </p>
          </div>

          <div style={{ background: '#0d1522', border: '1px solid #28374d', borderRadius: '6px', padding: '1.2rem' }}>
            <span style={{ color: '#34d399', fontFamily: 'var(--font-ibm-plex-mono), monospace', fontWeight: 700 }}>LEVEL 4 — Loaded successfully in ComfyUI</span>
            <h3 style={{ margin: '0.3rem 0', fontSize: '1rem' }}>ComfyUI Graph Import</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              The graph loads directly into an active ComfyUI instance without red missing-node boxes or syntax incompatibilities.
            </p>
          </div>

          <div style={{ background: '#0d1522', border: '1px solid #10b981', borderRadius: '6px', padding: '1.2rem' }}>
            <span style={{ color: '#34d399', fontFamily: 'var(--font-ibm-plex-mono), monospace', fontWeight: 700 }}>LEVEL 5 — Executed successfully with expected output</span>
            <h3 style={{ margin: '0.3rem 0', fontSize: '1rem' }}>Execution &amp; Semantic Output</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              The workflow completes a real run on local hardware, producing an inspectable output artifact (image, video, audio) with verified prompt correspondence.
            </p>
          </div>
        </div>

        <h3 style={{ marginTop: '2.5rem' }}>Hardware Reality & Limitations</h3>
        <ul>
          <li>
            <strong>Hardware Specificity:</strong> Execution records are matched to observed hardware profiles and workflow hashes. Historical RTX 5080 runs retain their original software and settings; they do not establish secondary GPU performance.
          </li>
          <li>
            <strong>No Downward VRAM Inferences:</strong> Success on 16GB does <em>not</em> prove that an 8GB or 12GB GPU can execute the workflow without memory exhaustion.
          </li>
          <li>
            <strong>Non-Linear Runtime:</strong> Measured execution seconds represent the specific test resolution, batch size, and step count documented in each test record. Higher resolutions or different samplers will scale non-linearly.
          </li>
          <li>
            <strong>Architecture Caveats:</strong> AMD (ROCm), Apple Silicon (MPS), and older Pascal/Turing GPUs have distinct kernel compiler and precision constraints not captured by VRAM numbers alone.
          </li>
        </ul>

        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/hardware/rtx-5080" className="nd-button">
            View Complete RTX 5080 Testbench Records →
          </Link>
        </div>
      </section>
    </div>
  );
}

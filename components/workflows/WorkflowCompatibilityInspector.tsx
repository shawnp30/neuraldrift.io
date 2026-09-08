'use client';

// components/workflows/WorkflowCompatibilityInspector.tsx
// Interactive GPU compatibility inspector for workflow detail pages.

import { useState } from 'react';
import { ExecutionHistory } from './ExecutionHistory';
import Link from 'next/link';
import { WorkflowEntry } from '@/lib/workflowsData';
import { COMMON_GPUS } from '@/lib/hardware/gpuData';
import { evaluateCompatibility, resolveHardwareTarget, CompatibilityResult } from '@/lib/hardware/compatibility';

interface Props {
  workflow: WorkflowEntry;
  defaultGpuSlug?: string;
}

export function WorkflowCompatibilityInspector({ workflow, defaultGpuSlug = 'rtx-5080' }: Props) {
  const [selectedGpuSlug, setSelectedGpuSlug] = useState<string>(defaultGpuSlug);
  const [customVram, setCustomVram] = useState<string>('');

  const target = customVram
    ? resolveHardwareTarget(null, parseInt(customVram, 10))
    : resolveHardwareTarget(selectedGpuSlug, null);

  const compat: CompatibilityResult | null = target ? evaluateCompatibility(workflow, target) : null;

  return (
    <section id="gpu-compatibility" className="nd-card nd-card-body" style={{ marginTop: '2rem', border: '1px solid #3b4d66' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #28374d', paddingBottom: '1rem' }}>
        <div>
          <p className="nd-eyebrow" style={{ margin: 0, color: '#38bdf8' }}>HARDWARE INTELLIGENCE LAYER</p>
          <h2 style={{ margin: '0.4rem 0 0.2rem', fontSize: '1.4rem' }}>Will this run on my GPU?</h2>
          <p className="nd-subtle" style={{ margin: 0 }}>
            Evaluate evidence-backed execution feasibility for your specific hardware.
          </p>
        </div>

        {/* Hardware Selector Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="inspector-gpu" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
              Choose GPU
            </label>
            <select
              id="inspector-gpu"
              value={customVram ? '' : selectedGpuSlug}
              onChange={(e) => {
                setSelectedGpuSlug(e.target.value);
                setCustomVram('');
              }}
              style={{
                background: '#0d1522',
                border: '1px solid #334155',
                color: '#f8fafc',
                borderRadius: '6px',
                padding: '0.45rem 0.75rem',
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
            <label htmlFor="inspector-vram" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>
              Or VRAM Tier
            </label>
            <select
              id="inspector-vram"
              value={customVram}
              onChange={(e) => {
                setCustomVram(e.target.value);
              }}
              style={{
                background: '#0d1522',
                border: '1px solid #334155',
                color: '#f8fafc',
                borderRadius: '6px',
                padding: '0.45rem 0.75rem',
                fontSize: '0.85rem'
              }}
            >
              <option value="">Specific GPU</option>
              {[6, 8, 10, 11, 12, 16, 24, 32, 48].map(v => (
                <option key={v} value={v}>
                  {v} GB VRAM
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {compat && (
        <div style={{ marginTop: '1.2rem' }}>
          {/* Status Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.8rem' }}>
            <span className={`nd-badge nd-badge-${compat.badgeTone}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}>
              {compat.badgeLabel}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Confidence: <strong>{compat.confidence}</strong>
            </span>
          </div>

          <h3 style={{ margin: '0 0 0.5rem', color: '#f1f5f9', fontSize: '1.15rem' }}>
            {compat.headline}
          </h3>
          <p style={{ margin: '0 0 1rem', color: '#cbd5e1', lineHeight: 1.6 }}>
            {compat.reason}
          </p>

          {/* Evidence Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {/* Closest Tested Evidence Card */}
            <div style={{ background: '#0d1522', border: '1px solid #263345', borderRadius: '6px', padding: '1rem' }}>
              <p className="nd-eyebrow" style={{ margin: '0 0 0.4rem', color: '#a5b4fc' }}>CLOSEST EVIDENCE</p>
              {compat.closestEvidence ? (
                <>
                  <p style={{ margin: 0, fontWeight: 600, color: '#f8fafc' }}>
                    {compat.closestEvidence.gpu} ({compat.closestEvidence.vramGb}GB VRAM)
                  </p>
                  <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {compat.closestEvidence.limitationNote}
                  </p>
                  {compat.closestEvidence.runtimeSeconds && (
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#34d399', fontFamily: 'var(--font-ibm-plex-mono), monospace' }}>
                      Measured: {compat.closestEvidence.runtimeSeconds.toFixed(2)}s runtime
                    </p>
                  )}
                </>
              ) : (
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                  No execution record recorded locally for this workflow yet.
                </p>
              )}
            </div>

            {/* Test Run Parameters */}
            <div style={{ background: '#0d1522', border: '1px solid #263345', borderRadius: '6px', padding: '1rem' }}>
              <p className="nd-eyebrow" style={{ margin: '0 0 0.4rem', color: '#a5b4fc' }}>MEASURED RUNTIME SPECS</p>
              {compat.runtimeEvidence ? (
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                  <dt style={{ color: '#64748b' }}>Resolution:</dt>
                  <dd style={{ margin: 0, color: '#f1f5f9' }}>{compat.runtimeEvidence.resolution || 'Catalog default'}</dd>
                  <dt style={{ color: '#64748b' }}>Steps / Sampler:</dt>
                  <dd style={{ margin: 0, color: '#f1f5f9' }}>{compat.runtimeEvidence.steps ?? 'N/A'} {compat.runtimeEvidence.sampler ? `(${compat.runtimeEvidence.sampler})` : ''}</dd>
                  <dt style={{ color: '#64748b' }}>Runtime:</dt>
                  <dd style={{ margin: 0, color: '#34d399', fontWeight: 600 }}>{compat.runtimeEvidence.runtimeSeconds?.toFixed(2)}s</dd>
                  <dt style={{ color: '#64748b' }}>Test Date:</dt>
                  <dd style={{ margin: 0, color: '#94a3b8' }}>{compat.runtimeEvidence.testDate?.slice(0, 10)}</dd>
                </dl>
              ) : (
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                  Run metrics not available. Displaying catalog estimates only.
                </p>
              )}
            </div>
          </div>

          {/* Architecture / Platform Warnings */}
          {compat.warnings.length > 0 && (
            <div style={{ marginTop: '1rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px', padding: '0.8rem 1rem' }}>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24' }}>
                Hardware & Runtime Considerations:
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#fde68a' }}>
                {compat.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Alternatives if Insufficient VRAM */}
          {compat.recommendedAlternatives.length > 0 && (
            <div style={{ marginTop: '1.2rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #1e293b', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
                Lower-Memory Alternatives (Fit within {compat.selectedVramGb}GB VRAM):
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {compat.recommendedAlternatives.map(alt => (
                  <Link
                    key={alt.id}
                    href={`/workflows/${alt.id}`}
                    style={{
                      display: 'block',
                      background: '#0d1522',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '0.5rem 0.8rem',
                      textDecoration: 'none'
                    }}
                  >
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 500 }}>
                      {alt.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {alt.vram} · {alt.tested ? 'Tested' : 'Estimated'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <ExecutionHistory workflowId={workflow.id} />
    </section>
  );
}

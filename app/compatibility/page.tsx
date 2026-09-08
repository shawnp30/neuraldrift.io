import { pageMeta } from '@/lib/seo';
import { CompatibilityDashboard } from '@/components/compatibility/CompatibilityDashboard';

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export function generateMetadata({ searchParams }: Props) {
  return {
    ...pageMeta(
      '/compatibility',
      'ComfyUI GPU Compatibility — Tested Workflows by VRAM | NeuralDrift',
      'Evidence-backed ComfyUI workflow compatibility matrix. Query by GPU model or VRAM to view directly tested runs, measured speeds, and conservative hardware feasibility.'
    ),
    robots: {
      index: Object.keys(searchParams).length === 0,
      follow: true
    }
  };
}

export default function CompatibilityPage({ searchParams }: Props) {
  const gpuParam = typeof searchParams.gpu === 'string' ? searchParams.gpu : 'rtx-5080';
  const vramParam = typeof searchParams.vram === 'string' ? searchParams.vram : '';

  return (
    <div className="nd-site">
      <div className="nd-shell nd-page">
        <header className="nd-section" style={{ paddingBottom: '1rem' }}>
          <p className="nd-eyebrow">HARDWARE & EVIDENCE</p>
          <h1>Understand compatibility before you download.</h1>
          <p className="nd-lead">
            NeuralDrift replaces speculative online requirements with factual execution evidence. Query your exact GPU or VRAM capacity below to inspect verified runs.
          </p>
        </header>

        <CompatibilityDashboard
          initialGpuSlug={gpuParam}
          initialVram={vramParam}
        />
      </div>
    </div>
  );
}


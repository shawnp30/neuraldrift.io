import Link from 'next/link';
import Image from 'next/image';
import { WorkflowEntry } from '@/lib/workflowsData';
import { compatibilityLabel, compatibilityStatus, workflowKind, workflowKindLabel, WORKFLOW_TESTS } from '@/lib/catalog';
import { evaluateCompatibility, HardwareTarget } from '@/lib/hardware/compatibility';

export default function WorkflowCard({ workflow, targetHardware }: { workflow: WorkflowEntry; targetHardware?: HardwareTarget }) {
  const test = WORKFLOW_TESTS[workflow.id];
  const defaultStatus = compatibilityStatus(workflow);
  const kind = workflowKind(workflow);

  const compat = targetHardware ? evaluateCompatibility(workflow, targetHardware) : null;

  return <article className="nd-card nd-workflow">
    <Link href={`/workflows/${workflow.id}`} className="nd-preview" tabIndex={-1} aria-hidden="true">
      <Image src={workflow.imageUrl} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" className="object-cover" />
      <span className="nd-image-label">
        {test?.outputKind === 'image'
          ? 'Actual output · tested on RTX 5080'
          : test?.outputKind === 'audio'
          ? 'Actual audio · tested on RTX 5080'
          : test?.outputKind === 'video'
          ? 'Actual video · tested on RTX 5080'
          : 'Catalog illustration · output not verified'}
      </span>
    </Link>
    <div className="nd-card-body">
      <div className="nd-meta">
        <span className="nd-kind">{workflowKindLabel(kind)}</span>
        {compat ? (
          <span className={`nd-badge nd-badge-${compat.badgeTone}`} title={compat.reason}>
            {compat.badgeLabel}
          </span>
        ) : (
          <span className={`nd-badge nd-badge-${defaultStatus.toLowerCase()}`}>{defaultStatus}</span>
        )}
        <span>{workflow.difficulty}</span>
      </div>
      <h3><Link href={`/workflows/${workflow.id}`}>{workflow.title}</Link></h3>
      <p>{workflow.description}</p>
      
      {compat ? (
        <div style={{ marginTop: 'auto', paddingTop: '.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <p style={{ margin: 0, fontSize: '.78rem', fontWeight: 600, color: compat.badgeTone === 'emerald' ? '#34d399' : compat.badgeTone === 'amber' ? '#fbbf24' : compat.badgeTone === 'rose' ? '#fb7185' : '#93c5fd' }}>
            {compat.headline}
          </p>
          <p className="nd-confidence-tag" style={{ margin: '0.25rem 0 0.45rem' }}>
            Confidence: {compat.confidence} · {targetHardware?.gpu ? targetHardware.gpu.shortName : `${targetHardware?.vramGb}GB VRAM`}
          </p>
        </div>
      ) : (
        <p className="nd-memory">{compatibilityLabel(workflow)}</p>
      )}

      <p className="nd-model" title={workflow.model}>{workflow.model}</p>
      <Link href={`/workflows/${workflow.id}`} className="nd-text-link">Setup & download <span aria-hidden="true">↗</span></Link>
    </div>
  </article>;
}


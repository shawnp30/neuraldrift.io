// components/lab/EvidenceClassBadge.tsx
// One visual treatment per evidence class, so "we tested this" never looks like "the developer says so".

import { EVIDENCE_CLASS_LABEL, type EvidenceClass } from '@/lib/intelligence';

const TONE: Record<EvidenceClass, string> = {
  NEURALDRIFT_VERIFIED: 'nd-badge-tested',
  NEURALDRIFT_MEASURED: 'nd-badge-tested',
  NEURALDRIFT_DERIVED: 'nd-badge-tested',
  UPSTREAM_VERIFIED: 'nd-badge-blue',
  COMMUNITY_REPORTED: 'nd-badge-amber',
  HARDWARE_INFERENCE: 'nd-badge-amber',
  UNVERIFIED: '',
  UNKNOWN: '',
};

export function EvidenceClassBadge({ level }: { level: EvidenceClass }) {
  return (
    <span className={`nd-badge ${TONE[level]}`} title={level} data-evidence-class={level}>
      {EVIDENCE_CLASS_LABEL[level].toUpperCase()}
    </span>
  );
}

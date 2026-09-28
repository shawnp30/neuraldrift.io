// lib/intelligence.ts
// News → action pipeline. Each development records what changed, why it matters to local AI, what
// NeuralDrift decided to do, and every claim with its source and evidence class. This is research
// data, not a news feed: a development only produces pages or benchmarks when the action says so.

import developments from '@/data/intelligence/developments.json';

export type EvidenceClass =
  | 'NEURALDRIFT_VERIFIED'   // Executed and verified by NeuralDrift
  | 'NEURALDRIFT_MEASURED'   // Direct measurement from controlled execution
  | 'NEURALDRIFT_DERIVED'    // Calculated from NeuralDrift measurements
  | 'UPSTREAM_VERIFIED'      // Stated by an authoritative upstream source, not reproduced locally
  | 'COMMUNITY_REPORTED'     // Credible community evidence, not reproduced
  | 'HARDWARE_INFERENCE'     // Reasoned inference, labelled as such
  | 'UNVERIFIED'
  | 'UNKNOWN';

export type IntelligenceAction =
  | 'NO_ACTION'
  | 'TRACK'
  | 'UPDATE_DATA'
  | 'UPDATE_COMPATIBILITY'
  | 'UPDATE_EXISTING_PAGE'
  | 'CREATE_RESEARCH_PAGE'
  | 'CREATE_BENCHMARK'
  | 'RUN_COMPATIBILITY_TEST'
  | 'RUN_PERFORMANCE_TEST'
  | 'UPDATE_WORKFLOW'
  | 'PROMOTE_TO_EVERYDAY_TOOL';

export type SourceType = 'official_repo' | 'official_release' | 'official_docs' | 'official_model_card' | 'official_pr' | 'paper' | 'community' | 'neuraldrift_evidence';

export interface ClaimSource {
  title: string;
  url: string;
  type: SourceType;
  retrievedAt: string;
}

export interface Claim {
  claim: string;
  evidenceClass: EvidenceClass;
  source: ClaimSource;
  version?: string;
  benchmarkRecordId?: string;
}

export interface Development {
  id: string;
  title: string;
  area: 'audio' | 'video' | 'image' | '3d' | 'llm' | 'runtime' | 'hardware';
  upstreamDate: string;
  reviewedAt: string;
  whatChanged: string;
  whyItMatters: string;
  alreadyTracked: string | null;       // Existing NeuralDrift page/data, if any
  canTest: 'yes' | 'no' | 'conditional';
  hardwareFit: string;                 // RTX 5080 / 16 GB assessment, with its basis stated in the claims
  safeInstallPath: string | null;
  actions: IntelligenceAction[];
  decision: string;
  status: 'open' | 'in_progress' | 'done' | 'blocked';
  claims: Claim[];
}

export const DEVELOPMENTS = developments as Development[];

export const EVIDENCE_CLASS_LABEL: Record<EvidenceClass, string> = {
  NEURALDRIFT_VERIFIED: 'We tested this',
  NEURALDRIFT_MEASURED: 'We measured this',
  NEURALDRIFT_DERIVED: 'Calculated from our measurements',
  UPSTREAM_VERIFIED: 'The developer reports this',
  COMMUNITY_REPORTED: 'The community reports this',
  HARDWARE_INFERENCE: 'We infer this',
  UNVERIFIED: 'Unverified',
  UNKNOWN: 'Unknown',
};

export function getDevelopments(): Development[] {
  return [...DEVELOPMENTS].sort((a, b) => b.upstreamDate.localeCompare(a.upstreamDate));
}

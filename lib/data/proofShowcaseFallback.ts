/**
 * Demo tiles for /proofs when Blob storage returns no uploads.
 * Images match NeuralDrift catalog thumbnails; JSON downloads use the
 * slug filenames under public/workflows/ (see list route WORKFLOW_TITLES).
 */
export interface ProofShowcaseItem {
  url: string;
  workflowId: string;
  workflowTitle: string;
  caption: string;
  type: string;
  uploadedAt: string;
  pathname: string;
  isDemo?: boolean;
}

export const PROOF_SHOWCASE_FALLBACK: ProofShowcaseItem[] = [
  {
    url: "/workflow-thumbs/01.png",
    pathname: "demo/01-flux-dev-t2i",
    workflowId: "01-flux-dev-t2i",
    workflowTitle: "FLUX Dev Text-to-Image",
    caption: "Demo tile — community uploads appear here when BLOB_READ_WRITE_TOKEN is configured.",
    type: "image/png",
    uploadedAt: new Date().toISOString(),
    isDemo: true,
  },
  {
    url: "/workflow-thumbs/02.png",
    pathname: "demo/02-flux-schnell-fast",
    workflowId: "02-flux-schnell-fast",
    workflowTitle: "FLUX Schnell Ultra-Fast",
    caption: "Demo tile — same workflow JSON as the NeuralDrift hub listing.",
    type: "image/png",
    uploadedAt: new Date().toISOString(),
    isDemo: true,
  },
  {
    url: "/workflow-thumbs/03.png",
    pathname: "demo/03-sdxl-standard",
    workflowId: "03-sdxl-standard",
    workflowTitle: "SDXL Standard",
    caption: "Demo tile — upload real proofs from /proofs/upload.",
    type: "image/png",
    uploadedAt: new Date().toISOString(),
    isDemo: true,
  },
];

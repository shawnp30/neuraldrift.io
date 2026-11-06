import Link from "next/link";
import { FOLDER_LABELS, MODEL_FILES, SOURCES_CHECKED_AT, formatBytes, type ModelFile } from "@/lib/modelFiles";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "/model-files",
  "ComfyUI Model Files: Downloads and Folders",
  "Every model file used by NeuralDrift's ComfyUI workflows: the folder it goes in, the loader node that reads it, and a verified official download with size and SHA-256."
);

const STATUS_BADGE: Record<ModelFile["status"], { label: string; className: string }> = {
  verified: { label: "Verified source", className: "nd-badge nd-badge-tested" },
  renamed: { label: "Renamed upstream", className: "nd-badge nd-badge-amber" },
  unverified: { label: "No verified source", className: "nd-badge nd-badge-unknown" },
};

export default function ModelFilesPage() {
  const folders = [...new Set(MODEL_FILES.map((m) => m.folder))].sort(
    (a, b) => Object.keys(FOLDER_LABELS).indexOf(a) - Object.keys(FOLDER_LABELS).indexOf(b)
  );

  return (
    <article className="nd-site">
      <div className="nd-shell nd-page">
        <header className="nd-section">
          <p className="nd-eyebrow">REFERENCE</p>
          <h1>ComfyUI model files</h1>
          <p className="nd-lead">
            Each of the {MODEL_FILES.length} model files used by NeuralDrift workflows, with the folder it belongs in and the
            loader node that reads it. Download sources were checked against the publisher on {SOURCES_CHECKED_AT}.
          </p>
          <p><Link className="nd-text-link" href="/guides/model-folders">How ComfyUI model folders work →</Link></p>
        </header>

        {folders.map((folder) => (
          <section key={folder} className="nd-section" aria-labelledby={`folder-${folder}`}>
            <h2 id={`folder-${folder}`}>{FOLDER_LABELS[folder] ?? folder}</h2>
            <p className="nd-subtle">ComfyUI/models/{folder}/</p>
            <div>
              {MODEL_FILES.filter((m) => m.folder === folder).map((m) => (
                <div key={m.slug} className="nd-dependency">
                  <span>
                    <Link className="nd-text-link" href={`/model-files/${m.slug}`}>{m.file}</Link>{" "}
                    <span className={STATUS_BADGE[m.status].className}>{STATUS_BADGE[m.status].label}</span>
                  </span>
                  <code>
                    {m.source ? formatBytes(m.source.sizeBytes) : "size unknown"} · {m.workflowIds.length} workflow{m.workflowIds.length === 1 ? "" : "s"}
                  </code>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

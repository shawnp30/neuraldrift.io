import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATALOG, WORKFLOW_TESTS } from "@/lib/catalog";
import {
  FOLDER_LABELS,
  LOADER_DISPLAY_NAMES,
  MODEL_FILES,
  SOURCES_CHECKED_AT,
  formatBytes,
  getModelFile,
  isIndexableModelFile,
  type ModelFile,
} from "@/lib/modelFiles";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return MODEL_FILES.map((model) => ({ slug: model.slug }));
}

function describe(model: ModelFile): string {
  const where = `${model.file} goes in ${model.dir}.`;
  if (model.status === "renamed" && model.alias && model.source) {
    return `${where} The official file is named ${model.alias.officialFile} (${formatBytes(model.source.sizeBytes)}). Download link, loader node and setup steps.`;
  }
  if (model.status === "verified" && model.source) {
    return `${where} Official download from ${model.source.repo} (${formatBytes(model.source.sizeBytes)}), loader node and setup steps.`;
  }
  return `${where} Loader node and the workflows that use it. No official download source has been verified yet.`;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const model = getModelFile(params.slug);
  if (!model) return {};
  return {
    ...pageMeta(`/model-files/${model.slug}`, `${model.file}: Download and ComfyUI Folder`, describe(model)),
    ...(isIndexableModelFile(model) ? {} : { robots: { index: false, follow: true } }),
  };
}

function loaderLabel(node: string) {
  const display = LOADER_DISPLAY_NAMES[node];
  return display ? <>{display} (<code>{node}</code>)</> : <code>{node}</code>;
}

export default function ModelFilePage({ params }: { params: { slug: string } }) {
  const model = getModelFile(params.slug);
  if (!model) notFound();

  const { source, alias } = model;
  const folderLabel = FOLDER_LABELS[model.folder] ?? model.folder;
  const workflows = CATALOG.filter((w) => model.workflowIds.includes(w.id));
  const sameFolder = MODEL_FILES.filter((m) => m.folder === model.folder && m.slug !== model.slug && isIndexableModelFile(m)).slice(0, 6);
  const portablePath = `ComfyUI_windows_portable\\${model.dir.replace(/\//g, "\\")}`;
  const downloadedName = alias ? alias.officialFile : model.file;

  return (
    <article className="nd-site">
      <div className="nd-shell nd-page">
        <Link className="nd-text-link" href="/model-files">← All model files</Link>

        <header className="nd-section">
          <p className="nd-eyebrow">MODEL FILE / {folderLabel}</p>
          <h1>{model.file}</h1>
          <p className="nd-lead">
            Put this file in <code>{model.dir}</code>.{" "}
            {model.status === "verified" && <>It is published by <strong>{source?.repo}</strong>.</>}
            {model.status === "renamed" && <>The official release uses a different file name: <strong>{alias?.officialFile}</strong>.</>}
            {model.status === "unverified" && <>NeuralDrift has not verified an official download source for it.</>}
          </p>
          {source && (
            <div className="nd-actions">
              <a className="nd-button" href={source.downloadUrl} rel="noopener noreferrer">
                Download ({formatBytes(source.sizeBytes)})
              </a>
              <a className="nd-button nd-secondary" href={source.pageUrl} target="_blank" rel="noopener noreferrer">
                View on {source.host === "github" ? "GitHub" : "Hugging Face"} ↗
              </a>
            </div>
          )}
        </header>

        <section className="nd-card nd-card-body" aria-labelledby="facts">
          <h2 id="facts">File details</h2>
          <dl>
            <dt>Folder</dt>
            <dd><code>{model.dir}</code></dd>
            <dt>Windows portable path</dt>
            <dd><code>{portablePath}</code></dd>
            <dt>Loader node</dt>
            <dd>{model.loaderNodes.map((node, i) => <span key={node}>{i > 0 && ", "}{loaderLabel(node)}</span>)}</dd>
            {alias && <><dt>Official file name</dt><dd><code>{alias.officialFile}</code></dd></>}
            {source && (
              <>
                <dt>Source</dt>
                <dd><a className="nd-text-link" href={source.pageUrl} target="_blank" rel="noopener noreferrer">{source.repo}/{source.path} ↗</a></dd>
                <dt>Size</dt>
                <dd>{formatBytes(source.sizeBytes)} ({source.sizeBytes.toLocaleString("en-US")} bytes)</dd>
                {source.sha256 && <><dt>SHA-256</dt><dd><code style={{ wordBreak: "break-all" }}>{source.sha256}</code></dd></>}
                <dt>Access</dt>
                <dd>{source.gated ? "Gated: accept the model license on Hugging Face while signed in before downloading." : "Public download, no sign-in required."}</dd>
                <dt>Source checked</dt>
                <dd>{SOURCES_CHECKED_AT}</dd>
              </>
            )}
          </dl>
        </section>

        {model.status === "renamed" && alias && (
          <section className="nd-section nd-prose">
            <h2>Why the file name doesn’t match</h2>
            <p>{alias.note}</p>
            <p>
              After downloading <code>{alias.officialFile}</code>, either select it in the loader node when you open the workflow, or
              rename it to <code>{model.file}</code> so the workflow finds it without changes.
            </p>
          </section>
        )}

        {model.status === "unverified" && (
          <section className="nd-section nd-prose">
            <h2>No verified download source</h2>
            <p>
              The workflows below reference <code>{model.file}</code>, but NeuralDrift has not confirmed where the original file is
              published. Do not substitute an unrelated model that happens to share the name. If you find the official release,
              check its file name and size before using it.
            </p>
          </section>
        )}

        <section className="nd-section nd-prose" aria-labelledby="install">
          <h2 id="install">Install it in ComfyUI</h2>
          <ol>
            <li>{source ? <>Download <code>{downloadedName}</code> from the source above.</> : <>Obtain <code>{model.file}</code> from its original publisher.</>}</li>
            <li>Move it into <code>{model.dir}</code> inside your ComfyUI install. On the Windows portable build that is <code>{portablePath}</code>.</li>
            <li>Restart ComfyUI or refresh the browser tab so the loader’s file list includes it.</li>
            <li>In the {model.loaderNodes.map((node, i) => <span key={node}>{i > 0 && " or "}{loaderLabel(node)}</span>)} node, select <code>{alias ? `${alias.officialFile} (or ${model.file} if you renamed it)` : model.file}</code>.</li>
          </ol>
          {source?.sha256 && (
            <>
              <h3>Check the download</h3>
              <p>Compare the file’s SHA-256 with the value above. A mismatch means the download is incomplete or a different file.</p>
              <pre>{`# Windows PowerShell\nGet-FileHash .\\${downloadedName} -Algorithm SHA256\n\n# Linux / macOS\nsha256sum ${downloadedName}`}</pre>
            </>
          )}
          <p><Link className="nd-text-link" href="/guides/model-folders">How ComfyUI model folders work →</Link></p>
        </section>

        <section className="nd-section" aria-labelledby="workflows">
          <h2 id="workflows">Workflows that use {model.file}</h2>
          <div>
            {workflows.map((w) => (
              <div key={w.id} className="nd-dependency">
                <span>
                  <Link className="nd-text-link" href={`/workflows/${w.id}`}>{w.title}</Link>
                  {WORKFLOW_TESTS[w.id] && <> <span className="nd-badge nd-badge-tested">Tested on RTX 5080</span></>}
                </span>
                <code>{w.category}</code>
              </div>
            ))}
          </div>
        </section>

        {sameFolder.length > 0 && (
          <section className="nd-section" aria-labelledby="related">
            <h2 id="related">Other files in {model.dir}</h2>
            <div>
              {sameFolder.map((m) => (
                <div key={m.slug} className="nd-dependency">
                  <Link className="nd-text-link" href={`/model-files/${m.slug}`}>{m.file}</Link>
                  {m.source && <code>{formatBytes(m.source.sizeBytes)}</code>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

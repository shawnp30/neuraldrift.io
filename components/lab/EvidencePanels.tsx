// components/lab/EvidencePanels.tsx
// Evidence sections for a benchmark result: artifacts, licenses, failure, limitations, hashed files.

import type { ArtifactRef, BenchmarkRecord, FailureEvidence, HashedFileRef, LicenseInfo } from '@/lib/benchmarks/types';
import { COMMERCIAL_USE_LABEL } from '@/lib/audio/catalog';

const rowLabel = { padding: '6px 0', color: 'rgba(255,255,255,0.6)', verticalAlign: 'top' } as const;
const mono = { wordBreak: 'break-all', fontSize: '0.8rem' } as const;

function formatSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
  return `${bytes.toLocaleString('en-US')} bytes`;
}

/**
 * Lists generated artifacts. A player is rendered only when `playableUrls` confirms the file is actually
 * served by the site; local-only artifacts show metadata and their hash, never a broken player.
 */
export function ArtifactPanel({ artifacts, playableUrls = [] }: { artifacts: ArtifactRef[]; playableUrls?: string[] }) {
  if (!artifacts.length) return <p className="nd-subtle">No output artifact was produced by this run.</p>;
  return (
    <div className="nd-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      {artifacts.map((artifact) => {
        const playable = artifact.storage === 'public' && artifact.publicUrl != null && playableUrls.includes(artifact.publicUrl);
        return (
          <div className="nd-card nd-card-body" key={artifact.sha256}>
            <p className="nd-eyebrow">{artifact.format.toUpperCase()} ARTIFACT · {playable ? 'PUBLISHED' : 'RETAINED LOCALLY'}</p>
            {playable ? (
              <audio controls preload="none" src={artifact.publicUrl} style={{ width: '100%', margin: '0.5rem 0' }} />
            ) : (
              <p className="nd-subtle">Not published, so there is no player. The file is kept on the NeuralDrift testbench; its SHA-256 identifies it exactly.</p>
            )}
            <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={rowLabel}>SHA-256</td><td style={{ textAlign: 'right' }}><code style={mono}>{artifact.sha256}</code></td></tr>
                <tr><td style={rowLabel}>Size</td><td style={{ textAlign: 'right' }}>{formatSize(artifact.bytes)}</td></tr>
                <tr><td style={rowLabel}>Recorded path</td><td style={{ textAlign: 'right' }}><code style={mono}>{artifact.path}</code></td></tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

function LicenseCard({ title, license }: { title: string; license: LicenseInfo | undefined }) {
  return (
    <div className="nd-card nd-card-body">
      <p className="nd-eyebrow">{title}</p>
      {license ? (
        <>
          <h3 style={{ margin: '0.25rem 0' }}>{license.id}</h3>
          <p>{COMMERCIAL_USE_LABEL[license.commercialUse]}</p>
          {license.notes && <p className="nd-subtle">{license.notes}</p>}
          <p className="nd-subtle">
            <a className="nd-text-link" href={license.sourceUrl} target="_blank" rel="noopener noreferrer">License source</a>
            {license.verifiedAt ? ` · read ${license.verifiedAt}` : ''}
          </p>
        </>
      ) : (
        <p className="nd-subtle">Not recorded for this run.</p>
      )}
    </div>
  );
}

export function LicensePanel({ run }: { run: BenchmarkRecord }) {
  return (
    <>
      <div className="nd-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <LicenseCard title="RUNTIME LICENSE" license={run.runtime.license} />
        <LicenseCard title="MODEL LICENSE" license={run.model.license} />
      </div>
      <p className="nd-subtle" style={{ marginTop: '0.75rem' }}>
        Runtime and model licenses are separate: an openly licensed engine does not change the terms of the weights it loads. This is a summary of the licensor&apos;s own text, not legal advice.
      </p>
    </>
  );
}

export function FailurePanel({ failure }: { failure: FailureEvidence }) {
  return (
    <div className="nd-card nd-card-body" style={{ borderColor: 'rgba(248,113,113,0.4)' }}>
      <p className="nd-eyebrow">FAILURE · STAGE {failure.stage.toUpperCase()} · {failure.type}</p>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', margin: 0 }}><code>{failure.message}</code></pre>
    </div>
  );
}

export function LimitationsPanel({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
      {items.map((item) => <li key={item} style={{ marginBottom: '0.4rem' }}>{item}</li>)}
    </ul>
  );
}

export function HashedFilesTable({ files }: { files: HashedFileRef[] }) {
  return (
    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
      <tbody>
        {files.map((file) => (
          <tr key={`${file.path}-${file.sha256}`}>
            <td style={rowLabel}><code style={mono}>{file.path}</code><br /><span className="nd-subtle">{formatSize(file.bytes)}</span></td>
            <td style={{ textAlign: 'right', padding: '6px 0' }}><code style={mono}>{file.sha256}</code></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// lib/benchmarks/publicArtifacts.ts
// Server-side check that a published artifact is really served, so the Lab never renders a player
// that points at a missing file (Node only; used at render/build time).

import fs from 'node:fs';
import path from 'node:path';
import type { BenchmarkRecord } from './types';

export function publicFileFor(url: string, publicDir = path.join(process.cwd(), 'public')): string | null {
  if (!url.startsWith('/') || url.includes('..')) return null;
  return path.join(publicDir, ...url.slice(1).split('/'));
}

/** Public URLs of this record's artifacts whose files exist under public/. */
export function servedArtifactUrls(record: BenchmarkRecord, publicDir?: string): string[] {
  return (record.artifacts ?? [])
    .filter((a) => a.storage === 'public' && a.publicUrl)
    .map((a) => a.publicUrl!)
    .filter((url) => {
      const file = publicFileFor(url, publicDir);
      return file != null && fs.existsSync(file);
    });
}

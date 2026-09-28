// lib/benchmarks/artifacts.ts
// Content hashing for model files, workload inputs and generated artifacts (Node only).

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { ArtifactRef, HashedFileRef, WorkloadInputRef } from './types';
import { analyzeWav } from './audio';
import type { AudioArtifactObservation } from './validators';

/** Reads and decodes a generated WAV so the validator judges the real samples. */
export async function inspectAudioArtifact(filePath: string): Promise<AudioArtifactObservation> {
  if (!fs.existsSync(filePath)) return { path: filePath, exists: false };
  try {
    return { path: filePath, exists: true, analysis: analyzeWav(await fs.promises.readFile(filePath)) };
  } catch (err) {
    return { path: filePath, exists: true, decodeError: err instanceof Error ? err.message : String(err) };
  }
}

/** Streams a file through SHA-256 so multi-gigabyte weights never load into memory. */
export async function sha256File(filePath: string): Promise<string> {
  const hash = crypto.createHash('sha256');
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .on('data', (chunk) => hash.update(chunk))
      .on('end', () => resolve())
      .on('error', reject);
  });
  return hash.digest('hex');
}

/** Records a path relative to `root` when the file lives under it, otherwise as given. */
function displayPath(filePath: string, root?: string): string {
  if (!root) return filePath;
  const relative = path.relative(root, filePath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
    ? relative.split(path.sep).join('/')
    : filePath;
}

export async function hashFile(filePath: string, root?: string): Promise<HashedFileRef> {
  const stat = await fs.promises.stat(filePath);
  if (!stat.isFile()) throw new Error(`Not a file: ${filePath}`);
  return { path: displayPath(filePath, root), sha256: await sha256File(filePath), bytes: stat.size };
}

/**
 * Like hashFile, but reuses a previous hash while the file's size and modification time are unchanged.
 * Multi-gigabyte weights are hashed once per change instead of once per run.
 */
export async function hashFileCached(filePath: string, root: string | undefined, cacheFile: string): Promise<HashedFileRef> {
  const stat = await fs.promises.stat(filePath);
  let cache: Record<string, { bytes: number; mtimeMs: number; sha256: string }> = {};
  try { cache = JSON.parse(await fs.promises.readFile(cacheFile, 'utf8')); } catch { cache = {}; }
  const key = path.resolve(filePath);
  const hit = cache[key];
  if (hit && hit.bytes === stat.size && hit.mtimeMs === stat.mtimeMs) return { path: displayPath(filePath, root), sha256: hit.sha256, bytes: stat.size };
  const ref = await hashFile(filePath, root);
  cache[key] = { bytes: stat.size, mtimeMs: stat.mtimeMs, sha256: ref.sha256 };
  await fs.promises.mkdir(path.dirname(cacheFile), { recursive: true });
  await fs.promises.writeFile(cacheFile, JSON.stringify(cache, null, 2));
  return ref;
}

export async function buildArtifactRef(filePath: string, root: string, format: string): Promise<ArtifactRef> {
  return { ...(await hashFile(filePath, root)), format, storage: 'local_only' };
}

/**
 * Re-hashes each declared workload input and refuses to run when the content no longer matches:
 * a mutable filename is never accepted as the identity of an input.
 */
export async function verifyWorkloadInputs(inputs: WorkloadInputRef[] | undefined, root: string): Promise<WorkloadInputRef[]> {
  const verified: WorkloadInputRef[] = [];
  for (const input of inputs ?? []) {
    const absolute = path.isAbsolute(input.path) ? input.path : path.join(root, input.path);
    const actual = await hashFile(absolute, root);
    if (actual.sha256 !== input.sha256.toLowerCase()) {
      throw new Error(`Workload input "${input.role}" (${input.path}) content changed: expected ${input.sha256}, found ${actual.sha256}.`);
    }
    verified.push({ ...input, sha256: actual.sha256, bytes: actual.bytes });
  }
  return verified;
}

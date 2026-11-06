// Verifies every model download source used by the workflow catalog and records what
// the source actually serves: exact file path, size and (for Hugging Face LFS files)
// SHA-256. Model-file pages only present a source as verified when it appears here.
//
// Usage: node scripts/verify-model-sources.mjs
// Writes data/model-file-verification.json. Network access required; read-only remotely.
import { readFileSync, writeFileSync } from "node:fs";

const assets = JSON.parse(readFileSync("data/workflow-assets.json", "utf8"));
const aliases = JSON.parse(readFileSync("data/model-file-aliases.json", "utf8"));

// file name -> source URL to verify (workflow downloadUrl, or the alias's official file).
const sources = new Map();
for (const asset of Object.values(assets)) {
  for (const model of asset.models) {
    const alias = aliases[model.file];
    if (alias) sources.set(model.file, { url: alias.officialUrl, expectedFile: alias.officialFile });
    else if (model.downloadUrl && !sources.has(model.file)) sources.set(model.file, { url: model.downloadUrl, expectedFile: model.file });
  }
}

const repoTrees = new Map();
function hfRepoTree(repo) {
  if (!repoTrees.has(repo)) {
    repoTrees.set(repo, (async () => {
      const meta = await fetch(`https://huggingface.co/api/models/${repo}`);
      if (!meta.ok) throw new Error(`Hugging Face repo ${repo}: HTTP ${meta.status}`);
      const { id, gated } = await meta.json();
      const tree = await fetch(`https://huggingface.co/api/models/${id}/tree/main?recursive=1`);
      if (!tree.ok) throw new Error(`Hugging Face tree ${id}: HTTP ${tree.status}`);
      return { id, gated: Boolean(gated), entries: await tree.json() };
    })());
  }
  return repoTrees.get(repo);
}

async function verifyHuggingFace(url, expectedFile) {
  const repo = url.match(/^https:\/\/huggingface\.co\/([^/]+\/[^/?#]+)/)[1];
  const { id, gated, entries } = await hfRepoTree(repo);
  const resolvePath = url.match(/\/resolve\/main\/([^?#]+)/)?.[1];
  const entry = entries.find((e) => e.type === "file" && (resolvePath ? e.path === decodeURIComponent(resolvePath) : e.path.split("/").pop() === expectedFile));
  if (!entry) throw new Error(`${expectedFile} not found in ${id}`);
  return {
    host: "huggingface",
    repo: id,
    path: entry.path,
    downloadUrl: `https://huggingface.co/${id}/resolve/main/${entry.path}`,
    pageUrl: `https://huggingface.co/${id}/blob/main/${entry.path}`,
    sizeBytes: entry.lfs?.size ?? entry.size,
    sha256: entry.lfs?.oid ?? null,
    gated,
  };
}

async function verifyGitHubRelease(url, expectedFile) {
  if (!url.endsWith(`/${expectedFile}`)) throw new Error(`${url} does not name ${expectedFile}`);
  const res = await fetch(url, { method: "HEAD", redirect: "follow" });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const [, owner, repo, tag] = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\/download\/([^/]+)\//);
  return {
    host: "github",
    repo: `${owner}/${repo}`,
    path: expectedFile,
    downloadUrl: url,
    pageUrl: `https://github.com/${owner}/${repo}/releases/tag/${tag}`,
    sizeBytes: Number(res.headers.get("content-length")),
    sha256: null,
    gated: false,
  };
}

const files = {};
const failures = [];
for (const [file, { url, expectedFile }] of [...sources].sort(([a], [b]) => a.localeCompare(b))) {
  try {
    if (url.startsWith("https://huggingface.co/")) files[file] = await verifyHuggingFace(url, expectedFile);
    else if (url.startsWith("https://github.com/")) files[file] = await verifyGitHubRelease(url, expectedFile);
    else throw new Error(`unsupported source host: ${url}`);
    console.log(`verified  ${file}`);
  } catch (error) {
    failures.push(`${file}: ${error.message}`);
  }
}

writeFileSync("data/model-file-verification.json", `${JSON.stringify({ checkedAt: new Date().toISOString().slice(0, 10), files }, null, 2)}\n`);
console.log(`\n${Object.keys(files).length} verified, ${failures.length} failed`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}

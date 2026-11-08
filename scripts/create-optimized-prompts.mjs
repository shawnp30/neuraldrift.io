// Builds OPTIMIZED prompts: each workflow's STANDARD prompt (exactly what a STANDARD run submits)
// with a recipe's explicit input changes applied, saved to data/optimized-prompts/<id>.json with
// the hash of the workflow file it came from and the list of nodes that changed.
//
// Usage: npm run evidence:optimize -- data/optimization-recipes/<recipe>.json 01 30 [--endpoint http://127.0.0.1:8188]
// A recipe change that matches no node, or a new value the live ComfyUI does not offer, is an error.
import fs from 'node:fs';
import { apiPrompt, savedSubgraphPrompt } from './workflow-api.mjs';
import { workflowSha256 } from './workflow-hashes.mjs';

const args = process.argv.slice(2);
const endpointAt = args.indexOf('--endpoint');
const endpoint = endpointAt === -1 ? 'http://127.0.0.1:8188' : args[endpointAt + 1];
const positional = args.filter((arg, i) => !arg.startsWith('--') && (endpointAt === -1 || i !== endpointAt + 1));
const [recipePath, ...ids] = positional;
if (!recipePath || !ids.length) throw new Error('Usage: npm run evidence:optimize -- <recipe.json> <workflow ids...>');
const recipe = JSON.parse(fs.readFileSync(recipePath, 'utf8'));
if (!recipe.id || !recipe.notes || !recipe.changes?.length) throw new Error(`${recipePath} needs an id, notes and at least one change.`);

const objectInfo = await (await fetch(new URL('/object_info', endpoint), { signal: AbortSignal.timeout(60000) })).json();
const optionsFor = (classType, input) => {
  const [type, options] = objectInfo[classType]?.input?.required?.[input] ?? objectInfo[classType]?.input?.optional?.[input] ?? [];
  if (Array.isArray(type)) return type;
  if (type === 'COMBO' && Array.isArray(options?.options)) return options.options;
  return null;
};

fs.mkdirSync('data/optimized-prompts', { recursive: true });
for (const id of ids) {
  if (!/^\d{2}$/.test(id)) throw new Error(`Unknown workflow ID: ${id}`);
  const graph = JSON.parse(fs.readFileSync(`public/workflows/${id}.json`, 'utf8'));
  const prompt = structuredClone(graph.definitions?.subgraphs?.length ? savedSubgraphPrompt(id) : apiPrompt(graph, objectInfo));
  const changed = [];
  for (const change of recipe.changes) {
    const options = optionsFor(change.classType, change.input);
    if (options && !options.includes(change.to)) throw new Error(`${change.classType}.${change.input} = ${change.to} is not available in this ComfyUI.`);
    const nodes = Object.entries(prompt).filter(([, node]) => node.class_type === change.classType && node.inputs[change.input] === change.from);
    if (!nodes.length) throw new Error(`Workflow ${id} has no ${change.classType} with ${change.input} = ${change.from}; recipe ${recipe.id} does not apply.`);
    for (const [nodeId, node] of nodes) {
      node.inputs[change.input] = change.to;
      changed.push({ node: nodeId, ...change });
    }
  }
  const saved = { workflowId: id, workflowSha256: workflowSha256(id), recipe: recipe.id, optimizationNotes: recipe.notes, changes: changed, prompt };
  fs.writeFileSync(`data/optimized-prompts/${id}.json`, JSON.stringify(saved, null, 2) + '\n');
  console.log(`${id}: ${changed.length} input(s) changed -> data/optimized-prompts/${id}.json`);
}

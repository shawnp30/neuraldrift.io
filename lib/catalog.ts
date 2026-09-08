import { WORKFLOWS, WorkflowEntry } from './workflowsData';
import assetData from '@/data/workflow-assets.json';
import descriptions from '@/data/workflow-descriptions.json';
import testData from '@/data/workflow-tests.json';
import { workflowExecutions, evidenceFreshness, HARDWARE_PROFILES } from './hardware/executions';
export interface WorkflowAsset { source:string; sourceAsset:string; license:string|null; models:{file:string;dir:string;downloadUrl:string|null}[]; nodeTypes:string[]; hasSubgraphs:boolean; executionTested:boolean; settings:{node:string;id:number;values:unknown[]}[]; inputFiles:string[]; missingModelSources:string[] }
export const WORKFLOW_ASSETS: Record<string, WorkflowAsset> = assetData;
export interface WorkflowTestRecord {
  workflowId: string;
  status: string;
  workflowSha256: string;
  testDate: string;
  gpu: string;
  gpuMemoryBytes: number;
  systemRamBytes: number;
  os: string;
  python: string;
  comfyUI: string;
  pytorch: string;
  generationSeconds: number;
  resolution?: string;
  batchSize?: number;
  settings?: Record<string, any>;
  peakMemory?: number | null;
  model: string;
  modelSha256?: string | null;
  customNodes?: string;
  preview: string;
  prompt?: string;
  outputKind: string;
  outputArtifact?: string;
  failureReason?: string;
}
export const WORKFLOW_TESTS: Record<string, WorkflowTestRecord | undefined> = testData as unknown as Record<string, WorkflowTestRecord>;
const TITLES: Record<string,string> = {
  '12': 'LTX 2.3 — Portrait Video',
  '14': 'LTX 2.3 — Short Video Draft',
  '15': 'AnimateDiff Walking Character',
  '16': 'AnimateDiff Looping Particle Preset',
  '17': 'AnimateDiff Landscape Timelapse',
  '18': 'AnimateDiff Product Rotation',
  '19': 'AnimateDiff Slow Zoom',
  '22': '4x Model Upscale — Real-ESRGAN',
  '25': 'SDXL Sketch to Image',
  '27': 'SD 1.5 Object Removal (Inpaint)',
  '31': 'ControlNet Canny — SDXL',
  '32': 'ControlNet Depth — SDXL',
  '33': 'ControlNet OpenPose — SD 1.5',
  '34': 'ControlNet Lineart — SD 1.5',
  '35': 'ControlNet Tile — SD 1.5',
  '37': 'SDXL Batch ×8 Variations'
};

export type WorkflowKind = 'pipeline' | 'preset' | 'utility' | 'enhancement' | 'control' | 'video' | 'audio';

export function workflowKind(workflow: WorkflowEntry): WorkflowKind {
  const id = workflow.id;
  if (['21', '22'].includes(id)) return 'utility';
  if (['23', '24', '25', '26', '27'].includes(id)) return 'enhancement';
  if (['11', '12', '13', '14', '15', '16', '17', '18', '19', '20'].includes(id)) return 'video';
  if (id === '43') return 'audio';
  if (['31', '32', '33', '34', '35'].includes(id)) return 'control';
  if (['28', '29', '30', '38', '39', '40', '41', '42', '44', '45', '46', '47', '48', '49', '50'].includes(id)) return 'preset';
  return 'pipeline';
}

export function workflowKindLabel(kind: WorkflowKind): string {
  switch (kind) {
    case 'preset': return 'Preset';
    case 'utility': return 'Enhancement / Upscale';
    case 'enhancement': return 'Enhancement';
    case 'video': return 'Video';
    case 'audio': return 'Audio';
    case 'control': return 'Control';
    default: return 'Pipeline';
  }
}


export const CATALOG = Array.from(new Map(WORKFLOWS.map(w => {
 const asset = WORKFLOW_ASSETS[w.id]; const description = (descriptions as Record<string,string>)[w.id] || w.description;
 const test = WORKFLOW_TESTS[w.id];
 return [w.id, { ...w, title:TITLES[w.id] || w.title, description, longDescription:description, model:asset?.models.find(m => /checkpoints|diffusion_models/.test(m.dir))?.file || w.model, imageUrl:test?.outputKind === 'image' ? test.preview : w.imageUrl, proofPrompt:test?.prompt || w.proofPrompt } as WorkflowEntry];
})).values());
export const MEMORY_OPTIONS = [4, 6, 8, 10, 12, 16, 24, 32, 48];
export function memoryEstimate(workflow: WorkflowEntry): number | null {
  if (['05','06','07','08','09','10','11','12','13','14','20','35','43'].includes(workflow.id)) return null;
  const value = Number.parseInt(workflow.vram, 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}
export function downloadUrl(workflow: WorkflowEntry) {
  return workflow.workflowJsonUrl || `/workflows/${workflow.id}.json`;
}
export function compatibilityStatus(workflow: WorkflowEntry): 'TESTED' | 'ESTIMATED' | 'UNKNOWN' {
  if (workflowExecutions(workflow.id).some(r => r.outcome === 'SUCCESS' && evidenceFreshness(r) === 'CURRENT')) return 'TESTED';
  const memory = memoryEstimate(workflow);
  return memory === null ? 'UNKNOWN' : 'ESTIMATED';
}
export function compatibilityLabel(workflow: WorkflowEntry) {
  const memory = memoryEstimate(workflow);
  const test = workflowExecutions(workflow.id).find(r => r.outcome === 'SUCCESS' && evidenceFreshness(r) === 'CURRENT');
  if (test) {
    const hardware = HARDWARE_PROFILES.find(p => p.id === test.hardwareProfileId);
    return `TESTED on ${hardware?.name ?? 'recorded hardware'} - ${test.executionProfile}`;
  }
  return memory === null ? 'UNKNOWN VRAM requirement' : `ESTIMATED ${memory} GB VRAM`;
}

export function workflowType(workflow: WorkflowEntry) {
  return /ace.?step|audio|music/i.test(`${workflow.model} ${workflow.tags.join(' ')}`) ? 'audio' : workflow.category;
}
export interface CatalogFilters { q?: string; vram?: string; type?: string; model?: string; difficulty?: string; sort?: string }
export function filterWorkflows(filters: CatalogFilters) {
  const query = filters.q?.trim().toLowerCase() || '';
  const capacity = Number(filters.vram);
  return CATALOG.filter(w => {
    const memory = memoryEstimate(w);
    return (!query || [w.title, w.description, w.model, ...w.tags].join(' ').toLowerCase().includes(query))
      && (!filters.vram || (filters.vram === 'unknown' ? memory === null : capacity > 0 && memory !== null && memory <= capacity))
      && (!filters.type || workflowType(w) === filters.type)
      && (!filters.model || w.model === filters.model)
      && (!filters.difficulty || w.difficulty === filters.difficulty);
  }).sort((a, b) => filters.sort === 'memory' ? (memoryEstimate(a) ?? Infinity) - (memoryEstimate(b) ?? Infinity)
    : filters.sort === 'title' ? a.title.localeCompare(b.title) : Number(!!b.featured) - Number(!!a.featured));
}

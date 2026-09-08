import Link from 'next/link';
import { CATALOG, CatalogFilters, filterWorkflows, MEMORY_OPTIONS, workflowType, WORKFLOW_TESTS, memoryEstimate } from '@/lib/catalog';
import WorkflowCard from '@/components/workflows/WorkflowCard';
import { pageMeta } from '@/lib/seo';
import { COMMON_GPUS, findGpuBySlug } from '@/lib/hardware/gpuData';
import { resolveHardwareTarget } from '@/lib/hardware/compatibility';

type Props = { searchParams: Record<string, string | string[] | undefined> };
export function generateMetadata({ searchParams }: Props) {
  return { ...pageMeta('/workflows', 'ComfyUI workflow catalog', 'Find ComfyUI workflows by available VRAM, output type, model and difficulty. Explore setup details and download JSON files.'), robots: { index: Object.keys(searchParams).length === 0, follow: true } };
}
export default function WorkflowsPage({ searchParams }: Props) {
  const gpuParam = typeof searchParams.gpu === 'string' ? searchParams.gpu : '';
  const evidenceParam = typeof searchParams.evidence === 'string' ? searchParams.evidence : '';
  
  const filters: CatalogFilters = Object.fromEntries(['q', 'vram', 'type', 'model', 'difficulty', 'sort'].map(key => [key, typeof searchParams[key] === 'string' ? searchParams[key] : '']));
  
  const targetHardware = resolveHardwareTarget(gpuParam, filters.vram);
  
  let results = filterWorkflows(filters);

  // Filter by evidence status if requested
  if (evidenceParam === 'tested') {
    results = results.filter(w => WORKFLOW_TESTS[w.id]?.status === 'completed');
  } else if (evidenceParam === 'estimated') {
    results = results.filter(w => WORKFLOW_TESTS[w.id]?.status !== 'completed' && memoryEstimate(w) !== null);
  } else if (evidenceParam === 'unknown') {
    results = results.filter(w => memoryEstimate(w) === null);
  }

  const active = [
    ...(gpuParam ? [['gpu', findGpuBySlug(gpuParam)?.shortName || gpuParam]] : []),
    ...(evidenceParam ? [['evidence', evidenceParam]] : []),
    ...Object.entries(filters).filter(([, value]) => value)
  ];

  const types = Array.from(new Set(CATALOG.map(workflowType))).sort();
  const models = Array.from(new Set(CATALOG.map(w => w.model))).sort();

  return <div className="nd-site nd-shell nd-page">
    <p className="nd-eyebrow">THE WORKFLOW CATALOG</p><h1>Find your next workflow.</h1><p className="nd-lead">{CATALOG.length} starting points for ComfyUI. Select your GPU to view evidence-backed compatibility.</p>
    <form method="get" action="/workflows" id="filters" className="nd-card nd-filters">
      <div className="nd-search"><label htmlFor="q">Search workflows</label><input id="q" name="q" type="search" defaultValue={filters.q} placeholder="Try Flux, portrait, audio…" /></div>
      
      <div>
        <label htmlFor="gpu">My GPU Model</label>
        <select id="gpu" name="gpu" defaultValue={gpuParam}>
          <option value="">Any GPU model</option>
          {COMMON_GPUS.map(g => <option key={g.id} value={g.id}>{g.shortName} ({g.vramGb}GB)</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="vram">My GPU’s VRAM</label>
        <select id="vram" name="vram" defaultValue={filters.vram}>
          <option value="">Any memory</option>
          {MEMORY_OPTIONS.map(n => <option key={n} value={n}>Up to {n} GB (estimated)</option>)}
          <option value="unknown">Unknown requirements</option>
        </select>
      </div>

      <div>
        <label htmlFor="evidence">Evidence Status</label>
        <select id="evidence" name="evidence" defaultValue={evidenceParam}>
          <option value="">All workflows</option>
          <option value="tested">Directly execution-tested only</option>
          <option value="estimated">Estimated from requirements</option>
          <option value="unknown">Unknown requirements</option>
        </select>
      </div>

      <div><label htmlFor="type">Workflow type</label><select id="type" name="type" defaultValue={filters.type}><option value="">All types</option>{types.map(t => <option key={t}>{t}</option>)}</select></div>
      <div><label htmlFor="model">Model</label><select id="model" name="model" defaultValue={filters.model}><option value="">All models</option>{models.map(m => <option key={m}>{m}</option>)}</select></div>
      <div><label htmlFor="difficulty">Difficulty</label><select id="difficulty" name="difficulty" defaultValue={filters.difficulty}><option value="">All levels</option>{['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d}>{d}</option>)}</select></div>
      <div><label htmlFor="sort">Sort by</label><select id="sort" name="sort" defaultValue={filters.sort}><option value="">Featured first</option><option value="memory">Lowest VRAM first</option><option value="title">Title A–Z</option></select></div>
      <div className="nd-actions"><button className="nd-button" type="submit">Apply filters</button><Link href="/workflows#filters" className="nd-text-link">Reset all</Link></div>
      <p className="nd-subtle nd-filter-note">
        {targetHardware?.gpu 
          ? `Evaluating against ${targetHardware.gpu.name}. Tested workflows indicate direct local execution; higher VRAM does not guarantee lower VRAM compatibility.`
          : 'Select your exact GPU or VRAM to view factual compatibility evaluations. Tests were conducted on an RTX 5080.'}
        {' '}<Link className="nd-text-link" href="/compatibility">About compatibility methodology →</Link>
      </p>
    </form>
    {active.length > 0 && <div className="nd-active" aria-label="Selected filters">{active.map(([key, value]) => { const remaining = new URLSearchParams(active.filter(([k]) => k !== key)); return <Link key={key} href={`/workflows${remaining.size ? `?${remaining}` : ''}#filters`} aria-label={`Remove ${key}: ${value}`}>{key}: {value} ×</Link>; })}</div>}
    <section className="nd-section">
      <div className="nd-section-heading">
        <h2>{results.length} {results.length === 1 ? 'workflow' : 'workflows'}</h2>
        <span className="nd-subtle">
          {targetHardware?.gpu 
            ? `Evaluated for ${targetHardware.gpu.shortName} (${targetHardware.vramGb}GB)` 
            : targetHardware 
            ? `Evaluated for ${targetHardware.vramGb}GB VRAM` 
            : 'Catalog overview · select GPU for tailored evidence'}
        </span>
      </div>
      {results.length ? <div className="nd-grid">{results.map(w => <WorkflowCard key={w.id} workflow={w} targetHardware={targetHardware || undefined} />)}</div> : <div className="nd-card nd-empty"><h3>No workflows match these filters.</h3><p>Try a broader search or reset your GPU selection. A missing match does not prove that your GPU is unsupported.</p><Link className="nd-button" href="/workflows#filters">Clear filters and browse all</Link></div>}
    </section>
  </div>;
}


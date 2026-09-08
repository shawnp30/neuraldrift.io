import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { CATALOG, MEMORY_OPTIONS, WORKFLOW_TESTS } from '@/lib/catalog';
import { getGuides } from '@/lib/guides';
import WorkflowCard from '@/components/workflows/WorkflowCard';

export const metadata = pageMeta('/', 'Find ComfyUI workflows for your GPU', 'Explore ComfyUI image, video and audio workflows with hardware estimates, model sources, downloads and setup guides.');

export default function HomePage() {
  const guides = getGuides();
  const featured = ['04', '03', '01'].map(id => CATALOG.find(w => w.id === id)!).filter(Boolean);
  const helpful = guides.filter(g => ['installation', 'model-folders', 'workflow-errors'].includes(g.slug));
  return <div className="nd-site">
    <section className="nd-shell nd-hero">
      <div>
        <p className="nd-eyebrow">LOCAL AI, A CLEAR STARTING POINT</p>
        <h1>Find ComfyUI workflows <span>for your GPU.</span></h1>
        <p className="nd-lead">Explore image, video, and audio workflows with clear hardware requirements, setup instructions, and troubleshooting guidance.</p>
        <div className="nd-actions"><a href="#gpu-finder" className="nd-button">Find workflows for my GPU <span aria-hidden="true">↗</span></a><Link href="/workflows" className="nd-button nd-secondary">Browse workflows</Link></div>
        <p className="nd-subtle">{CATALOG.length} workflows · {guides.length} guides · JSON downloads without an account</p>
      </div>
      <form action="/workflows" method="get" id="gpu-finder" className="nd-finder nd-card">
        <p className="nd-eyebrow">START WITH YOUR HARDWARE</p>
        <h2>How much VRAM do you have?</h2>
        <p>Choose your GPU’s dedicated memory to narrow the catalog.</p>
        <label htmlFor="home-vram">Available GPU memory</label>
        <select name="vram" id="home-vram" defaultValue=""><option value="">I’m not sure — show all</option>{MEMORY_OPTIONS.map(n => <option key={n} value={n}>{n} GB VRAM</option>)}</select>
        <button className="nd-button" type="submit">Show matching workflows →</button>
        <p className="nd-subtle">Matches use catalog estimates, not GPU tests. Memory alone does not guarantee compatibility.</p>
        <Link className="nd-text-link" href="/compatibility">Understand hardware requirements ↗</Link>
      </form>
    </section>
    <section className="nd-shell nd-section">
      <div className="nd-section-heading"><div><p className="nd-eyebrow">CHOOSE A STARTING POINT</p><h2>From first image to more detail</h2></div><Link className="nd-text-link" href="/workflows">All workflows →</Link></div>
      <div className="nd-grid">{featured.map(w => <WorkflowCard key={w.id} workflow={w} />)}</div>
    </section>
    <section className="nd-shell nd-section">
      <p className="nd-eyebrow">YOUR FIRST RUN</p><h2>Choose. Set up. Create.</h2>
      <div className="nd-grid nd-steps">{[
        ['01', 'Choose a workflow', 'Filter by memory, output type, model and difficulty. Review the estimate and dependencies before downloading.', '/workflows', 'Explore the catalog'],
        ['02', 'Install the dependencies', 'Follow the setup guide, get the listed models from their sources, and check any custom nodes.', '/guides/installation', 'Read the installation guide'],
        ['03', 'Run and troubleshoot', 'Load the JSON in ComfyUI. Keep the first run small and use the error guides if a model or node is missing.', '/guides/workflow-errors', 'Find troubleshooting help'],
      ].map(([n, title, copy, href, label]) => <article key={n}><span className="nd-step-number">{n}</span><h3>{title}</h3><p>{copy}</p><Link className="nd-text-link" href={href}>{label} →</Link></article>)}</div>
    </section>
    <section className="nd-shell nd-section"><div className="nd-trust"><div><p className="nd-eyebrow">KNOW WHAT THE NUMBERS MEAN</p><h2>Useful estimates. Clear limits.</h2></div><div><p>The catalog separates hardware estimates from completed runs. {Object.keys(WORKFLOW_TESTS).length} workflows have recorded local tests; the others still need execution evidence.</p><p>Actual test outputs are labeled. Other previews are catalog illustrations. A run on one GPU does not establish compatibility or speed on another.</p><Link className="nd-text-link" href="/compatibility">How compatibility is reported →</Link></div></div></section>
    <section className="nd-shell nd-section"><div className="nd-section-heading"><div><p className="nd-eyebrow">GET UNSTUCK</p><h2>Keep your setup moving</h2></div><Link href="/guides" className="nd-text-link">All {guides.length} guides →</Link></div><div className="nd-grid">{helpful.map(g => <article key={g.slug} className="nd-card nd-card-body"><h3><Link href={`/guides/${g.slug}`}>{g.title}</Link></h3><p>{g.description}</p><Link href={`/guides/${g.slug}`} className="nd-text-link">Read guide →</Link></article>)}</div></section>
    <section className="nd-shell nd-section nd-final"><h2>Your next workflow starts with your hardware.</h2><Link href="/workflows#filters" className="nd-button">Find a workflow →</Link></section>
  </div>;
}

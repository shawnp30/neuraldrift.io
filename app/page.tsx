import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { CATALOG, MEMORY_OPTIONS, WORKFLOW_TESTS, primaryCategory } from '@/lib/catalog';
import { getGuides } from '@/lib/guides';
import WorkflowCard from '@/components/workflows/WorkflowCard';

export const metadata = pageMeta('/', 'Find ComfyUI workflows for your GPU', 'Explore ComfyUI image, video and audio workflows with hardware estimates, model sources, downloads and setup guides.');

export default function HomePage() {
  const guides = getGuides();
  const helpful = guides.filter(g => ['installation', 'model-folders', 'workflow-errors'].includes(g.slug));

  // Curated subsets (3 cards per section) optimized for practical setup, lower complexity, and real execution evidence
  const starter = ['04', '21', '01'].map(id => CATALOG.find(w => w.id === id)!).filter(Boolean); // 04 (SD 1.5 - 4GB, tested), 21 (ESRGAN - 6GB, tested), 01 (Flux Dev - 16GB, tested)
  const executionTested = ['25', '27', '36'].map(id => CATALOG.find(w => w.id === id)!).filter(Boolean); // 25 (SDXL Sketch, tested), 27 (SD 1.5 Inpaint, tested), 36 (SDXL Batch x4, tested)
  const imageGen = ['02', '37', '03'].map(id => CATALOG.find(w => w.id === id)!).filter(Boolean); // 02 (Flux Schnell 8GB), 37 (SDXL Batch x8 - tested), 03 (SDXL Base + Refiner)
  const editingControl = ['23', '26', '31'].map(id => CATALOG.find(w => w.id === id)!).filter(Boolean); // 23 (SDXL img2img - tested), 26 (SDXL Inpainting - tested), 31 (ControlNet Canny - tested)
  const upscaling = ['21', '22'].map(id => CATALOG.find(w => w.id === id)!).filter(Boolean); // 21 (ESRGAN - tested), 22 (Real-ESRGAN Anime - tested)
  const video = ['15', '16', '18'].map(id => CATALOG.find(w => w.id === id)!).filter(Boolean); // 15 (AnimateDiff Walk - tested), 16 (AnimateDiff Particles - tested), 18 (AnimateDiff Rotation - tested)
  const audio = ['43'].map(id => CATALOG.find(w => w.id === id)!).filter(Boolean); // 43 (ACE Step 1.5 - tested)

  return <div className="nd-site">
    {/* 1. Hero + GPU Finder */}
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

    {/* 2. Best Place to Start (Curated Starter Set) */}
    <section className="nd-shell nd-section">
      <div className="nd-section-heading">
        <div>
          <p className="nd-eyebrow">BEST PLACE TO START</p>
          <h2>Beginner-friendly starting points</h2>
        </div>
        <Link className="nd-text-link" href="/workflows">View all {CATALOG.length} workflows →</Link>
      </div>
      <div className="nd-grid">{starter.map(w => <WorkflowCard key={w.id} workflow={w} />)}</div>
    </section>

    {/* 3. Validation Framework (Moved Higher for Early Trust Anchoring) */}
    <section className="nd-shell nd-section">
      <div className="nd-trust">
        <div>
          <p className="nd-eyebrow">VERIFICATION STANDARDS</p>
          <h2>NeuralDrift 5-Level Validation Framework</h2>
          <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.7 }}>
            Unlike indexes that scrape unverified graphs, NeuralDrift evaluates compatibility through a rigorous 5-level hierarchy. {Object.keys(WORKFLOW_TESTS).length} workflows have recorded physical execution tests; the others are marked with conservative catalog estimates.
          </p>
          <div style={{ marginTop: '1.4rem' }}>
            <Link className="nd-text-link" href="/compatibility">How compatibility is reported →</Link>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.9rem' }}>
          {[
            ['LEVEL 1', 'JSON Schema Valid', 'Downloadable JSON is structurally valid with intact node bindings and no syntax corruption.', '#38bdf8'],
            ['LEVEL 2', 'Graph Connectivity Valid', 'Internal links, inputs, and outputs form a complete, cyclic-free execution DAG.', '#38bdf8'],
            ['LEVEL 3', 'Dependencies Identified', 'All models, diffusion weights, VAEs, and custom nodes inventoried with exact filenames.', '#38bdf8'],
            ['LEVEL 4', 'ComfyUI Graph Import', 'Loads into an active ComfyUI environment without red missing-node alerts.', '#34d399'],
            ['LEVEL 5', 'Execution & Semantic Output', 'Completes a physical hardware run, producing an inspectable output artifact.', '#34d399'],
          ].map(([lvl, title, desc, col]) => (
            <div key={lvl} style={{ background: 'rgba(13, 21, 34, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                <span style={{ color: col, fontFamily: 'var(--font-ibm-plex-mono), monospace', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em' }}>{lvl}</span>
                <span style={{ color: '#f8fafc', fontSize: '0.88rem', fontWeight: 600 }}>{title}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* 4. Categorized Workflow Discovery Sections */}
    <section className="nd-shell nd-section">
      <div className="nd-section-heading">
        <div>
          <p className="nd-eyebrow">EXECUTION-TESTED</p>
          <h2>Verified runs on physical hardware</h2>
        </div>
        <Link className="nd-text-link" href="/workflows?evidence=tested">All {Object.keys(WORKFLOW_TESTS).length} tested workflows →</Link>
      </div>
      <div className="nd-grid">{executionTested.map(w => <WorkflowCard key={w.id} workflow={w} />)}</div>
    </section>

    <section className="nd-shell nd-section">
      <div className="nd-section-heading">
        <div>
          <p className="nd-eyebrow">IMAGE GENERATION</p>
          <h2>Core text-to-image architectures</h2>
        </div>
        <Link className="nd-text-link" href="/workflows?category=image-gen">All image generation workflows →</Link>
      </div>
      <div className="nd-grid">{imageGen.map(w => <WorkflowCard key={w.id} workflow={w} />)}</div>
    </section>

    <section className="nd-shell nd-section">
      <div className="nd-section-heading">
        <div>
          <p className="nd-eyebrow">IMAGE EDITING & CONTROL</p>
          <h2>Inpainting, ControlNet, and img2img</h2>
        </div>
        <Link className="nd-text-link" href="/workflows?category=editing-control">All editing & control workflows →</Link>
      </div>
      <div className="nd-grid">{editingControl.map(w => <WorkflowCard key={w.id} workflow={w} />)}</div>
    </section>

    <section className="nd-shell nd-section">
      <div className="nd-section-heading">
        <div>
          <p className="nd-eyebrow">UPSCALING & ENHANCEMENT</p>
          <h2>Detail recovery and resolution scaling</h2>
        </div>
        <Link className="nd-text-link" href="/workflows?category=upscaling">All upscaling workflows →</Link>
      </div>
      <div className="nd-grid">{upscaling.map(w => <WorkflowCard key={w.id} workflow={w} />)}</div>
    </section>

    <section className="nd-shell nd-section">
      <div className="nd-section-heading">
        <div>
          <p className="nd-eyebrow">VIDEO & ANIMATION</p>
          <h2>Generative video and camera motion</h2>
        </div>
        <Link className="nd-text-link" href="/workflows?category=video">All video workflows →</Link>
      </div>
      <div className="nd-grid">{video.map(w => <WorkflowCard key={w.id} workflow={w} />)}</div>
    </section>

    <section className="nd-shell nd-section">
      <div className="nd-section-heading">
        <div>
          <p className="nd-eyebrow">AUDIO & MUSIC</p>
          <h2>Local AI audio synthesis</h2>
        </div>
        <Link className="nd-text-link" href="/workflows?category=audio">All audio workflows →</Link>
      </div>
      <div className="nd-grid">{audio.map(w => <WorkflowCard key={w.id} workflow={w} />)}</div>
    </section>

    {/* 5. Educational Content & First Run Guide */}
    <section className="nd-shell nd-section">
      <p className="nd-eyebrow">YOUR FIRST RUN</p>
      <h2>Choose. Set up. Create.</h2>
      <div className="nd-grid nd-steps">{[
        ['01', 'Choose a workflow', 'Filter by memory, output type, model and difficulty. Review the estimate and dependencies before downloading.', '/workflows', 'Explore the catalog'],
        ['02', 'Install the dependencies', 'Follow the setup guide, get the listed models from their sources, and check any custom nodes.', '/guides/installation', 'Read the installation guide'],
        ['03', 'Run and troubleshoot', 'Load the JSON in ComfyUI. Keep the first run small and use the error guides if a model or node is missing.', '/guides/workflow-errors', 'Find troubleshooting help'],
      ].map(([n, title, copy, href, label]) => <article key={n}><span className="nd-step-number">{n}</span><h3>{title}</h3><p>{copy}</p><Link className="nd-text-link" href={href}>{label} →</Link></article>)}</div>
    </section>

    <section className="nd-shell nd-section">
      <div className="nd-section-heading">
        <div>
          <p className="nd-eyebrow">GET UNSTUCK</p>
          <h2>Keep your setup moving</h2>
        </div>
        <Link href="/guides" className="nd-text-link">All {guides.length} guides →</Link>
      </div>
      <div className="nd-grid">{helpful.map(g => <article key={g.slug} className="nd-card nd-card-body"><h3><Link href={`/guides/${g.slug}`}>{g.title}</Link></h3><p>{g.description}</p><Link href={`/guides/${g.slug}`} className="nd-text-link">Read guide →</Link></article>)}</div>
    </section>

    {/* 6. Final Call to Action */}
    <section className="nd-shell nd-section nd-final">
      <h2>Your next workflow starts with your hardware.</h2>
      <Link href="/workflows#filters" className="nd-button">Find a workflow →</Link>
    </section>
  </div>;
}

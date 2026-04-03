import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowRight,
  Download, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ExternalLink,
  Zap,
  Box,
  Terminal,
  Activity
} from "lucide-react";
import { MOCK_WORKFLOWS } from "@/lib/data/mockWorkflows";
import { WORKFLOWS as LIB_WORKFLOWS } from "@/lib/workflowsData";
import { CLOUD_PROVIDERS } from "@/lib/hardware/registry";
import { getWorkflowMeta } from "@/lib/workflowMeta";
import { DynamicCTA } from "@/components/DynamicCTA";
import DownloadButton from "./DownloadButton";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const libWorkflow = LIB_WORKFLOWS.find((w) => w.id === params.slug);
  const name = libWorkflow?.title || params.slug.replace(/-/g, " ").toUpperCase();
  const desc = libWorkflow?.description || "High-performance ComfyUI workflow architecture.";

  return {
    title: `${name} | ComfyUI Workflow Architecture`,
    description: `${desc} Verified performance on RTX 5080. Download for local use or provision in the Cloud.`,
    openGraph: {
      title: name,
      description: desc,
      type: "website",
      url: `https://neuraldrift.io/workflows/${params.slug}`,
      images: [{ url: `/images/workflows/og/${params.slug}.png`, width: 1200, height: 630 }],
    }
  };
}

export const revalidate = 0;

export default async function WorkflowDetail({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  // Attempt to fetch from Supabase
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("slug", params.slug)
    .single();

  let workflow = data;

  if (error || !workflow) {
    // Fallback to MOCK_WORKFLOWS
    const mockWorkflow = MOCK_WORKFLOWS.find((w) => w.slug === params.slug);
    
    // Fallback to LIB_WORKFLOWS (The core 50 workflows)
    const libWorkflow = LIB_WORKFLOWS.find((w) => w.id === params.slug);

    if (!mockWorkflow && !libWorkflow) {
      notFound();
    }

    if (libWorkflow) {
      const meta = getWorkflowMeta(libWorkflow.id);
      workflow = {
        name: libWorkflow.title,
        slug: libWorkflow.id,
        description: libWorkflow.description,
        tags: libWorkflow.tags,
        preview_image: meta.previewImage || "/images/workflows/thumbs/flux.png",
        download_url: `/workflows/${libWorkflow.id}.json`,
        vram_min: libWorkflow.vram,
        vram_rec: "16GB+",
        nodes: libWorkflow.customNodes.length > 0 ? libWorkflow.customNodes : ["Manager", "Custom-Nodes"],
        complexity: libWorkflow.difficulty === "Advanced" ? "Advanced" : "Standard",
        long_description: libWorkflow.longDescription,
        model: libWorkflow.model || "Flux.1-Dev"
      };
    } else {
      workflow = mockWorkflow;
    }
  }

  // Ensure metadata exists (fallbacks for non-enhanced data)
  const vramMin = workflow.vram_min || "8GB";
  const vramRec = workflow.vram_rec || "12GB+";
  const nodes = workflow.nodes || ["ComfyUI-Manager", "Custom-Nodes-Pack"];
  const complexity = workflow.complexity || "Standard";

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-32 pb-32 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="max-w-3xl">
            <Link href="/workflows" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#7c6af7] transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-12 group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Architecture Library
            </Link>
            
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 bg-white/5 text-zinc-400`}>
                {workflow.complexity} Tier
              </span>
              <span className="text-[#4ade80] font-mono text-[9px] uppercase tracking-[0.2em] flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Hardware Verified V1.02
              </span>
            </div>

            <h1 className="font-syne text-6xl md:text-8xl font-[900] tracking-tighter text-white mb-8 leading-[0.85]">
              {workflow.name}
            </h1>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-1">
             <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Model Engine</span>
             <span className="font-syne text-2xl font-bold text-white text-right">{workflow.model}</span>
          </div>
        </div>

        {/* SEO JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": workflow.name,
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "Linux, Windows",
              "description": workflow.description,
              "offers": { "@type": "Offer", "price": "0" },
              "hardwareRequirements": `Minimum ${workflow.vram_min} VRAM. Recommended ${workflow.vram_rec}.`
            })
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* ── MEDIA PREVIEW ── */}
          <div className="lg:col-span-7">
            <div className="mb-10">
              <div className="flex flex-wrap gap-2 mb-10">
                {workflow.tags?.map((tag: string) => (
                  <span key={tag} className="px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-[800] rounded-full bg-white/5 border border-white/10 text-zinc-400">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xl font-[500] text-zinc-400 leading-relaxed mb-12">
                {workflow.description || workflow.long_description}
              </p>
            </div>

            {/* MEDIA PREVIEW */}
            <div className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/50 shadow-2xl mb-16 relative group aspect-video">
              {workflow.preview_video ? (
                <video
                  src={workflow.preview_video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={workflow.preview_image}
                  alt={workflow.name}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}
            </div>

            {/* IMPLEMENTATION TIMELINE */}
            <div className="mb-20">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h3 className="text-2xl font-[900] text-white flex items-center gap-3 font-syne">
                  <Terminal className="w-6 h-6 text-[#7c6af7]" /> Execution Logic
                </h3>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Verified V1.02</span>
              </div>
              
              <div className="relative pl-8 border-l border-white/5 space-y-12 ml-4">
                {[
                  { step: "01", title: "Environment Sync", desc: "Update ComfyUI to the latest master branch. Legacy builds may cause node errors." },
                  { step: "02", title: "Dependency Injection", desc: `Load JSON and use Manager to install missing custom nodes: ${nodes.join(", ")}.` },
                  { step: "03", title: "Model Checksum", desc: `Ensure ${workflow.model} is loaded in your /models/checkpoints directory.` },
                  { step: "04", title: "Runtime Execution", desc: "Queue prompt. Monitor VRAM spikes during the first KSampler pass." }
                ].map((item) => (
                  <div key={item.step} className="relative group">
                    <div className="absolute -left-12 top-0 w-8 h-8 rounded-full bg-[#0a0a0b] border border-white/10 flex items-center justify-center z-10 group-hover:border-[#7c6af7] transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7c6af7] animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-syne font-bold text-white text-lg mb-1 uppercase tracking-tight">{item.title}</h4>
                      <p className="text-sm font-medium text-[#8888a0] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HARDWARE BENCHMARKS */}
            <div className="mb-20 p-8 rounded-[2.5rem] bg-indigo-500/[0.03] border border-indigo-500/10">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" /> VRAM Benchmarks (Verified)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { res: "1024 × 1024", vram: workflow.vram_min, load: "Standard" },
                  { res: "1536 × 1536", vram: parseFloat(workflow.vram_min) * 1.5 + "GB", load: "High" },
                  { res: "2048 × 2048", vram: parseFloat(workflow.vram_min) * 2.2 + "GB", load: "Extreme" }
                ].map((bench) => (
                  <div key={bench.res} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <p className="font-mono text-[9px] text-zinc-500 uppercase mb-2">{bench.res}</p>
                    <p className="font-syne text-xl font-bold text-white mb-1">{bench.vram}</p>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${bench.load === 'Extreme' ? 'text-rose-500' : 'text-zinc-500'}`}>
                      {bench.load} Load
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: SPECS ───────────────────────────────────── */}
          <div className="lg:col-span-5 h-fit lg:sticky lg:top-32">
            
            {/* ACTION CARD */}
            <div className="bg-[#0f172a]/50 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden mb-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-[900] text-white text-xl">Verified Output</h4>
                    <p className="text-xs font-[700] text-zinc-500 tracking-widest uppercase">Safe & Optimized</p>
                  </div>
                </div>

                <div className="space-y-8 mb-12">
                  <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div className="flex items-center gap-3 text-zinc-400 font-[800] text-xs uppercase tracking-widest">
                      <Cpu className="w-4 h-4 text-indigo-400" /> Min. VRAM
                    </div>
                    <span className="text-white font-mono font-black">{vramMin}</span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div className="flex items-center gap-3 text-zinc-400 font-[800] text-xs uppercase tracking-widest">
                      <Zap className="w-4 h-4 text-amber-400" /> Rec. VRAM
                    </div>
                    <span className="text-white font-mono font-black">{vramRec}</span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div className="flex items-center gap-3 text-zinc-400 font-[800] text-xs uppercase tracking-widest">
                      <Clock className="w-4 h-4 text-emerald-400" /> Latency
                    </div>
                    <span className="text-white font-mono font-black text-xs uppercase tracking-widest">Low-Med</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <DownloadButton
                    downloadUrl={workflow.download_url}
                    workflowName={params.slug}
                  />
                  
                  {(workflow.vram_min === "16GB" || workflow.vram_min === "24GB") && (
                    <a 
                      href={CLOUD_PROVIDERS[0].url}
                      target="_blank"
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:opacity-90 transition-all uppercase tracking-widest shadow-xl shadow-blue-500/20"
                    >
                      <Box className="w-4 h-4" /> Provision on Cloud (RunPod)
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* NODE MANIFEST */}
            <div className="bg-black/20 border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-xs font-black tracking-[0.2em] text-zinc-600 uppercase mb-6 flex items-center justify-between">
                Required Node Suite <span className="text-indigo-500/50">({nodes.length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {nodes.map((node: string, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-xs font-mono text-zinc-400">{node}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500/40" />
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4 text-zinc-500">
                <AlertCircle className="w-5 h-5 opacity-40 shrink-0" />
                <p className="text-[10px] font-[600] uppercase tracking-widest leading-relaxed">
                  Always use the ComfyUI Manager &quot;Install Missing Custom Nodes&quot; feature for first-time use.
                </p>
              </div>
            </div>

            {/* PRO-BUILD REFERRAL */}
            {(workflow.vram_min === "16GB" || workflow.vram_min === "24GB") && (
               <div className="mt-8 p-8 rounded-[2.5rem] bg-amber-500/[0.03] border border-amber-500/10">
                 <p className="font-mono text-[10px] text-amber-500 uppercase tracking-widest mb-4">Hardware Authority</p>
                 <h4 className="font-syne text-lg font-black text-white mb-3 tracking-tight">Need a Machine for this?</h4>
                 <p className="text-xs text-[#8888a0] leading-relaxed mb-6">
                   This workflow is optimized for professional-grade workstations. Explore verified 5090 builds on ComputeAtlas.
                 </p>
                 <a 
                   href="https://computeatlas.ai"
                   target="_blank"
                   className="inline-flex items-center gap-2 text-[10px] font-black text-white hover:text-amber-400 transition-colors uppercase tracking-[0.2em]"
                 >
                   EXPLORE PRO BUILDS <ArrowRight className="w-3.5 h-3.5" />
                 </a>
               </div>
            )}
          </div>
        </div>

        {/* CTA FOOTER */}
        <div className="mt-32 space-y-8">
          {/* Featured Tutorial if exists */}
          {LIB_WORKFLOWS.find(w => w.id === params.slug)?.tutorialSlug && (
             <div className="p-1 pb-1.5 rounded-[2.5rem] bg-gradient-to-r from-[#7c6af7] to-[#22d3ee]">
               <Link 
                 href={`/guides/${LIB_WORKFLOWS.find(w => w.id === params.slug)?.tutorialSlug}`}
                 className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 rounded-[2.4rem] bg-[#0a0a0b] hover:bg-transparent transition-all group"
               >
                 <div>
                   <p className="font-mono text-[10px] text-[#7c6af7] uppercase tracking-[0.3em] mb-4 group-hover:text-white transition-colors">Integration Guide</p>
                   <h3 className="font-syne text-3xl font-black text-white leading-tight">
                     Master this workflow with our <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c6af7] to-[#22d3ee]">Deep-Dive Masterclass.</span>
                   </h3>
                 </div>
                 <div className="flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold group-hover:bg-white group-hover:text-black transition-all">
                   READ GUIDE <ArrowRight className="w-5 h-5" />
                 </div>
               </Link>
             </div>
          )}

          <div className="pt-12 border-t border-white/5">
            <DynamicCTA 
              title="Hardware Limit Reached?"
              description="If your current GPU architecture is hitting OOM (Out of Memory) errors with this workflow, visit our Setup Rater for optimization protocols."
              ctaText="RATE MY SETUP"
              ctaHref="/hardware"
              variant="amber"
              tag="// Rig Optimization"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

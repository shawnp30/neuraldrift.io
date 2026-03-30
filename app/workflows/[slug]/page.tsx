import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  Download, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ExternalLink,
  Zap
} from "lucide-react";
import { MOCK_WORKFLOWS } from "@/lib/data/mockWorkflows";
import { DynamicCTA } from "@/components/DynamicCTA";
import DownloadButton from "./DownloadButton";

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
    if (!mockWorkflow) {
      notFound();
    }
    workflow = mockWorkflow;
  }

  // Ensure metadata exists (fallbacks for non-enhanced data)
  const vramMin = workflow.vram_min || "8GB";
  const vramRec = workflow.vram_rec || "12GB+";
  const nodes = workflow.nodes || ["ComfyUI-Manager", "Custom-Nodes-Pack"];
  const complexity = workflow.complexity || "Standard";

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-32 pb-32 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        <Link href="/workflows" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-[800] uppercase tracking-widest mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Architecture Library
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* ── MEDIA PREVIEW ── */}
          <div className="lg:col-span-7">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border 
                  ${complexity === "Enterprise" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : 
                    complexity === "Advanced" ? "bg-violet-500/10 border-violet-500/20 text-violet-400" : 
                    "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}
                `}>
                  {complexity} Tier
                </span>
                <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">// V1.02 Verified</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-[900] tracking-tight text-white mb-8 leading-[1.1]">
                {workflow.name}
              </h1>

              <div className="flex flex-wrap gap-2 mb-10">
                {workflow.tags?.map((tag: string) => (
                  <span key={tag} className="px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-[800] rounded-full bg-white/5 border border-white/10 text-zinc-400">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xl font-[500] text-zinc-400 leading-relaxed mb-12">
                {workflow.description}
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

            {/* HOW TO RUN */}
            <div className="mb-20">
              <h3 className="text-2xl font-[900] text-white mb-8 flex items-center gap-3 font-syne">
                <Layers className="w-6 h-6 text-indigo-400" /> Implementation Logic
              </h3>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Environment Sync", desc: "Ensure your ComfyUI environment is updated to the latest portable or standalone release." },
                  { step: "02", title: "Node Dependency", desc: `Install missing nodes via Manager. This workflow requires: ${nodes.join(", ")}.` },
                  { step: "03", title: "Weight Loading", desc: "Download the base models highlighted in the notes group within the JSON architecture." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                    <span className="text-3xl font-black text-white/10 group-hover:text-indigo-500/30 transition-colors font-mono">{item.step}</span>
                    <div>
                      <h4 className="font-[800] text-white text-lg mb-1">{item.title}</h4>
                      <p className="text-sm font-[500] text-zinc-500 leading-relaxed">{item.desc}</p>
                    </div>
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

                <DownloadButton
                  downloadUrl={workflow.download_url}
                  workflowName={params.slug}
                />
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
          </div>
        </div>

        {/* CTA FOOTER */}
        <div className="mt-32 border-t border-white/5 pt-20">
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
  );
}

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck } from "lucide-react";
import { MOCK_WORKFLOWS } from "@/lib/data/mockWorkflows";

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

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-32 pb-32">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        
        <Link href="/workflows" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-[800] uppercase tracking-widest mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </Link>

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-[900] tracking-tight text-white mb-6">
            {workflow.name}
          </h1>
          <div className="flex flex-wrap gap-2 mb-8">
            {workflow.tags?.map((tag: string) => (
              <span key={tag} className="px-3 py-1 text-xs uppercase tracking-widest font-[800] rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-lg font-[500] text-zinc-300 leading-relaxed max-w-3xl">
            {workflow.description}
          </p>
        </div>

        {/* MEDIA PREVIEW */}
        <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/50 shadow-2xl mb-12 relative group">
          {workflow.preview_video ? (
            <video
              src={workflow.preview_video}
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full h-auto aspect-video object-cover"
            />
          ) : (
            <div className="aspect-[16/9] w-full relative">
              <Image
                src={workflow.preview_image}
                alt={workflow.name}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* DOWNLOAD ACTION */}
        <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-[#0f172a]/80 border border-white/5 rounded-3xl backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-6 md:mb-0">
            <div className="p-3 bg-green-500/20 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h4 className="font-[800] text-white">Verified Architecture</h4>
              <p className="text-sm font-[500] text-zinc-400">Tested natively in ComfyUI. No malicious nodes.</p>
            </div>
          </div>
          
          <a
            href={workflow.download_url}
            download
            className="w-full md:w-auto px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-[800] rounded-xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 transform hover:-translate-y-1"
          >
            <Download className="w-5 h-5" /> Download .JSON
          </a>
        </div>

      </div>
    </div>
  );
}

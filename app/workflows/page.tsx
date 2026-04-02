import { Metadata } from "next";
import { getWorkflowTree } from "@/lib/github";
import WorkflowExplorer from "@/components/workflows/WorkflowExplorer";
import EngineRoomAssistant from "@/components/workflows/EngineRoomAssistant";
import { DynamicCTA } from "@/components/DynamicCTA";

export const metadata: Metadata = {
  title: "ComfyUI Workflows | NeuralDrift",
  description: "Browse 50+ free ComfyUI workflows for Stable Diffusion, Flux, LTX Video, ACE-Step and more",
};

// Revalidate every hour to stay within GitHub API rate limits
export const revalidate = 3600;

export default async function WorkflowsPage() {
  const workflowTree = await getWorkflowTree();

  return (
    <div className="min-h-screen bg-[#030712] pb-32 pt-32 text-slate-50">
      {/* HEADER */}
      <div className="mx-auto mb-16 max-w-7xl px-6 text-center lg:px-12">
        <p className="mb-4 text-xs font-[800] uppercase tracking-widest text-indigo-400">
          Architecture Library
        </p>
        <h1 className="mb-6 text-4xl font-[900] tracking-tight text-white drop-shadow-xl md:text-5xl lg:text-7xl">
          Dynamic{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Workflows.
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm font-[500] leading-relaxed text-zinc-300 md:text-base">
          Synced directly with our GitHub repository. Browse the folder
          structure, verify optimizations, and download JSON files directly into
          your local ComfyUI environment.
        </p>
      </div>

      {/* EXPLORER */}
      <WorkflowExplorer initialTree={workflowTree} />

      {/* CTA SECTION */}
      <div className="mx-auto mb-32 mt-32 max-w-7xl px-6 lg:px-12">
        <DynamicCTA
          title="Is Your Hardware Ready for These Workflows?"
          description="High-end workflows require optimized VRAM management. Use our Setup Rater to see exactly how your GPU stacks up against the latest model architectures."
          ctaText="RATE MY SETUP"
          ctaHref="/hardware"
          variant="amber"
          tag="// Rig Verification"
        />
      </div>

      {/* AI CONCIERGE */}
      <EngineRoomAssistant />
    </div>
  );
}

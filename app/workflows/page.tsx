import { getWorkflowTree } from "@/lib/github";
import WorkflowExplorer from "@/components/workflows/WorkflowExplorer";
import EngineRoomAssistant from "@/components/workflows/EngineRoomAssistant";

// Revalidate every hour to stay within GitHub API rate limits
export const revalidate = 3600;

export default async function WorkflowsPage() {
  const workflowTree = await getWorkflowTree();

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-32 pb-32">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-16 text-center">
        <p className="text-indigo-400 font-[800] text-xs tracking-widest uppercase mb-4">Architecture Library</p>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-[900] tracking-tight text-white mb-6 drop-shadow-xl">
          Dynamic <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Workflows.</span>
        </h1>
        <p className="text-sm md:text-base font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Synced directly with our GitHub repository. Browse the folder structure, verify optimizations, and download JSON files directly into your local ComfyUI environment.
        </p>
      </div>

      {/* EXPLORER */}
      <WorkflowExplorer initialTree={workflowTree} />

      {/* AI CONCIERGE */}
      <EngineRoomAssistant />
      
    </div>
  );
}

import WorkflowPreview, { WorkflowMetadata } from "@/app/(components)/WorkflowPreview";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Ensure fresh data from Supabase

import { MOCK_WORKFLOWS } from "@/lib/data/mockWorkflows";

export default async function WorkflowsPage() {
  const supabase = createClient();
  
  // Fetch real workflows from Supabase DB
  const { data: workflows, error } = await supabase
    .from("workflows")
    .select("*")
    .order("created_at", { ascending: false });

  const displayWorkflows = workflows && workflows.length > 0 ? workflows : MOCK_WORKFLOWS;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-32 pb-32">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-16 text-center">
        <p className="text-indigo-400 font-[800] text-xs tracking-widest uppercase mb-4">Architecture Library</p>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-[900] tracking-tight text-white mb-6 drop-shadow-xl">
          Pre-built <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Workflows.</span>
        </h1>
        <p className="text-sm md:text-base font-[500] text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          See exactly what a workflow does before you download it. Browse high-quality generated samples, verify custom nodes, and effortlessly load the JSON directly into ComfyUI.
        </p>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayWorkflows.map((w: WorkflowMetadata) => (
          <WorkflowPreview key={w.id} workflow={w} />
        ))}
      </div>
      
    </div>
  );
}

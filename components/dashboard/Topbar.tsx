"use client";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/jobs": "Job Queue",
  "/dashboard/models": "Models",
  "/dashboard/gpu": "GPU Monitor",
  "/dashboard/compute": "ComputeAtlas",
  "/dashboard/settings": "Settings",
};

export function Topbar() {
  const path = usePathname();
  const title = TITLES[path] || "Dashboard";

  return (
    <header className="h-[52px] flex-shrink-0 bg-sidebar border-b border-border flex items-center justify-between px-6">
      <div>
        <div className="font-syne font-bold text-sm text-white tracking-tight">{title}</div>
        <div className="font-mono text-xs text-muted tracking-wider">NeuralHub.ai / workspace / {title.toLowerCase()}</div>
      </div>
      <div className="flex items-center gap-3">
        <button className="bg-accent/8 border border-accent/20 text-accent px-4 py-1.5 rounded font-mono text-xs tracking-wider hover:bg-accent/14 transition-colors">
          + New Job
        </button>
        <button className="w-8 h-8 bg-surface border border-border rounded-md flex items-center justify-center text-sm relative hover:border-accent/30 transition-colors">
          🔔
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent-orange rounded-full border border-sidebar" />
        </button>
      </div>
    </header>
  );
}

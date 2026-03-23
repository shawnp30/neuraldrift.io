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
    <header className="bg-sidebar flex h-[52px] flex-shrink-0 items-center justify-between border-b border-border px-6">
      <div>
        <div className="font-syne text-sm font-bold tracking-tight text-white">
          {title}
        </div>
        <div className="font-mono text-xs tracking-wider text-muted">
          neuraldrift / workspace / {title.toLowerCase()}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="bg-accent/8 hover:bg-accent/14 rounded border border-accent/20 px-4 py-1.5 font-mono text-xs tracking-wider text-accent transition-colors">
          + New Job
        </button>
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-sm transition-colors hover:border-accent/30">
          🔔
          <span className="border-sidebar absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border bg-accent-orange" />
        </button>
      </div>
    </header>
  );
}

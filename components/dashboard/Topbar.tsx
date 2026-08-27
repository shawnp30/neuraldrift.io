"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  const router = useRouter();
  const title = TITLES[path] || "Dashboard";
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

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
        {email && (
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <span className="font-mono text-xs text-muted max-w-[160px] truncate" title={email}>
              {email}
            </span>
            <button
              onClick={handleSignOut}
              className="rounded border border-border bg-surface px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent/30 hover:text-accent"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

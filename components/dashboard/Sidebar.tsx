"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils/cn";

const WORKSPACE = [
  { href: "/dashboard", icon: "⚡", label: "Dashboard" },
  { href: "/dashboard/jobs", icon: "🔧", label: "Job Queue", badge: "3" },
  { href: "/dashboard/models", icon: "🧠", label: "Models" },
  { href: "/datasets", icon: "📦", label: "Datasets" },
  { href: "/workflows", icon: "⚙️", label: "Pipelines" },
];
const LIBRARY = [
  { href: "/loras", icon: "🔁", label: "LoRA Library" },
  { href: "/workflows", icon: "📋", label: "Workflows" },
  { href: "/guides", icon: "📖", label: "Guides" },
  { href: "/tools", icon: "🛠️", label: "Tools" },
];
const COMPUTE = [
  { href: "/dashboard/gpu", icon: "🖥️", label: "GPU Monitor" },
  { href: "https://computeatlas.ai", icon: "☁️", label: "ComputeAtlas" },
];

export function Sidebar() {
  const path = usePathname();
  const isActive = (href: string) => path === href;

  return (
    <aside className="w-[220px] flex-shrink-0 bg-sidebar border-r border-border flex flex-col overflow-y-auto">
      <div className="p-5 pb-4 border-b border-border flex-shrink-0">
        <Logo size="sm" />
      </div>
      <SectionLabel>Workspace</SectionLabel>
      {WORKSPACE.map((item) => <NavItem key={item.href} {...item} active={isActive(item.href)} />)}
      <SectionLabel>Library</SectionLabel>
      {LIBRARY.map((item) => <NavItem key={item.href} {...item} active={isActive(item.href)} />)}
      <SectionLabel>Compute</SectionLabel>
      {COMPUTE.map((item) => <NavItem key={item.href} {...item} active={isActive(item.href)} />)}
      <div className="mt-auto p-4 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">N</div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-text truncate">Neo</div>
            <div className="font-mono text-xs text-accent tracking-wider">PRO PLAN</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-5 pt-5 pb-2 font-mono text-[0.55rem] text-muted tracking-widest uppercase">{children}</p>;
}

function NavItem({ href, icon, label, badge, active }: { href: string; icon: string; label: string; badge?: string; active?: boolean }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-md mx-2 text-sm transition-colors", active ? "bg-accent/8 text-accent border border-accent/12" : "text-muted2 hover:bg-white/4 hover:text-text")}>
      <span className="w-4 text-center text-sm">{icon}</span>
      <span>{label}</span>
      {badge && <span className="ml-auto bg-accent-purple text-white font-mono text-xs px-1.5 py-0.5 rounded-full">{badge}</span>}
    </Link>
  );
}

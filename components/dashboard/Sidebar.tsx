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
  { href: "/models", icon: "🧠", label: "Model Hub" },
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
    <aside className="bg-sidebar flex w-[220px] flex-shrink-0 flex-col overflow-y-auto border-r border-border">
      <div className="flex-shrink-0 border-b border-border p-5 pb-4">
        <Logo size="sm" />
      </div>
      <SectionLabel>Workspace</SectionLabel>
      {WORKSPACE.map((item) => (
        <NavItem key={item.href} {...item} active={isActive(item.href)} />
      ))}
      <SectionLabel>Library</SectionLabel>
      {LIBRARY.map((item) => (
        <NavItem key={item.href} {...item} active={isActive(item.href)} />
      ))}
      <SectionLabel>Compute</SectionLabel>
      {COMPUTE.map((item) => (
        <NavItem key={item.href} {...item} active={isActive(item.href)} />
      ))}
      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent text-xs font-bold text-white">
            N
          </div>
          <div className="overflow-hidden">
            <div className="text-text truncate text-sm font-semibold">Neo</div>
            <div className="font-mono text-xs tracking-wider text-accent">
              PRO PLAN
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-5 pb-2 pt-5 font-mono text-[0.55rem] uppercase tracking-widest text-muted">
      {children}
    </p>
  );
}

function NavItem({
  href,
  icon,
  label,
  badge,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  badge?: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "mx-2 flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-accent/8 border-accent/12 border text-accent"
          : "text-muted2 hover:bg-white/4 hover:text-text"
      )}
    >
      <span className="w-4 text-center text-sm">{icon}</span>
      <span>{label}</span>
      {badge && (
        <span className="ml-auto rounded-full bg-accent-purple px-1.5 py-0.5 font-mono text-xs text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "Tools" };

const TOOLS = [
  { href: "/tools/vram-calculator", icon: "🖥️", title: "VRAM Calculator", desc: "Estimate VRAM needs for any model + batch size combo." },
  { href: "/tools/caption-generator", icon: "💬", title: "Caption Generator", desc: "Auto-caption datasets using WD14, BLIP2, or LLaVA." },
  { href: "/tools/benchmark-lookup", icon: "⚡", title: "Benchmark Lookup", desc: "GPU inference benchmarks across popular AI models." },
];

export default function ToolsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-10 max-w-7xl mx-auto">
        <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Tools</p>
        <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-4">Builder Utilities.</h1>
        <p className="text-muted max-w-lg leading-relaxed mb-16">Free tools for AI builders — VRAM calculators, captioning, benchmarks.</p>
        <div className="grid grid-cols-3 gap-5">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} className="bg-card border border-border rounded-lg p-8 block hover:-translate-y-1 hover:border-accent/30 transition-all duration-200">
              <span className="text-3xl block mb-4">{t.icon}</span>
              <h3 className="font-syne text-base font-bold text-white mb-2">{t.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{t.desc}</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

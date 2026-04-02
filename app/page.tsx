import React from "react";
import Link from "next/link";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import HeroBackground from "@/components/home/HeroBackground";
import { WORKFLOWS } from "@/lib/workflowsData";
import { ArrowRight, BookOpen, Cpu, Wrench } from "lucide-react";

// Types
interface GuideMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  tag: string;
  difficulty: string;
}

// Data fetching for guides
async function getLatestGuides(): Promise<GuideMeta[]> {
  try {
    const guidesDir = join(process.cwd(), "content/guides");
    const files = readdirSync(guidesDir).filter(f => f.endsWith(".mdx"));
    
    const guides = files.map(filename => {
      const filePath = join(guidesDir, filename);
      const fileContent = readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);
      return {
        slug: filename.replace(".mdx", ""),
        title: data.title || "Untitled Guide",
        description: data.description || "",
        publishedAt: data.publishedAt || "2024-01-01",
        tag: data.tag || "Guide",
        difficulty: data.difficulty || "Beginner",
      };
    });

    return guides
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 3);
  } catch (error) {
    console.error("Error fetching guides:", error);
    return [];
  }
}

export default async function HomePage() {
  const latestGuides = await getLatestGuides();
  const latestWorkflows = WORKFLOWS.filter(w => w.featured).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e8f0] font-sans selection:bg-[#7c6af7]/30">
      
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6 overflow-hidden border-b border-[#2a2a30]">
        <HeroBackground />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c6af7]/10 border border-[#7c6af7]/20 mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-[#7c6af7] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-[#7c6af7]">New FLUX Workflows Added</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] animate-fade-up">
            The ComfyUI Resource <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c6af7] to-[#22d3ee]">for Builders</span>
          </h1>
          
          <p className="text-[#8888a0] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up [animation-delay:200ms]">
            Workflows, guides, and tools for AI image and video generation — 
            <span className="text-[#e8e8f0]"> free and open</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up [animation-delay:400ms]">
            <Link 
              href="/workflows" 
              className="w-full sm:w-auto px-8 py-4 bg-[#7c6af7] hover:bg-[#6b55e6] text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#7c6af7]/20"
            >
              Browse Workflows
            </Link>
            <Link 
              href="/guides" 
              className="w-full sm:w-auto px-8 py-4 bg-[#111113] hover:bg-[#1a1a1e] border border-[#2a2a30] text-[#e8e8f0] font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Read Guides
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE CARDS ROW ═══ */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Wrench className="w-5 h-5 text-[#7c6af7]" />}
            title="Workflows"
            desc="50+ ready to run ComfyUI workflows"
            href="/workflows"
          />
          <FeatureCard 
            icon={<BookOpen className="w-5 h-5 text-[#22d3ee]" />}
            title="Guides"
            desc="Step by step tutorials from real setups"
            href="/guides"
          />
          <FeatureCard 
            icon={<Cpu className="w-5 h-5 text-[#4ade80]" />}
            title="Tools"
            desc="VRAM calculator, benchmark lookup, and more"
            href="/tools"
          />
        </div>
      </section>

      {/* ═══ LATEST GUIDES SECTION ═══ */}
      <section className="py-24 px-6 bg-[#0c0c0d]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7c6af7] font-bold mb-3">{"// Knowledge Base"}</p>
              <h2 className="text-4xl font-bold">Latest Guides</h2>
            </div>
            <Link href="/guides" className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#8888a0] hover:text-[#7c6af7] transition-colors group">
              View all guides <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestGuides.map((guide) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group h-full">
                <article className="flex flex-col h-full bg-[#111113] border border-[#2a2a30] rounded-2xl p-6 hover:border-[#7c6af7]/30 transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 rounded bg-[#7c6af7]/10 text-[#7c6af7] font-mono text-[10px] font-bold uppercase tracking-wider border border-[#7c6af7]/20">
                      {guide.tag}
                    </span>
                    <span className="text-[#8888a0] font-mono text-[10px]">
                      {guide.publishedAt}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#e8e8f0] mb-3 group-hover:text-[#7c6af7] transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-[#8888a0] text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                    {guide.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2a2a30]/50 text-[10px] font-mono uppercase tracking-[0.1em] text-[#8888a0]">
                    <span>Level: {guide.difficulty}</span>
                    <span className="text-[#7c6af7]">Read →</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          <Link href="/guides" className="flex sm:hidden items-center justify-center gap-2 mt-8 py-4 bg-[#111113] border border-[#2a2a30] rounded-xl text-sm font-bold text-[#e8e8f0]">
            View all guides <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══ LATEST WORKFLOWS SECTION ═══ */}
      <section className="py-24 px-6 border-b border-[#2a2a30]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#22d3ee] font-bold mb-3">{"// Production-Ready"}</p>
              <h2 className="text-4xl font-bold">Featured Workflows</h2>
            </div>
            <Link href="/workflows" className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#8888a0] hover:text-[#22d3ee] transition-colors group">
              View all workflows <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestWorkflows.map((wf) => (
              <Link key={wf.id} href={`/workflows/${wf.id}`} className="group h-full">
                <article className="flex flex-col h-full bg-[#111113] border border-[#2a2a30] rounded-2xl p-6 hover:border-[#22d3ee]/30 transition-all hover:bg-[#0a0a0b]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-2 rounded-lg bg-[#0a0a0b] border border-[#2a2a30]">
                      <WorkflowIcon category={wf.category} />
                    </span>
                    <div className="flex gap-2">
                       <span className="px-2 py-0.5 rounded-full bg-[#22d3ee]/10 text-[#22d3ee] font-mono text-[9px] font-bold border border-[#22d3ee]/20">
                         {wf.vram}
                       </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#e8e8f0] mb-2 group-hover:text-[#22d3ee] transition-colors">
                    {wf.title}
                  </h3>
                  <p className="text-[#8888a0] text-sm leading-relaxed mb-4 line-clamp-2">
                    {wf.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#2a2a30]/50">
                    <div className="flex gap-1">
                      {wf.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[#8888a0] font-mono text-[9px]">#{tag}</span>
                      ))}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#22d3ee] opacity-0 group-hover:opacity-100 transition-opacity">
                      Download →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          <Link href="/workflows" className="flex sm:hidden items-center justify-center gap-2 mt-8 py-4 bg-[#111113] border border-[#2a2a30] rounded-xl text-sm font-bold text-[#e8e8f0]">
            View all workflows <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══ COMPUTEATLAS PARTNER SECTION ═══ */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#1a0f30] to-[#0a0a0b]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c6af7]/10 border border-[#7c6af7]/20 mb-6">
            <span className="text-[9px] uppercase tracking-[0.2em] font-mono font-bold text-[#7c6af7]">Official Hardware Partner</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Find Your Perfect AI GPU</h2>
          <p className="text-[#8888a0] text-lg leading-relaxed mb-10">
            Wondering if your card can handle these workflows? Check 
            <a href="https://computeatlas.ai" target="_blank" rel="noopener noreferrer" className="text-[#e8e8f0] hover:text-[#7c6af7] underline decoration-[#7c6af7]/30 ml-2">ComputeAtlas.ai</a> 
            for deep GPU analytics, VRAM benchmarks, and procurement guides.
          </p>
          <a 
            href="https://computeatlas.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#7c6af7] hover:bg-[#6b55e6] text-white font-bold rounded-xl transition-all hover:scale-[1.02]"
          >
            Visit ComputeAtlas <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
      
      {/* Footer link to keep current fonts accessible */}
      <style dangerouslySetInnerHTML={{ __html: `
        @font-face {
          font-family: 'Berkeley Mono';
          src: local('Berkeley Mono'), local('Fira Code');
        }
        .font-mono { font-family: var(--font-ibm-plex-mono), 'Berkeley Mono', 'Fira Code', monospace; }
        .font-sans { font-family: var(--font-dm-sans), sans-serif; }
      `}} />
    </div>
  );
}

// Subcomponents
function FeatureCard({ icon, title, desc, href }: { icon: React.ReactNode, title: string, desc: string, href: string }) {
  return (
    <Link href={href} className="group">
      <div className="bg-[#111113] border border-[#2a2a30] rounded-2xl p-8 hover:border-[#7c6af7]/20 transition-all hover:-translate-y-1">
        <div className="w-10 h-10 rounded-xl bg-[#0a0a0b] border border-[#2a2a30] flex items-center justify-center mb-6 group-hover:bg-[#7c6af7]/5 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-[#e8e8f0] mb-2">{title}</h3>
        <p className="text-[#8888a0] text-sm leading-relaxed">{desc}</p>
      </div>
    </Link>
  );
}

function WorkflowIcon({ category }: { category: string }) {
  switch (category) {
    case "image": return <span className="text-sm">🖼️</span>;
    case "video": return <span className="text-sm">🎬</span>;
    case "enhance": return <span className="text-sm">⚡</span>;
    case "controlnet": return <span className="text-sm">🧬</span>;
    case "lora": return <span className="text-sm">🏗️</span>;
    case "specialty": return <span className="text-sm">🔮</span>;
    default: return <span className="text-sm">🛠️</span>;
  }
}

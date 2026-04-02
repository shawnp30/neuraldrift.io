import { Metadata } from "next";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Clock, 
  Tag, 
  ChevronRight, 
  ExternalLink, 
  User, 
  Calendar,
  Layers
} from "lucide-react";

// --- STYLES & COMPONENTS ---

const MDXComponents = {
  h1: (props: any) => (
    <h1 className="font-syne text-4xl md:text-5xl font-black text-white mb-8 leading-tight tracking-tight mt-12" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="font-syne text-2xl md:text-3xl font-bold text-white mb-6 mt-16 pb-3 border-b border-[#2a2a30]" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="font-syne text-xl font-bold text-white mb-4 mt-10" {...props} />
  ),
  p: (props: any) => (
    <p className="text-[18px] leading-[1.8] text-[#e8e8f0] mb-6 font-normal" {...props} />
  ),
  ul: (props: any) => (
    <ul className="list-none space-y-3 mb-8 ml-2" {...props} />
  ),
  ol: (props: any) => (
    <ol className="list-decimal space-y-3 mb-8 ml-6 text-[#e8e8f0]" {...props} />
  ),
  li: (props: any) => (
    <li className="flex gap-3 text-[17px] leading-relaxed text-[#e8e8f0]">
      <span className="text-[#7c6af7] mt-1.5 flex-shrink-0">•</span>
      <span {...props} />
    </li>
  ),
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-[#7c6af7] bg-[#7c6af7]/5 px-6 py-4 rounded-r-xl italic my-8 text-[#8888a0]" {...props} />
  ),
  pre: (props: any) => (
    <div className="relative my-10 group">
      <div className="absolute -top-3 left-4 px-2 py-1 bg-[#1e1e1e] border border-[#2a2a30] rounded font-mono text-[10px] text-[#8888a0] z-10 uppercase tracking-widest ">
        Code Block
      </div>
      <pre className="p-6 pt-8 rounded-2xl bg-[#1e1e1e] border border-[#2a2a30] overflow-x-auto font-mono text-[14px] leading-relaxed shadow-xl" {...props} />
    </div>
  ),
  code: (props: any) => (
    <code className="bg-[#2a2a30] text-[#22d3ee] px-1.5 py-0.5 rounded font-mono text-[0.9em]" {...props} />
  ),
  img: (props: any) => (
    <figure className="my-12">
      <img className="w-full rounded-3xl border border-[#2a2a30] shadow-2xl" alt={props.alt || "NeuralDrift Guide Image"} {...props} />
      {props.alt && (
        <figcaption className="text-center text-sm text-[#8888a0] mt-4 font-normal italic">
          {props.alt}
        </figcaption>
      )}
    </figure>
  ),
  table: (props: any) => (
    <div className="my-10 overflow-x-auto rounded-xl border border-[#2a2a30] bg-[#111113]">
      <table className="w-full text-left border-collapse" {...props} />
    </div>
  ),
  th: (props: any) => (
    <th className="p-4 border-b border-[#2a2a30] font-mono text-[11px] uppercase tracking-widest text-[#7c6af7] bg-white/[0.02]" {...props} />
  ),
  td: (props: any) => (
    <td className="p-4 border-b border-[#2a2a30] text-[15px] text-[#e8e8f0]" {...props} />
  ),
  hr: () => <hr className="my-16 border-[#2a2a30]" />,
  a: (props: any) => (
    <a {...props} className="text-[#22d3ee] hover:text-[#7c6af7] underline underline-offset-4 transition-colors" />
  ),
};

// --- DATA HELPERS ---

function getHeadings(content: string) {
  const lines = content.split('\n');
  return lines
    .filter(line => line.match(/^##\s/))
    .map(line => {
      const text = line.replace(/^##\s/, '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return { text, id };
    });
}

// --- MAIN PAGE COMPONENT ---

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const filePath = join(process.cwd(), "content/guides", `${params.slug}.mdx`);
  if (!existsSync(filePath)) return { title: "404 | NeuralDrift" };
  
  const raw = readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  
  return {
    title: `${data.title} | NeuralDrift`,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      type: "article",
    }
  };
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const filePath = join(process.cwd(), "content/guides", `${params.slug}.mdx`);

  if (!existsSync(filePath)) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl text-white font-black mb-4">Guide Not Found</h1>
        <Link href="/guides" className="text-[#7c6af7] hover:underline">← Back to Guides</Link>
      </div>
    );
  }

  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const headings = getHeadings(content);

  // Split content to insert ad after first section
  const contentParts = content.split(/^##\s/m);
  const firstPart = contentParts[0];
  const restPart = contentParts.slice(1).map(p => `## ${p}`).join('\n');

  return (
    <div className="bg-[#0a0a0b] min-h-screen text-[#e8e8f0]">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#7c6af7_0%,transparent_50%)]" />

      <main className="relative pt-20 pb-32">
        {/* Article Header */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
          <div className="max-w-[720px] mx-auto">
            <Link href="/guides" className="inline-flex items-center gap-2 text-[#8888a0] hover:text-white transition-colors text-xs font-mono uppercase tracking-widest mb-8">
              ← Guides / Library
            </Link>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-full bg-[#7c6af7]/10 text-[#7c6af7] border border-[#7c6af7]/20 text-[10px] font-mono tracking-widest uppercase">
                {data.tag}
              </span>
              <div className="flex items-center gap-1.5 text-[#8888a0] text-xs font-mono">
                <Clock className="w-3 h-3" /> {data.readTime}
              </div>
              <div className="flex items-center gap-1.5 text-[#8888a0] text-xs font-mono">
                <Calendar className="w-3 h-3" /> {data.publishedAt}
              </div>
            </div>

            <h1 className="font-syne text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-8">
              {data.title}
            </h1>
            
            <p className="text-xl text-[#8888a0] leading-relaxed font-normal">
              {data.description}
            </p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-[1fr_280px] gap-16 items-start">
            
            {/* Main Article */}
            <article className="max-w-[720px] mx-auto w-full">
              {/* First Part */}
              <div className="mdx-content">
                <MDXRemote 
                    source={firstPart} 
                    components={MDXComponents} 
                    options={{ mdxOptions: { remarkPlugins: [], rehypePlugins: [rehypeHighlight, rehypeSlug] } }} 
                />
              </div>

              {/* ComputeAtlas Ad 1 */}
              <div className="my-16 bg-gradient-to-br from-[#7c6af7]/10 via-[#111113] to-[#111113] border border-[#7c6af7]/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="font-syne text-xl font-bold text-white mb-2">Build a Faster Rig</h4>
                  <p className="text-sm text-[#8888a0]">Don&apos;t let hardware slow you down. Find the best price for your next GPU architecture.</p>
                </div>
                <a href="https://computeatlas.ai" target="_blank" className="bg-[#7c6af7] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex-shrink-0">
                  Compare Deals →
                </a>
              </div>

              {/* Remaining Part */}
              <div className="mdx-content">
                 <MDXRemote 
                    source={restPart} 
                    components={MDXComponents} 
                    options={{ mdxOptions: { remarkPlugins: [], rehypePlugins: [rehypeHighlight, rehypeSlug] } }} 
                />
              </div>

              {/* Author Section */}
              <div className="mt-24 pt-12 border-t border-[#2a2a30]">
                <div className="flex items-center gap-6 p-8 bg-[#111113] rounded-3xl border border-[#2a2a30]">
                  <div className="w-16 h-16 rounded-2xl bg-[#7c6af7]/10 flex items-center justify-center text-[#7c6af7]">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8888a0] mb-1">Article By</p>
                    <h5 className="font-syne text-xl font-bold text-white mb-1">NeuralDrift Engineering</h5>
                    <p className="text-sm text-[#8888a0]">Specializing in high-performance local AI deployment and ComfyUI optimization patterns.</p>
                  </div>
                </div>
              </div>

              {/* ComputeAtlas Ad 2 */}
              <div className="mt-12 bg-[#111113] border border-[#2a2a30] rounded-3xl p-8 text-center bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#0a0a0b]/80 group-hover:bg-[#0a0a0b]/70 transition-colors" />
                <div className="relative">
                  <h4 className="font-syne text-2xl font-bold text-white mb-4">Master Your Hardware</h4>
                  <p className="text-[#8888a0] mb-8 max-w-md mx-auto">Access the direct ComputeAtlas library of GPU benchmarks and recommendations.</p>
                  <a href="https://computeatlas.ai" target="_blank" className="inline-block bg-[#22d3ee] text-black px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform">
                    Explore Inventory
                  </a>
                </div>
              </div>
            </article>

            {/* Sticky Sidebar */}
            <aside className="hidden lg:block sticky top-32">
              <div className="space-y-10">
                {/* Table of Contents */}
                {headings.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7c6af7] mb-6">{"// Contents"}</p>
                    <nav className="flex flex-col gap-4 border-l border-[#2a2a30] pl-6">
                      {headings.map((h, i) => (
                        <a key={i} href={`#${h.id}`} className="text-xs text-[#8888a0] hover:text-[#22d3ee] transition-colors leading-relaxed ">
                          {h.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Meta Cards */}
                <div className="bg-[#111113] border border-[#2a2a30] p-6 rounded-2xl">
                  <div className="flex items-center gap-3 text-white font-bold text-sm mb-4">
                    <Layers className="w-4 h-4 text-[#7c6af7]" /> Resources
                  </div>
                  <div className="space-y-4">
                    <Link href="/workflows" className="block text-xs text-[#8888a0] hover:text-white transition-colors">→ ComfyUI Workflows</Link>
                    <Link href="/datasets" className="block text-xs text-[#8888a0] hover:text-white transition-colors">→ Dataset Library</Link>
                    <Link href="/tools/vram-calculator" className="block text-xs text-[#8888a0] hover:text-white transition-colors">→ VRAM Calculator</Link>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-[#22d3ee]/5 to-transparent border border-[#22d3ee]/10 p-6 rounded-2xl">
                  <p className="text-xs text-[#22d3ee] font-mono uppercase tracking-widest mb-2">Can I run this?</p>
                  <p className="text-[11px] text-[#8888a0] leading-relaxed mb-4">Use our optimized hardware estimation tool to verify compatibility.</p>
                  <Link href="/tools/vram-calculator" className="text-[11px] text-white hover:text-[#22d3ee] font-bold underline transition-colors">
                    Check Requirements
                  </Link>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Syne:wght@800;Black&display=swap');
        .mdx-content {
           font-family: var(--font-fira);
        }
        .mdx-content h2 {
            scroll-margin-top: 100px;
        }
        /* Syntax Highlighting overrides for dark theme */
        .hljs {
          color: #e8e8f0;
          background: transparent;
        }
        .hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-section, .hljs-link {
          color: #7c6af7;
        }
        .hljs-string, .hljs-doctag {
          color: #4ade80;
        }
        .hljs-title, .hljs-name, .hljs-attr, .hljs-attribute {
          color: #22d3ee;
        }
        .hljs-comment, .hljs-quote {
          color: #8888a0;
        }
      `}</style>
    </div>
  );
}

export async function generateStaticParams() {
  const dir = join(process.cwd(), "content/guides");
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir);
  return files.map((file) => ({
    slug: file.replace(".mdx", ""),
  }));
}

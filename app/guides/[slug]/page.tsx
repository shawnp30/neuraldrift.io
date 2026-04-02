import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import CopyButton from "@/components/CopyButton";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

interface Props {
  params: { slug: string };
}

interface Frontmatter {
  title: string;
  description: string;
  date: string;
  tags: string[];
}

// ComputeAtlas Ad Component
function ComputeAtlasAd({ variant = "inline" }: { variant?: "inline" | "bottom" }) {
  return (
    <div className={`my-12 p-8 rounded-2xl border border-[#2a2a30] bg-[#111113] relative overflow-hidden group hover:border-[#7c6af7]/30 transition-all duration-300 ${variant === "bottom" ? "mt-20" : ""}`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7c6af7]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <p className="font-mono text-xs text-[#7c6af7] tracking-widest uppercase mb-3">Hardware Partner</p>
          <h3 className="font-syne text-2xl font-bold text-[#e8e8f0] mb-3 leading-tight">
            Running these workflows? ComputeAtlas.ai helps you find the right GPU
          </h3>
          <p className="text-[#8888a0] text-sm leading-relaxed mb-6">
            Optimization is only half the battle. Get precise VRAM benchmarks and hardware recommendations tailored for ComfyUI.
          </p>
          <a
            href="https://computeatlas.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7c6af7] text-white font-bold hover:bg-[#7c6af7]/80 transition-all hover:scale-105 active:scale-95"
          >
            Check GPU Prices →
          </a>
        </div>
        <div className="hidden md:block w-48 h-48 bg-[#0a0a0b] rounded-2xl border border-[#2a2a30] p-4 flex-shrink-0">
          <div className="w-full h-full border border-dashed border-[#2a2a30] rounded-lg flex items-center justify-center text-[#2a2a30] font-mono text-[10px] text-center">
            [AD VISUAL: GPU BENCHMARKS]
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom MDX Components
const components = {
  h1: (props: any) => (
    <h1 className="font-syne text-4xl md:text-5xl font-black text-[#e8e8f0] mt-12 mb-8 tracking-tight leading-[1.1]" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="font-syne text-2xl md:text-3xl font-bold text-[#e8e8f0] mt-16 mb-6 border-b border-[#2a2a30] pb-3 tracking-tight group" {...props}>
      <span className="text-[#7c6af7] mr-3 opacity-50 group-hover:opacity-100 transition-opacity">#</span>
      {props.children}
    </h2>
  ),
  h3: (props: any) => (
    <h3 className="font-syne text-xl md:text-2xl font-semibold text-[#e8e8f0] mt-10 mb-4 tracking-tight" {...props} />
  ),
  p: (props: any) => (
    <p className="text-[18px] leading-[1.8] text-[#e8e8f0]/90 mb-6 font-sans antialiased" {...props} />
  ),
  ul: (props: any) => (
    <ul className="list-none space-y-3 mb-8 pl-1" {...props} />
  ),
  li: (props: any) => (
    <li className="flex items-start gap-3 text-[17px] text-[#e8e8f0]/80 leading-relaxed" {...props}>
      <span className="text-[#4ade80] mt-1 flex-shrink-0">→</span>
      <span>{props.children}</span>
    </li>
  ),
  code: ({ children, className }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-[#111113] border border-[#2a2a30] text-[#22d3ee] px-1.5 py-0.5 rounded-md font-mono text-[0.9em]">
          {children}
        </code>
      );
    }
    return <code className={className}>{children}</code>;
  },
  pre: ({ children }: any) => {
    const codeContent = children?.props?.children || "";
    return (
      <div className="relative group my-8">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#7c6af7]/5 to-transparent rounded-2xl pointer-events-none" />
        <div className="bg-[#1e1e1e] border border-[#2a2a30] rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a30] bg-[#0a0a0b]/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="font-mono text-[10px] text-[#8888a0] tracking-widest uppercase">comfyui-workflow.json</span>
          </div>
          <div className="p-6 overflow-x-auto custom-scrollbar font-mono text-[14px]">
            {children}
          </div>
          <CopyButton text={codeContent} />
        </div>
      </div>
    );
  },
  a: (props: any) => (
    <a className="text-[#22d3ee] hover:text-[#22d3ee]/80 underline decoration-[#22d3ee]/20 underline-offset-4 transition-colors" {...props} />
  ),
  hr: () => <hr className="border-[#2a2a30] my-12" />,
};

function extractHeadings(content: string) {
  const matches = [...content.matchAll(/^## (.*$)/gm)];
  return matches.map((match) => ({
    text: match[1],
    id: match[1].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const filePath = join(process.cwd(), "content/guides", `${slug}.mdx`);
  
  if (!existsSync(filePath)) return { title: "Guide Not Found" };

  const raw = readFileSync(filePath, "utf-8");
  const { frontmatter } = await compileMDX<Frontmatter>({
    source: raw,
    options: { parseFrontmatter: true },
  });

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: "article",
      url: `https://neuraldrift.io/guides/${slug}`,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: frontmatter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
      images: ["/og-image.png"],
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = params;
  const guidesDir = join(process.cwd(), "content/guides");
  const filePath = join(guidesDir, `${slug}.mdx`);

  if (!existsSync(filePath)) {
    return (
      <div className="bg-[#0a0a0b] min-h-screen text-[#e8e8f0]">
        <Navbar />
        <main className="max-w-4xl mx-auto pt-40 px-6 text-center">
          <h1 className="text-4xl font-black mb-8">Guide Not Found</h1>
          <Link href="/guides" className="text-[#7c6af7] hover:underline">← Back to Guides</Link>
        </main>
      </div>
    );
  }

  const raw = readFileSync(filePath, "utf-8");
  
  // Extract Headings for TOC
  const headings = extractHeadings(raw);

  // Split content for Ad insertion
  // We look for the end of the first H2 section. The start of the second H2.
  const h2Count = (raw.match(/^## /gm) || []).length;
  let part1 = raw;
  let part2 = "";

  if (h2Count >= 2) {
    const parts = raw.split(/^## /m);
    // parts[0] is everything before first ##
    // parts[1] is first ## and its content
    // parts[2] is start of second ##
    part1 = parts[0] + (parts[1] ? `## ${parts[1]}` : "");
    part2 = parts.slice(2).map(p => `## ${p}`).join("");
  } else if (h2Count === 1) {
    // If only one heading, keep everything in part 1
    part1 = raw;
    part2 = "";
  }

  const [{ content: content1, frontmatter }, { content: content2 }] = await Promise.all([
    compileMDX<Frontmatter>({
      source: part1,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          rehypePlugins: [rehypeHighlight, rehypeSlug],
          remarkPlugins: [remarkGfm],
        },
      },
      components,
    }),
    compileMDX<Frontmatter>({
      source: part2 || " ", // Fallback to space if empty to avoid compilation errors
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          rehypePlugins: [rehypeHighlight, rehypeSlug],
          remarkPlugins: [remarkGfm],
        },
      },
      components,
    }),
  ]);

  const readingTime = Math.ceil(raw.split(/\s+/).length / 200);

  // Get Next/Previous
  const allFiles = readdirSync(guidesDir).filter(f => f.endsWith(".mdx"));
  const currentIndex = allFiles.indexOf(`${slug}.mdx`);
  const prevSlug = currentIndex > 0 ? allFiles[currentIndex - 1].replace(".mdx", "") : null;
  const nextSlug = currentIndex < allFiles.length - 1 ? allFiles[currentIndex + 1].replace(".mdx", "") : null;

  return (
    <div className="bg-[#0a0a0b] min-h-screen text-[#e8e8f0] selection:bg-[#7c6af7]/30 selection:text-white">
      <Navbar />

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css');
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0a0a0b; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a2a30; border-radius: 3px; }
      `}} />

      <main className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16 items-start">
          
          {/* Main Article Container */}
          <div className="max-w-[720px] mx-auto w-full">
            
            {/* Header */}
            <header className="mb-16">
              <div className="flex flex-wrap gap-2 mb-6">
                {(frontmatter.tags || []).map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-[#7c6af7]/10 border border-[#7c6af7]/20 text-[#7c6af7] font-mono text-[10px] tracking-widest uppercase">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="font-syne text-5xl md:text-6xl font-black text-[#e8e8f0] mb-6 tracking-tight leading-[1.05]">
                {frontmatter.title}
              </h1>
              <p className="text-xl text-[#8888a0] leading-relaxed mb-8">
                {frontmatter.description}
              </p>
              <div className="flex items-center gap-6 font-mono text-xs text-[#8888a0]">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                  {readingTime} min read
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7]" />
                  {frontmatter.date}
                </span>
              </div>
            </header>

            {/* Article Body */}
            <article className="guide-body">
              {content1}
              
              {/* Insert Ad after first section */}
              {part2 && <ComputeAtlasAd variant="inline" />}
              
              {content2}

              {/* Bottom Ad */}
              <ComputeAtlasAd variant="bottom" />
            </article>

            {/* Pagination */}
            <nav className="mt-24 pt-12 border-t border-[#2a2a30] flex flex-col md:flex-row justify-between gap-6">
              {prevSlug ? (
                <Link href={`/guides/${prevSlug}`} className="flex-1 p-6 rounded-2xl border border-[#2a2a30] bg-[#111113] hover:border-[#7c6af7]/40 transition-all group">
                  <span className="block font-mono text-[10px] text-[#8888a0] uppercase tracking-widest mb-2 group-hover:text-[#7c6af7] transition-colors">← Previous Guide</span>
                  <span className="block text-lg font-bold text-[#e8e8f0] line-clamp-1 group-hover:translate-x-1 transition-transform">{prevSlug.replace(/-/g, " ")}</span>
                </Link>
              ) : <div className="flex-1" />}
              
              {nextSlug ? (
                <Link href={`/guides/${nextSlug}`} className="flex-1 p-6 rounded-2xl border border-[#2a2a30] bg-[#111113] hover:border-[#4ade80]/40 transition-all group text-right">
                  <span className="block font-mono text-[10px] text-[#8888a0] uppercase tracking-widest mb-2 group-hover:text-[#4ade80] transition-colors">Next Guide →</span>
                  <span className="block text-lg font-bold text-[#e8e8f0] line-clamp-1 group-hover:-translate-x-1 transition-transform">{nextSlug.replace(/-/g, " ")}</span>
                </Link>
              ) : <div className="flex-1" />}
            </nav>
          </div>

          {/* Table of Contents - Desktop Only */}
          <aside className="sticky top-40 hidden lg:block">
            <div className="p-6 rounded-2xl border border-[#2a2a30] bg-[#111113]/50 backdrop-blur-xl">
              <p className="font-mono text-[10px] text-[#7c6af7] tracking-widest uppercase mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af7]" />
                On this page
              </p>
              <nav className="space-y-4">
                {headings.map((h, i) => (
                  <a
                    key={i}
                    href={`#${h.id}`}
                    className="block text-sm text-[#8888a0] hover:text-[#e8e8f0] transition-colors leading-relaxed border-l-2 border-transparent hover:border-[#7c6af7] pl-4 -ml-0.5"
                  >
                    {h.text}
                  </a>
                ))}
              </nav>

              <div className="mt-12 pt-8 border-t border-[#2a2a30]">
                <p className="font-mono text-[10px] text-[#8888a0] tracking-widest uppercase mb-4">Quick Actions</p>
                <div className="space-y-3">
                  <a href="#" className="flex items-center gap-2 text-xs text-[#8888a0] hover:text-[#22d3ee] transition-colors">
                    <span className="text-[#22d3ee]">☇</span> Download Workflow
                  </a>
                  <a href="#" className="flex items-center gap-2 text-xs text-[#8888a0] hover:text-[#4ade80] transition-colors">
                    <span className="text-[#4ade80]">↑</span> Share Guide
                  </a>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  const guidesDir = join(process.cwd(), "content/guides");
  if (!existsSync(guidesDir)) return [];
  const files = readdirSync(guidesDir);
  return files
    .filter(f => f.endsWith(".mdx"))
    .map(f => ({ slug: f.replace(".mdx", "") }));
}

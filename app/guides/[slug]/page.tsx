import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import Link from "next/link";
import type { Difficulty } from "@/types";

interface Props { params: { slug: string } }

const DIFF_STYLES: Record<Difficulty, string> = {
  Beginner:     "bg-[rgba(163,230,53,0.1)] text-[#a3e635] border border-[rgba(163,230,53,0.2)]",
  Intermediate: "bg-[rgba(249,115,22,0.1)] text-[#f97316] border border-[rgba(249,115,22,0.2)]",
  Advanced:     "bg-[rgba(124,58,237,0.1)] text-[#a78bfa] border border-[rgba(124,58,237,0.2)]",
};

// Extract headings for table of contents
function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const h2 = line.match(/^## (.+)$/);
    const h3 = line.match(/^### (.+)$/);
    if (h2) {
      const text = h2[1];
      headings.push({ id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-"), text, level: 2 });
    } else if (h3) {
      const text = h3[1];
      headings.push({ id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-"), text, level: 3 });
    }
  }
  return headings;
}

// Convert markdown to styled HTML
function renderMarkdown(content: string): string {
  return content
    // Remove h1 (shown as page title)
    .replace(/^# .+$/gm, "")
    // Code blocks with language label
    .replace(/```(\w+)?\n([\s\S]+?)```/g, (_, lang, code) => {
      const label = lang ? `<span class="absolute top-3 right-4 font-mono text-xs text-muted tracking-widest uppercase">${lang}</span>` : "";
      return `<div class="relative my-6"><div class="bg-[#0d1117] border border-border rounded-xl overflow-hidden">${label}<div class="flex items-center gap-1.5 px-4 py-3 border-b border-border/50"><span class="w-3 h-3 rounded-full bg-[#ff5f57]"></span><span class="w-3 h-3 rounded-full bg-[#febc2e]"></span><span class="w-3 h-3 rounded-full bg-[#28c840]"></span></div><pre class="p-5 overflow-x-auto font-mono text-xs text-slate-300 leading-7">${code.trim()}</pre></div></div>`;
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="font-mono text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded border border-accent/20">$1</code>')
    // H2 with anchor
    .replace(/^## (.+)$/gm, (_, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return `<h2 id="${id}" class="font-syne text-2xl font-black text-white mt-14 mb-5 pb-3 border-b border-border tracking-tight scroll-mt-24">${text}</h2>`;
    })
    // H3
    .replace(/^### (.+)$/gm, (_, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return `<h3 id="${id}" class="font-syne text-lg font-bold text-white mt-8 mb-3 scroll-mt-24">${text}</h3>`;
    })
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // Tables — detect entire table blocks at once
    .replace(/((?:^\|.+\|\s*\n)+)/gm, (block) => {
      const lines = block.trim().split("\n").map(l => l.trim()).filter(l => l.startsWith("|"));
      const rows: string[][] = [];
      let headerRow: string[] | null = null;
      for (const line of lines) {
        const cells = line.split("|").map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
        if (cells.every(c => /^[-:]+$/.test(c))) {
          // separator row — mark previous row as header
          if (rows.length > 0) headerRow = rows.pop()!;
          continue;
        }
        rows.push(cells);
      }
      if (!headerRow && rows.length > 0) headerRow = rows.shift()!;
      const thRow = headerRow
        ? `<tr>${headerRow.map(c => `<th class="px-4 py-3 text-xs font-mono text-accent tracking-widest uppercase text-left">${c}</th>`).join("")}</tr>`
        : "";
      const bodyRows = rows.map(cells =>
        `<tr class="border-b border-border hover:bg-white/2 transition-colors">${cells.map(c => `<td class="px-4 py-3 text-sm text-muted font-mono">${c}</td>`).join("")}</tr>`
      ).join("");
      return `<div class="my-6 overflow-x-auto rounded-xl border border-border"><table class="w-full"><thead class="bg-surface border-b border-border">${thRow}</thead><tbody>${bodyRows}</tbody></table></div>`;
    })
    // Numbered lists
    .replace(/^(\d+)\. (.+)$/gm, '<li class="flex items-start gap-3 text-muted text-sm leading-relaxed my-2"><span class="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent font-mono text-xs flex items-center justify-center mt-0.5 border border-accent/20">$1</span><span>$2</span></li>')
    .replace(/((?:<li class="flex items-start gap-3[^"]*"[^>]*>[\s\S]*?<\/li>\n?)+)/g, '<ol class="my-4 space-y-1">$1</ol>')
    // Bullet lists
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 text-muted text-sm leading-relaxed my-1.5"><span class="text-accent mt-1.5 flex-shrink-0">→</span><span>$1</span></li>')
    .replace(/((?:<li class="flex items-start gap-2[^"]*"[^>]*>[\s\S]*?<\/li>\n?)+)/g, '<ul class="my-4 space-y-0.5">$1</ul>')
    // Callout boxes for bold standalone lines
    .replace(/^\*\*"(.+?)"\*\*$/gm, '<div class="my-4 border-l-2 border-accent pl-4 py-1"><p class="text-muted text-sm italic leading-relaxed">$1</p></div>')
    // Paragraphs
    .replace(/\n\n([^<\n].+)/g, '\n\n<p class="text-muted leading-relaxed my-4 text-sm">$1</p>')
    // Clean up
    .replace(/^\n+|\n+$/g, "");
}

export default function GuidePage({ params }: Props) {
  const filePath = join(process.cwd(), "content/guides", `${params.slug}.mdx`);

  if (!existsSync(filePath)) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-20 px-10 max-w-4xl mx-auto text-center">
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">404</p>
          <h1 className="font-syne text-4xl font-black text-white mb-4">Guide not found</h1>
          <Link href="/guides" className="text-accent hover:underline font-mono text-sm">← Back to guides</Link>
        </main>
        <Footer />
      </>
    );
  }

  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const difficulty = (data.difficulty || "Beginner") as Difficulty;
  const headings = extractHeadings(content);
  const htmlContent = renderMarkdown(content);

  // Related guides
  const ALL_GUIDES = [
    { slug: "ltx-video-cinematic-action", title: "LTX Video 2.3: Cinematic Action", difficulty: "Advanced" as Difficulty, tag: "Video Gen" },
    { slug: "train-flux-lora", title: "Train Your First FLUX LoRA", difficulty: "Intermediate" as Difficulty, tag: "LoRA Training" },
    { slug: "comfyui-complete-setup", title: "ComfyUI Complete Setup", difficulty: "Beginner" as Difficulty, tag: "Image Gen" },
  ];
  const related = ALL_GUIDES.filter(g => g.slug !== params.slug).slice(0, 2);

  return (
    <>
      <Navbar />
      <main className="pt-16 pb-20">

        {/* Hero header */}
        <div className="border-b border-border bg-gradient-to-b from-surface/50 to-transparent">
          <div className="max-w-7xl mx-auto px-10 pt-12 pb-10">
            <Link href="/guides" className="font-mono text-xs text-muted hover:text-accent tracking-widest uppercase transition-colors inline-flex items-center gap-2 mb-8">
              ← All Guides
            </Link>
            <div className="flex items-start justify-between gap-12">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-5">
                  <span className={`font-mono text-xs px-3 py-1 rounded-full tracking-widest uppercase ${DIFF_STYLES[difficulty]}`}>
                    {difficulty}
                  </span>
                  <span className="font-mono text-xs text-muted">⏱ {data.readTime} read</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="font-mono text-xs text-muted">{data.tag}</span>
                  {data.publishedAt && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="font-mono text-xs text-muted">{data.publishedAt}</span>
                    </>
                  )}
                </div>
                <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-5 leading-tight">
                  {data.title}
                </h1>
                <p className="text-muted text-lg leading-relaxed max-w-2xl">{data.description}</p>
              </div>

              {/* Quick stats */}
              <div className="flex-shrink-0 hidden lg:grid grid-cols-2 gap-3 w-56">
                {[
                  { label: "Read time", value: data.readTime },
                  { label: "Level", value: difficulty },
                  { label: "Category", value: data.tag },
                  { label: "Sections", value: String(headings.filter(h => h.level === 2).length) },
                ].map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-lg p-3 text-center">
                    <div className="font-syne text-sm font-bold text-white">{s.value}</div>
                    <div className="font-mono text-xs text-muted mt-0.5 tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="max-w-7xl mx-auto px-10 pt-12">
          <div className="grid grid-cols-[1fr_260px] gap-12 items-start">

            {/* Main article */}
            <article
              className="min-w-0 prose-custom"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Sticky sidebar */}
            <aside className="sticky top-24 space-y-5">

              {/* Table of contents */}
              {headings.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">Contents</p>
                  <nav className="space-y-1">
                    {headings.map((h) => (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        className={`block font-mono text-xs text-muted hover:text-accent transition-colors leading-relaxed py-1 ${
                          h.level === 3 ? "pl-3 border-l border-border" : ""
                        }`}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* ComputeAtlas CTA */}
              <div className="bg-gradient-to-br from-accent-purple/8 to-transparent border border-accent-purple/20 rounded-xl p-5">
                <p className="font-mono text-xs text-[#a78bfa] tracking-widest uppercase mb-2">Hardware</p>
                <p className="text-sm text-muted leading-relaxed mb-3">
                  Not sure your GPU can handle this guide? Plan your upgrade on ComputeAtlas.
                </p>
                <a
                  href="https://computeatlas.ai/ai-hardware-estimator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center font-mono text-xs text-[#a78bfa] border border-accent-purple/20 px-4 py-2 rounded hover:bg-accent-purple/8 transition-colors tracking-wider"
                >
                  Hardware Estimator →
                </a>
              </div>

              {/* Related guides */}
              {related.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">Related</p>
                  <div className="space-y-3">
                    {related.map((g) => (
                      <Link
                        key={g.slug}
                        href={`/guides/${g.slug}`}
                        className="block group"
                      >
                        <div className="font-syne text-xs font-bold text-muted group-hover:text-white transition-colors leading-snug mb-1">
                          {g.title}
                        </div>
                        <div className="font-mono text-xs text-muted/60">{g.tag}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export async function generateStaticParams() {
  const slugs = ["ltx-video-cinematic-action", "comfyui-complete-setup", "train-flux-lora"];
  return slugs.map((slug) => ({ slug }));
}

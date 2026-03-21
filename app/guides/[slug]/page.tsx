import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import Link from "next/link";
import type { Difficulty } from "@/types";

interface Props { params: { slug: string } }

const DIFF_STYLES: Record<Difficulty, { badge: string; glow: string }> = {
  Beginner:     { badge: "bg-[rgba(163,230,53,0.12)] text-[#a3e635] border border-[rgba(163,230,53,0.25)]", glow: "#a3e635" },
  Intermediate: { badge: "bg-[rgba(249,115,22,0.12)] text-[#f97316] border border-[rgba(249,115,22,0.25)]", glow: "#f97316" },
  Advanced:     { badge: "bg-[rgba(124,58,237,0.12)] text-[#a78bfa] border border-[rgba(124,58,237,0.25)]", glow: "#a78bfa" },
};

function extractHeadings(content: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  for (const line of content.split("\n")) {
    const h2 = line.match(/^## (.+)$/);
    const h3 = line.match(/^### (.+)$/);
    if (h2) headings.push({ id: slugify(h2[1]), text: h2[1], level: 2 });
    else if (h3) headings.push({ id: slugify(h3[1]), text: h3[1], level: 3 });
  }
  return headings;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function extractLearnItems(content: string): string[] {
  const match = content.match(/<!-- learn\n([\s\S]*?)\n-->/);
  if (!match) return [];
  return match[1].split("\n").map(l => l.replace(/^-\s*/, "").trim()).filter(Boolean);
}

function renderMarkdown(content: string): string {
  // Remove learn comments (handled separately)
  content = content.replace(/<!-- learn[\s\S]*?-->/g, "");

  return content
    .replace(/^# .+$/gm, "")
    // ── Custom callout blocks ──
    .replace(/^:::tip (.+)$/gm, '<div class="callout-tip">')
    .replace(/^:::warning (.+)$/gm, '<div class="callout-warning">')
    .replace(/^:::note (.+)$/gm, '<div class="callout-note">')
    .replace(/^:::pro (.+)$/gm, '<div class="callout-pro">')
    .replace(/^:::$/gm, '</div>')
    // ── Stat cards ──
    .replace(/^:::stats$/gm, '<div class="stat-grid">')
    .replace(/^:::stat (.+?) \| (.+)$/gm, '<div class="stat-card"><span class="stat-value">$1</span><span class="stat-label">$2</span></div>')
    // ── Images ──
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="my-8"><img src="$2" alt="$1" class="w-full rounded-xl border border-border" /><figcaption class="font-mono text-xs text-muted text-center mt-2">$1</figcaption></figure>')
    // ── Code blocks ──
    .replace(/```(\w+)?\n([\s\S]+?)```/g, (_, lang, code) => {
      const label = lang ? `<span class="code-lang">${lang}</span>` : "";
      return `<div class="code-block">${label}<div class="code-dots"><span></span><span></span><span></span></div><pre>${code.trim()}</pre></div>`;
    })
    // ── Inline code ──
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // ── Headings ──
    .replace(/^## (.+)$/gm, (_, text) => `<h2 id="${slugify(text)}" class="guide-h2">${text}</h2>`)
    .replace(/^### (.+)$/gm, (_, text) => `<h3 id="${slugify(text)}" class="guide-h3">${text}</h3>`)
    // ── Bold / italic ──
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-muted italic">$1</em>')
    // ── Tables ──
    .replace(/((?:^\|.+\|\s*\n)+)/gm, (block) => {
      const lines = block.trim().split("\n").map(l => l.trim()).filter(l => l.startsWith("|"));
      const rows: string[][] = [];
      let headerRow: string[] | null = null;
      for (const line of lines) {
        const cells = line.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        if (cells.every(c => /^[-:]+$/.test(c))) { if (rows.length) headerRow = rows.pop()!; continue; }
        rows.push(cells);
      }
      if (!headerRow && rows.length) headerRow = rows.shift()!;
      const thead = headerRow ? `<thead class="guide-thead"><tr>${headerRow.map(c => `<th class="guide-th">${c}</th>`).join("")}</tr></thead>` : "";
      const tbody = `<tbody>${rows.map(r => `<tr class="guide-tr">${r.map(c => `<td class="guide-td">${c}</td>`).join("")}</tr>`).join("")}</tbody>`;
      return `<div class="table-wrap"><table class="guide-table">${thead}${tbody}</table></div>`;
    })
    // ── Numbered lists ──
    .replace(/^(\d+)\. (.+)$/gm, (_, n, text) =>
      `<li class="guide-num-item"><span class="guide-num">${n}</span><span>${text}</span></li>`)
    .replace(/((?:<li class="guide-num-item">[\s\S]*?<\/li>\n?)+)/g, '<ol class="guide-ol">$1</ol>')
    // ── Bullet lists ──
    .replace(/^- (.+)$/gm, '<li class="guide-bullet-item"><span class="bullet-arrow">→</span><span>$1</span></li>')
    .replace(/((?:<li class="guide-bullet-item">[\s\S]*?<\/li>\n?)+)/g, '<ul class="guide-ul">$1</ul>')
    // ── Horizontal rule ──
    .replace(/^---$/gm, '<hr class="guide-hr" />')
    // ── Paragraphs ──
    .replace(/\n\n([^<\n].+)/g, '\n\n<p class="guide-p">$1</p>')
    .replace(/^\n+|\n+$/g, "");
}

const ALL_GUIDES = [
  { slug: "ltx-video-cinematic-action", title: "LTX Video 2.3: Cinematic Action", difficulty: "Advanced" as Difficulty, tag: "Video Gen", desc: "Build chase sequences with consistent motion." },
  { slug: "train-flux-lora", title: "Train Your First FLUX LoRA", difficulty: "Intermediate" as Difficulty, tag: "LoRA Training", desc: "Full pipeline from dataset to deployment." },
  { slug: "comfyui-complete-setup", title: "ComfyUI Complete Setup", difficulty: "Beginner" as Difficulty, tag: "Image Gen", desc: "Install and configure ComfyUI on Windows." },
];

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
  const diff = DIFF_STYLES[difficulty];
  const headings = extractHeadings(content);
  const learnItems = extractLearnItems(content);
  const htmlContent = renderMarkdown(content);
  const related = ALL_GUIDES.filter(g => g.slug !== params.slug);
  const next = related[0];

  return (
    <>
      <Navbar />

      {/* Reading progress — client side via CSS custom prop trick */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-border z-50">
        <div
          id="reading-progress"
          className="h-full bg-gradient-to-r from-accent to-accent-purple transition-all duration-100"
          style={{ width: "0%" }}
        />
      </div>

      <style>{`
        /* Progress bar script */
        #reading-progress { transition: width 0.1s linear; }

        /* Guide typography */
        .guide-h2 { font-family: var(--font-syne); font-size: 1.6rem; font-weight: 900; color: white; margin-top: 3.5rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); scroll-margin-top: 6rem; letter-spacing: -0.02em; }
        .guide-h3 { font-family: var(--font-syne); font-size: 1.1rem; font-weight: 700; color: white; margin-top: 2rem; margin-bottom: 0.75rem; scroll-margin-top: 6rem; }
        .guide-p { color: rgba(148,163,184,1); line-height: 1.8; margin: 1rem 0; font-size: 0.95rem; }
        .guide-hr { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 2.5rem 0; }

        /* Callout boxes */
        .callout-tip, .callout-warning, .callout-note, .callout-pro { border-radius: 12px; padding: 1.25rem 1.25rem 1.25rem 1.5rem; margin: 1.5rem 0; position: relative; overflow: hidden; }
        .callout-tip { background: rgba(0,229,255,0.05); border: 1px solid rgba(0,229,255,0.2); border-left: 3px solid #00e5ff; }
        .callout-tip::before { content: "💡 Tip"; font-family: monospace; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #00e5ff; display: block; margin-bottom: 0.5rem; }
        .callout-warning { background: rgba(249,115,22,0.05); border: 1px solid rgba(249,115,22,0.2); border-left: 3px solid #f97316; }
        .callout-warning::before { content: "⚠ Warning"; font-family: monospace; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #f97316; display: block; margin-bottom: 0.5rem; }
        .callout-note { background: rgba(167,139,250,0.05); border: 1px solid rgba(167,139,250,0.2); border-left: 3px solid #a78bfa; }
        .callout-note::before { content: "// Note"; font-family: monospace; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #a78bfa; display: block; margin-bottom: 0.5rem; }
        .callout-pro { background: rgba(163,230,53,0.05); border: 1px solid rgba(163,230,53,0.2); border-left: 3px solid #a3e635; }
        .callout-pro::before { content: "★ Pro Tip"; font-family: monospace; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #a3e635; display: block; margin-bottom: 0.5rem; }
        .callout-tip p, .callout-warning p, .callout-note p, .callout-pro p { color: rgba(203,213,225,0.9); font-size: 0.875rem; line-height: 1.7; margin: 0; }

        /* Stat grid */
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin: 1.5rem 0; }
        .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1rem; text-align: center; }
        .stat-value { font-family: var(--font-syne); font-size: 1.6rem; font-weight: 900; color: #00e5ff; display: block; line-height: 1; }
        .stat-label { font-family: monospace; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(148,163,184,0.7); display: block; margin-top: 0.35rem; }

        /* Code blocks */
        .code-block { position: relative; margin: 1.5rem 0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: #0d1117; }
        .code-lang { position: absolute; top: 0.75rem; right: 1rem; font-family: monospace; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(148,163,184,0.5); }
        .code-dots { padding: 0.6rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; gap: 0.35rem; align-items: center; }
        .code-dots span { width: 10px; height: 10px; border-radius: 50%; }
        .code-dots span:nth-child(1) { background: #ff5f57; }
        .code-dots span:nth-child(2) { background: #febc2e; }
        .code-dots span:nth-child(3) { background: #28c840; }
        .code-block pre { padding: 1.25rem 1.25rem 1.25rem; font-family: monospace; font-size: 0.78rem; color: #cbd5e1; line-height: 1.8; overflow-x: auto; white-space: pre; }
        .inline-code { font-family: monospace; font-size: 0.78rem; background: rgba(0,229,255,0.08); color: #00e5ff; padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid rgba(0,229,255,0.2); }

        /* Tables */
        .table-wrap { margin: 1.5rem 0; overflow-x: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); }
        .guide-table { width: 100%; border-collapse: collapse; }
        .guide-thead { background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .guide-th { padding: 0.75rem 1rem; font-family: monospace; font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: #00e5ff; text-align: left; }
        .guide-tr { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.1s; }
        .guide-tr:hover { background: rgba(255,255,255,0.02); }
        .guide-tr:last-child { border-bottom: none; }
        .guide-td { padding: 0.75rem 1rem; font-family: monospace; font-size: 0.8rem; color: rgba(148,163,184,0.9); }

        /* Lists */
        .guide-ol { margin: 1rem 0; display: flex; flex-direction: column; gap: 0.5rem; }
        .guide-num-item { display: flex; align-items: flex-start; gap: 0.85rem; color: rgba(148,163,184,0.9); font-size: 0.9rem; line-height: 1.7; }
        .guide-num { flex-shrink: 0; width: 1.5rem; height: 1.5rem; border-radius: 50%; background: rgba(0,229,255,0.1); border: 1px solid rgba(0,229,255,0.25); color: #00e5ff; font-family: monospace; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; margin-top: 0.2rem; }
        .guide-ul { margin: 0.75rem 0; display: flex; flex-direction: column; gap: 0.4rem; }
        .guide-bullet-item { display: flex; align-items: flex-start; gap: 0.6rem; color: rgba(148,163,184,0.9); font-size: 0.9rem; line-height: 1.7; }
        .bullet-arrow { color: #00e5ff; flex-shrink: 0; margin-top: 0.2rem; font-size: 0.75rem; }
      `}</style>

      <script dangerouslySetInnerHTML={{
        __html: `
          window.addEventListener('scroll', function() {
            var el = document.getElementById('reading-progress');
            if (!el) return;
            var scroll = window.scrollY;
            var height = document.body.scrollHeight - window.innerHeight;
            el.style.width = (height > 0 ? (scroll / height) * 100 : 0) + '%';
          });
        `
      }} />

      <main className="pt-16 pb-24">

        {/* ── Hero header ── */}
        <div className="relative border-b border-border overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-surface/80 via-bg to-bg" />
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-[radial-gradient(ellipse,rgba(0,229,255,0.04)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-10 pt-12 pb-10">
            <Link href="/guides" className="font-mono text-xs text-muted hover:text-accent tracking-widest uppercase transition-colors inline-flex items-center gap-2 mb-8 group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> All Guides
            </Link>
            <div className="flex items-start justify-between gap-16">
              <div className="max-w-3xl">
                {/* Badges row */}
                <div className="flex items-center flex-wrap gap-2 mb-5">
                  <span className={`font-mono text-xs px-3 py-1.5 rounded-full tracking-widest uppercase ${diff.badge}`}>
                    {difficulty}
                  </span>
                  <span className="font-mono text-xs px-3 py-1.5 rounded-full bg-white/5 text-muted border border-border tracking-widest uppercase">
                    {data.tag}
                  </span>
                  <span className="font-mono text-xs text-muted">⏱ {data.readTime} read</span>
                  {data.publishedAt && <span className="font-mono text-xs text-muted">{data.publishedAt}</span>}
                </div>
                <h1 className="font-syne text-5xl font-black tracking-tight text-white mb-5 leading-[1.05]">
                  {data.title}
                </h1>
                <p className="text-muted text-lg leading-relaxed">{data.description}</p>
              </div>

              {/* Quick stats */}
              <div className="flex-shrink-0 hidden lg:grid grid-cols-2 gap-2.5 w-52">
                {[
                  { label: "Read time", value: data.readTime || "—" },
                  { label: "Level", value: difficulty },
                  { label: "Category", value: data.tag || "—" },
                  { label: "Sections", value: String(headings.filter(h => h.level === 2).length) },
                ].map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-xl p-3.5 text-center group hover:border-accent/20 transition-colors">
                    <div className="font-syne text-sm font-black text-white">{s.value}</div>
                    <div className="font-mono text-xs text-muted mt-0.5 tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content area ── */}
        <div className="max-w-7xl mx-auto px-10 pt-10">
          <div className="grid grid-cols-[1fr_280px] gap-12 items-start">

            {/* ── Main article ── */}
            <div className="min-w-0">

              {/* What you'll learn */}
              {learnItems.length > 0 && (
                <div className="mb-10 bg-gradient-to-br from-accent/5 to-transparent border border-accent/20 rounded-2xl p-6">
                  <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">What you&apos;ll learn</p>
                  <div className="grid grid-cols-2 gap-2">
                    {learnItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="text-accent mt-0.5 flex-shrink-0 text-xs">✓</span>
                        <span className="text-sm text-muted leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <article dangerouslySetInnerHTML={{ __html: htmlContent }} />

              {/* ── Bottom navigation ── */}
              {next && (
                <div className="mt-16 pt-8 border-t border-border">
                  <p className="font-mono text-xs text-muted tracking-widest uppercase mb-4">Up Next</p>
                  <Link href={`/guides/${next.slug}`} className="group flex items-center justify-between bg-card border border-border rounded-2xl p-6 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-200">
                    <div>
                      <div className="font-mono text-xs text-muted mb-2">{next.tag}</div>
                      <div className="font-syne text-xl font-black text-white group-hover:text-accent transition-colors tracking-tight">{next.title}</div>
                      <div className="text-sm text-muted mt-1">{next.desc}</div>
                    </div>
                    <span className="text-accent text-2xl group-hover:translate-x-2 transition-transform flex-shrink-0 ml-8">→</span>
                  </Link>
                </div>
              )}

              {/* ── All guides CTA ── */}
              <div className="mt-6 text-center">
                <Link href="/guides" className="font-mono text-xs text-muted hover:text-accent tracking-widest uppercase transition-colors">
                  ← Browse all guides
                </Link>
              </div>
            </div>

            {/* ── Sticky sidebar ── */}
            <aside className="sticky top-24 space-y-5">

              {/* Table of contents */}
              {headings.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">Contents</p>
                  <nav className="space-y-0.5">
                    {headings.map((h) => (
                      <a key={h.id} href={`#${h.id}`}
                        className={`block font-mono text-xs text-muted hover:text-accent transition-colors py-1.5 leading-relaxed ${
                          h.level === 3 ? "pl-3 border-l border-border ml-1" : ""
                        }`}>
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Related guides */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">More Guides</p>
                <div className="space-y-3">
                  {related.map((g) => (
                    <Link key={g.slug} href={`/guides/${g.slug}`} className="block group">
                      <div className="font-mono text-xs text-muted/60 mb-0.5">{g.tag}</div>
                      <div className="font-syne text-xs font-bold text-muted group-hover:text-white transition-colors leading-snug">{g.title}</div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ComputeAtlas CTA */}
              <div className="bg-gradient-to-br from-accent-purple/8 to-transparent border border-accent-purple/20 rounded-2xl p-5">
                <p className="font-mono text-xs text-[#a78bfa] tracking-widest uppercase mb-2">Hardware</p>
                <p className="text-sm text-muted leading-relaxed mb-4">Not sure your GPU can handle this? Plan your upgrade on ComputeAtlas.</p>
                <a href="https://computeatlas.ai/ai-hardware-estimator" target="_blank" rel="noopener noreferrer"
                  className="block text-center font-mono text-xs text-[#a78bfa] border border-accent-purple/20 px-4 py-2.5 rounded-lg hover:bg-accent-purple/8 transition-colors tracking-wider">
                  Hardware Estimator →
                </a>
              </div>

              {/* Workflow CTA */}
              <div className="bg-gradient-to-br from-accent/5 to-transparent border border-accent/15 rounded-2xl p-5">
                <p className="font-mono text-xs text-accent tracking-widest uppercase mb-2">Workflows</p>
                <p className="text-sm text-muted leading-relaxed mb-4">Ready to run? Browse pre-configured ComfyUI workflows tuned for your hardware.</p>
                <Link href="/workflows"
                  className="block text-center font-mono text-xs text-accent border border-accent/20 px-4 py-2.5 rounded-lg hover:bg-accent/8 transition-colors tracking-wider">
                  Browse Workflows →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export async function generateStaticParams() {
  return ["ltx-video-cinematic-action", "comfyui-complete-setup", "train-flux-lora"].map(slug => ({ slug }));
}

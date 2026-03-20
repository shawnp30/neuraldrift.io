import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import Link from "next/link";
import type { Difficulty } from "@/types";

interface Props { params: { slug: string } }

const DIFF_STYLES: Record<Difficulty, string> = {
  Beginner: "bg-[rgba(163,230,53,0.1)] text-[#a3e635]",
  Intermediate: "bg-[rgba(249,115,22,0.1)] text-[#f97316]",
  Advanced: "bg-[rgba(124,58,237,0.1)] text-[#a78bfa]",
};

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

  // Convert markdown to basic HTML for display
  const htmlContent = content
    .replace(/^### (.+)$/gm, '<h3 class="font-syne text-lg font-bold text-white mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-syne text-2xl font-bold text-white mt-12 mb-4 pb-3 border-b border-border">$2</h2>')
    .replace(/^# (.+)$/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="font-mono text-xs bg-accent/8 text-accent px-1.5 py-0.5 rounded">$1</code>')
    .replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre class="bg-surface border border-border rounded-lg p-5 overflow-x-auto my-5 font-mono text-xs text-slate-300 leading-relaxed">$2</pre>')
    .replace(/^\| (.+) \|$/gm, (match: string) => {
      const cells = match.split('|').filter((c: string) => c.trim());
      return '<tr>' + cells.map((c: string) => `<td class="px-4 py-2 text-sm text-muted border-b border-border">${c.trim()}</td>`).join('') + '</tr>';
    })
    .replace(/^- (.+)$/gm, '<li class="text-muted text-sm leading-relaxed ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="text-muted text-sm leading-relaxed ml-4 list-decimal">$2</li>')
    .replace(/\n\n/g, '</p><p class="text-muted leading-relaxed my-4">')
    .replace(/^(?!<[h|p|l|t|p|u|o|c|s])(.+)$/gm, '<p class="text-muted leading-relaxed my-3">$1</p>');

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-10 max-w-4xl mx-auto">
        {/* Back */}
        <Link href="/guides" className="font-mono text-xs text-muted hover:text-accent tracking-widest uppercase transition-colors mb-8 inline-block">
          ← All Guides
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`font-mono text-xs px-2 py-0.5 rounded-sm tracking-widest uppercase ${DIFF_STYLES[difficulty]}`}>
            {difficulty}
          </span>
          <span className="font-mono text-xs text-muted">⏱ {data.readTime}</span>
          <span className="font-mono text-xs text-muted">·</span>
          <span className="font-mono text-xs text-muted">{data.tag}</span>
        </div>

        {/* Title */}
        <h1 className="font-syne text-4xl font-black tracking-tight text-white mb-4 leading-tight">
          {data.title}
        </h1>
        <p className="text-muted text-lg leading-relaxed mb-12 max-w-2xl">{data.description}</p>

        {/* Content */}
        <article
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </main>
      <Footer />
    </>
  );
}

export async function generateStaticParams() {
  const slugs = ["ltx-video-cinematic-action", "comfyui-complete-setup", "train-flux-lora"];
  return slugs.map((slug) => ({ slug }));
}

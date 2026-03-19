import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface Props { params: { slug: string } }

export default function GuidePage({ params }: Props) {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-10 max-w-4xl mx-auto">
        <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">// Guide</p>
        <h1 className="font-syne text-4xl font-black tracking-tight text-white mb-8">{params.slug.replace(/-/g, " ")}</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-muted">Guide content coming soon. Add MDX files to <code>content/guides/{params.slug}.mdx</code></p>
        </div>
      </main>
      <Footer />
    </>
  );
}

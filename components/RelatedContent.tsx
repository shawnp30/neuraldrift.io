import Link from "next/link";
import type { Tutorial } from "@/lib/tutorials";
import type { WorkflowEntry } from "@/lib/workflowsData";

interface Props {
  workflows?: WorkflowEntry[];
  guides?: { slug: string; title: string }[];
  tutorials?: Tutorial[];
  title?: string;
}

export function RelatedContent({ workflows = [], guides = [], tutorials = [], title = "Continue exploring" }: Props) {
  if (!workflows.length && !guides.length && !tutorials.length) return null;
  return <section className="nd-section">
    <h2>{title}</h2>
    <div className="nd-grid">
      {workflows.map(workflow => <article className="nd-card nd-card-body" key={`workflow-${workflow.id}`}><p className="nd-eyebrow">WORKFLOW</p><h3><Link href={`/workflows/${workflow.id}`}>{workflow.title}</Link></h3><p>{workflow.description}</p></article>)}
      {guides.map(guide => <article className="nd-card nd-card-body" key={`guide-${guide.slug}`}><p className="nd-eyebrow">WRITTEN GUIDE</p><h3><Link href={`/guides/${guide.slug}`}>{guide.title}</Link></h3></article>)}
      {tutorials.map(tutorial => <article className="nd-card nd-card-body" key={`tutorial-${tutorial.slug}`}><p className="nd-eyebrow">VIDEO TUTORIAL</p><h3><Link href={`/tutorials/${tutorial.slug}`}>{tutorial.title}</Link></h3><p>{tutorial.description}</p></article>)}
    </div>
  </section>;
}

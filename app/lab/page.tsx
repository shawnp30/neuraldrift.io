import Link from "next/link";
import { EXECUTIONS, HARDWARE_PROFILES, evidenceFreshness } from "@/lib/hardware/executions";
import { CATALOG } from "@/lib/catalog";
import { pageMeta } from "@/lib/seo";
import { getRelatedGuides, getRelatedTutorials } from "@/lib/relationships";
import { PRODUCTION_PACKS } from "@/lib/monetization";
import { PremiumPackInterest } from "@/components/monetization/PremiumPackInterest";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";

export const metadata = pageMeta(
  "/lab",
  "NeuralDrift Lab — Local AI Execution Evidence",
  "Review NeuralDrift's recorded local ComfyUI executions, hardware profiles, current workflow hashes, and known blockers."
);

export default function LabPage() {
  const current = EXECUTIONS.filter((record) => record.outcome === "SUCCESS" && evidenceFreshness(record) === "CURRENT");
  const failures = EXECUTIONS.filter((record) => record.outcome === "FAILURE" || record.outcome === "INDETERMINATE");
  const latest = [...current].sort((a, b) => b.testDate.localeCompare(a.testDate)).slice(0, 12);
  const workflowTitle = new Map(CATALOG.map((workflow) => [workflow.id, workflow.title]));

  return <div className="nd-site"><div className="nd-shell nd-page">
    <header className="nd-section"><p className="nd-eyebrow">NEURALDRIFT LAB / EVIDENCE</p><h1>What has actually run?</h1><p className="nd-lead">A transparent index of recorded local executions. A catalog estimate is never presented as a physical test.</p><div className="nd-actions"><Link className="nd-button" href="/workflows">Browse workflows</Link><Link className="nd-text-link" href="/compatibility">Read compatibility policy →</Link></div></header>
    <section className="nd-grid nd-section">
      <div className="nd-card nd-card-body"><p className="nd-eyebrow">CURRENT SUCCESSFUL RUNS</p><h2>{current.length}</h2><p>Execution records whose workflow hash still matches the downloadable graph.</p></div>
      <div className="nd-card nd-card-body"><p className="nd-eyebrow">OBSERVED HARDWARE</p><h2>{HARDWARE_PROFILES.length}</h2><p>Hardware profiles represented in the evidence registry.</p></div>
      <div className="nd-card nd-card-body"><p className="nd-eyebrow">FAILURES / BLOCKERS</p><h2>{failures.length}</h2><p>Failures remain visible rather than being replaced with success-shaped fallbacks.</p></div>
    </section>
    <section className="nd-section"><h2>Latest current tests</h2>{latest.length ? <div className="nd-grid">{latest.map((record) => { const hardware = HARDWARE_PROFILES.find((profile) => profile.id === record.hardwareProfileId); const source = { title: workflowTitle.get(record.workflowId) || record.workflowId, tags: [], description: "" }; const guides = getRelatedGuides(source, 1); const tutorials = getRelatedTutorials(source, 1); return <article className="nd-card nd-card-body" key={record.id}><p className="nd-eyebrow">{record.testDate}</p><h3><Link href={`/workflows/${record.workflowId}`}>{workflowTitle.get(record.workflowId) || record.workflowId}</Link></h3><p>{hardware?.name || "Hardware profile not attributed"}{record.runtimeSeconds == null ? "" : ` · ${record.runtimeSeconds.toFixed(2)}s`}</p><p className="nd-subtle">Evidence status: CURRENT · {record.executionProfile}</p><div className="nd-actions"><Link className="nd-text-link" href="/compatibility">Compatibility →</Link>{guides[0] && <Link className="nd-text-link" href={`/guides/${guides[0].slug}`}>Guide →</Link>}{tutorials[0] && <Link className="nd-text-link" href={`/tutorials/${tutorials[0].slug}`}>Tutorial →</Link>}</div></article>; })}</div> : <p className="nd-subtle">No current successful execution records are available.</p>}</section>
    <section className="nd-section nd-prose"><h2>Evidence methodology</h2><p>Current evidence requires a successful recorded execution and a matching workflow hash. Test dates, environment details, model hashes, artifacts, and failures are shown only when present in the source record.</p></section>
    <NewsletterSignup source="lab" />
    {PRODUCTION_PACKS.map((pack) => <section className="nd-card nd-card-body" key={pack.id}><p className="nd-eyebrow">FUTURE PRODUCT / INTEREST ONLY</p><h2>{pack.name}</h2><p>Potential production documentation built from existing workflow assets. No checkout, price, or delivery is active.</p><p className="nd-subtle">Current workflow assets: {pack.workflowIds.join(", ")}. Missing: {pack.missingAssets.join(", ")}.</p><PremiumPackInterest packName={pack.name} /></section>)}
  </div></div>;
}

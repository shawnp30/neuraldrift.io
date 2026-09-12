import { CATALOG } from "@/lib/catalog";
import type { WorkflowEntry } from "@/lib/workflowsData";
import { getGuides } from "@/lib/guides";
import { TUTORIALS, type Tutorial } from "@/lib/tutorials";
import { EXECUTIONS, evidenceFreshness, type ExecutionRecord } from "@/lib/hardware/executions";

type TopicSource = { title: string; description?: string; tags?: string[] };

function terms(source: TopicSource): string[] {
  return `${source.title} ${source.description || ""} ${(source.tags || []).join(" ")}`
    .toLowerCase().split(/[^a-z0-9]+/).filter(term => term.length > 3);
}

function score(source: TopicSource, candidate: TopicSource): number {
  const sourceTerms = new Set(terms(source));
  return terms(candidate).reduce((total, term) => total + (sourceTerms.has(term) ? 1 : 0), 0);
}

export function getRelatedWorkflows(source: TopicSource, limit = 3): WorkflowEntry[] {
  return CATALOG.map((workflow, index) => ({ workflow, index, score: score(source, workflow) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit).map(item => item.workflow);
}

export function getRelatedTutorials(source: TopicSource, limit = 3): Tutorial[] {
  return TUTORIALS.map((tutorial, index) => ({ tutorial, index, score: score(source, tutorial) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit).map(item => item.tutorial);
}

export function getRelatedGuides(source: TopicSource, limit = 3) {
  return getGuides().map((guide, index) => ({ guide, index, score: score(source, guide) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit).map(item => item.guide);
}

export function getRelatedLabEvidence(workflowId: string, limit = 3): ExecutionRecord[] {
  return EXECUTIONS.filter(record => record.workflowId === workflowId && record.outcome === "SUCCESS" && evidenceFreshness(record) === "CURRENT").slice(0, limit);
}

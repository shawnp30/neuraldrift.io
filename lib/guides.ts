import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

// These legacy guides contain configuration-specific hardware, runtime, or
// commercial claims without an accompanying NeuralDrift execution record or
// primary-source review. They remain available as references, but must not be
// promoted as canonical search content until that editorial work is complete.
export const INDEXABILITY_HOLD_GUIDES = new Set([
  'comfyui-complete-setup',
  'ltx-video-cinematic-action',
  'train-flux-lora',
]);

export function isIndexableGuide(slug: string) {
  return !INDEXABILITY_HOLD_GUIDES.has(slug);
}

export function getGuides() {
  return readdirSync(join(process.cwd(), 'content/guides')).filter(file => file.endsWith('.mdx')).map(file => {
    const { data } = matter(readFileSync(join(process.cwd(), 'content/guides', file), 'utf8'));
    return { slug: file.slice(0, -4), title: String(data.title || file.slice(0, -4)), description: String(data.description || ''), tags: Array.isArray(data.tags) ? data.tags.map(String) : [], publishedAt: data.publishedAt ? String(data.publishedAt) : undefined };
  });
}

export function getIndexableGuides() {
  return getGuides().filter((guide) => isIndexableGuide(guide.slug));
}

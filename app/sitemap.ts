import type { MetadataRoute } from 'next';
import { CATALOG, WORKFLOW_TESTS } from '@/lib/catalog';
import { getIndexableGuides } from '@/lib/guides';
import { SITE_URL } from '@/lib/seo';
import { TUTORIALS } from '@/lib/tutorials';
import { getNewsletterIssues } from '@/lib/newsletterIssues';
import { TRACKED_MODELS } from '@/lib/emergingModels';
import { getAllBenchmarks } from '@/lib/benchmarks/registry';

// Static, canonical public pages (each carries its own pageMeta()-based canonical/OG
// metadata). Intentionally NOT included, with reasons:
// - /api/*, /admin/*, /dashboard, /auth/*, /stash — private, API, or personalized.
// - /optimizer/result, /proofs/upload — personalized/auth-gated result pages, not
//   canonical content. They have an explicit noindex directive in addition to
//   sitemap exclusion.
// - /train, /cloud-generators — no canonical metadata wired up and not linked from
//   primary navigation; not part of this pass's public content surface.
// - /models/[...slug] — client-only mock/placeholder detail data (not real content).
// - /pricing — describes a paid tier with no working checkout; not ready to index.
// - /guides/best-workflows-8gb — placeholder stub outside the real content/guides system.
// - /tools/benchmark-lookup, /gpu-guide/runpod, /workflows/create, /lora-training —
//   contain estimates, example data, or simulated behavior without evidence sufficient
//   for an indexed canonical page.
const STATIC_PATHS = [
  '/',
  '/workflows',
  '/guides',
  '/compatibility',
  '/hardware',
  '/hardware/rtx-5080',
  '/gpu-guide',
  '/tools',
  '/tools/vram-calculator',
  '/tools/caption-generator',
  '/tutorials',
  '/tutorials/stable-diffusion-basics',
  '/tutorials/monetizing-comfyui',
  '/lab',
  '/lab/compare',
  '/about',
  '/glossary',
  '/privacy',
  '/terms',
  '/changelog',
  '/optimizer',
  '/optimizer/fix-my-pc',
  '/prompt-generator',
  '/proofs',
  '/newsletter',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const guides = getIndexableGuides();
  const newsletterIssues = getNewsletterIssues();

  const entries: MetadataRoute.Sitemap = [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...TUTORIALS.map((t) => ({ url: `${SITE_URL}/tutorials/${t.slug}` })),
    ...guides.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}`,
      ...(g.publishedAt ? { lastModified: g.publishedAt } : {}),
    })),
    ...CATALOG.map((w) => {
      const testDate = WORKFLOW_TESTS[w.id]?.testDate;
      return { url: `${SITE_URL}/workflows/${w.id}`, ...(testDate ? { lastModified: testDate } : {}) };
    }),
    ...newsletterIssues.map((issue) => ({
      url: `${SITE_URL}/newsletter/${issue.slug}`,
      lastModified: issue.publishedAt,
    })),
    ...TRACKED_MODELS.map((model) => ({ url: `${SITE_URL}/lab/${model.slug}` })),
    ...getAllBenchmarks().map((benchmark) => ({
      url: `${SITE_URL}/lab/benchmarks/${benchmark.id}`,
      lastModified: benchmark.timestamp.slice(0, 10),
    })),
  ];

  const seen = new Set<string>();
  return entries.filter((entry) => (seen.has(entry.url) ? false : (seen.add(entry.url), true)));
}

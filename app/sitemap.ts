import type { MetadataRoute } from 'next';
import { CATALOG, WORKFLOW_TESTS } from '@/lib/catalog';
import { getGuides } from '@/lib/guides';
import { SITE_URL } from '@/lib/seo';
import { TUTORIALS } from '@/lib/tutorials';
import { getNewsletterIssues } from '@/lib/newsletterIssues';

// Static, canonical public pages (each carries its own pageMeta()-based canonical/OG
// metadata). Intentionally NOT included, with reasons:
// - /api/*, /admin/*, /dashboard, /auth/*, /stash — private, API, or personalized.
// - /optimizer/result, /proofs/upload — personalized/auth-gated result pages, not
//   canonical content (/proofs/upload also gets a real noindex via middleware's
//   X-Robots-Tag header). NOTE: see the final report — public/robots.txt (the file
//   Next.js actually serves) has drifted from app/robots.ts's intended disallow list
//   and does not currently cover /admin/, /auth/, /stash, or /optimizer/result; that
//   is a separate, pre-existing issue this change does not touch.
// - /train, /cloud-generators — no canonical metadata wired up and not linked from
//   primary navigation; not part of this pass's public content surface.
// - /models/[...slug] — client-only mock/placeholder detail data (not real content).
// - /pricing — describes a paid tier with no working checkout; not ready to index.
// - /guides/best-workflows-8gb — placeholder stub outside the real content/guides system.
const STATIC_PATHS = [
  '/',
  '/workflows',
  '/workflows/create',
  '/guides',
  '/compatibility',
  '/hardware',
  '/hardware/rtx-5080',
  '/gpu-guide',
  '/tools',
  '/tools/vram-calculator',
  '/tools/benchmark-lookup',
  '/tools/caption-generator',
  '/models',
  '/tutorials',
  '/tutorials/stable-diffusion-basics',
  '/tutorials/monetizing-comfyui',
  '/lab',
  '/about',
  '/glossary',
  '/privacy',
  '/terms',
  '/changelog',
  '/optimizer',
  '/optimizer/fix-my-pc',
  '/prompt-generator',
  '/lora-training',
  '/datasets',
  '/proofs',
  '/newsletter',
];

// /gpu-guide/[id] only has real (non-fallback) content for these ids today.
const GPU_GUIDE_IDS = ['runpod'];

export default function sitemap(): MetadataRoute.Sitemap {
  const guides = getGuides();
  const newsletterIssues = getNewsletterIssues();

  const entries: MetadataRoute.Sitemap = [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...GPU_GUIDE_IDS.map((id) => ({ url: `${SITE_URL}/gpu-guide/${id}` })),
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
  ];

  const seen = new Set<string>();
  return entries.filter((entry) => (seen.has(entry.url) ? false : (seen.add(entry.url), true)));
}

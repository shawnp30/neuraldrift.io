import type { MetadataRoute } from 'next';
import { CATALOG } from '@/lib/catalog';
import { getGuides } from '@/lib/guides';
import { SITE_URL } from '@/lib/seo';
import { TUTORIALS } from '@/lib/tutorials';
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', '/workflows', '/guides', '/compatibility', '/hardware', '/gpu-guide', '/tools', '/tools/vram-calculator', '/models', '/tutorials', '/lab', '/tutorials/stable-diffusion-basics', '/tutorials/monetizing-comfyui', '/about', '/glossary', ...TUTORIALS.map(t => `/tutorials/${t.slug}`), ...getGuides().map(g => `/guides/${g.slug}`), ...CATALOG.map(w => `/workflows/${w.id}`)];
  return [...new Set(paths)].map(path => ({ url: `${SITE_URL}${path}` }));
}

import type { MetadataRoute } from 'next';
import { CATALOG } from '@/lib/catalog';
import { getGuides } from '@/lib/guides';
import { SITE_URL } from '@/lib/seo';
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', '/workflows', '/guides', '/compatibility', '/hardware', '/gpu-guide', '/tools', '/tools/vram-calculator', '/models', '/tutorials', '/tutorials/stable-diffusion-basics', '/tutorials/monetizing-comfyui', '/about', '/glossary', ...getGuides().map(g => `/guides/${g.slug}`), ...CATALOG.map(w => `/workflows/${w.id}`)];
  return [...new Set(paths)].map(path => ({ url: `${SITE_URL}${path}` }));
}

import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://neuraldrift.io'

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/workflows`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/tutorials`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/gpu-guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/loras`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/datasets`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/tools`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/tools/vram-calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/tools/benchmark-lookup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/tools/caption-generator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/prompt-generator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/optimizer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]
}

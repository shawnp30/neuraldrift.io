import type { MetadataRoute } from 'next'
import { readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { WORKFLOWS } from '@/lib/workflowsData'

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://neuraldrift.io'
  
  // Dynamic Guide Slugs
  const guidesDir = join(process.cwd(), 'content/guides')
  let guideUrls: MetadataRoute.Sitemap = []
  
  if (existsSync(guidesDir)) {
    const files = readdirSync(guidesDir)
    guideUrls = files
      .filter(f => f.endsWith('.mdx'))
      .map(f => ({
        url: `${base}/guides/${f.replace('.mdx', '')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8
      }))
  }

  // Dynamic Workflow Slugs
  const workflowUrls: MetadataRoute.Sitemap = WORKFLOWS.map(w => ({
    url: `${base}/workflows/${w.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9
  }))

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/workflows`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/tutorials`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/tutorials/monetizing-comfyui`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/tutorials/stable-diffusion-basics`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/hardware`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/lora-training`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/datasets`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/prompt-generator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/models`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/gpu-guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/tools`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/cloud-generators`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  return [...staticPages, ...guideUrls, ...workflowUrls]
}

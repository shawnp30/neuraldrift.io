import type { MetadataRoute } from "next";
import { readdirSync, existsSync } from "fs";
import { join } from "path";
import { WORKFLOWS } from "@/lib/workflowsData";

const base = "https://neuraldrift.io";

function entry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] = "weekly"
): MetadataRoute.Sitemap[0] {
  const url =
    path === "/" ? `${base}/` : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  return {
    url,
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const guidesDir = join(process.cwd(), "content/guides");
  let guideUrls: MetadataRoute.Sitemap = [];

  if (existsSync(guidesDir)) {
    const files = readdirSync(guidesDir);
    guideUrls = files
      .filter((f) => f.endsWith(".mdx"))
      .map((f) =>
        entry(`/guides/${f.replace(".mdx", "")}`, 0.8, "weekly")
      );
  }

  const workflowUrls: MetadataRoute.Sitemap = WORKFLOWS.map((w) =>
    entry(`/workflows/${w.id}`, 0.9, "weekly")
  );

  // Only list URLs that return 200 at that path (no redirect-only sources).
  const staticPages: MetadataRoute.Sitemap = [
    entry("/", 1, "weekly"),
    entry("/workflows", 0.9, "weekly"),
    entry("/workflows/create", 0.85, "weekly"),
    entry("/guides", 0.9, "weekly"),
    entry("/guides/best-workflows-8gb", 0.75, "monthly"),
    entry("/gpu-guide", 0.85, "weekly"),
    entry("/gpu-guide/runpod", 0.7, "monthly"),
    entry("/tools", 0.75, "monthly"),
    entry("/tools/vram-calculator", 0.8, "monthly"),
    entry("/tools/benchmark-lookup", 0.75, "monthly"),
    entry("/tools/caption-generator", 0.75, "monthly"),
    entry("/prompt-generator", 0.8, "weekly"),
    entry("/hardware", 0.9, "weekly"),
    entry("/optimizer", 0.8, "weekly"),
    entry("/optimizer/fix-my-pc", 0.65, "monthly"),
    entry("/optimizer/result", 0.5, "monthly"),
    entry("/dashboard", 0.5, "monthly"),
    entry("/datasets", 0.75, "weekly"),
    entry("/lora-training", 0.75, "weekly"),
    entry("/proofs", 0.65, "weekly"),
    entry("/proofs/upload", 0.55, "monthly"),
    entry("/models", 0.75, "monthly"),
    entry("/cloud-generators", 0.7, "monthly"),
    entry("/tutorials", 0.8, "weekly"),
    entry("/tutorials/monetizing-comfyui", 0.7, "monthly"),
    entry("/tutorials/stable-diffusion-basics", 0.7, "monthly"),
    entry("/about", 0.5, "yearly"),
    entry("/changelog", 0.5, "weekly"),
    entry("/pricing", 0.5, "monthly"),
    entry("/glossary", 0.55, "monthly"),
  ];

  return [...staticPages, ...guideUrls, ...workflowUrls];
}

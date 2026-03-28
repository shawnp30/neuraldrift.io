import { NextResponse } from "next/server";

const SEARCH_QUERIES = [
  "stable-diffusion",
  "flux",
  "sdxl",
  "lora",
  "comfyui",
  "diffusion",
  "text-to-image",
  "image-generation",
];

const HF_API = "https://huggingface.co/api/datasets";

async function fetchDatasets(search: string): Promise<any[]> {
  const url = `${HF_API}?search=${encodeURIComponent(search)}&sort=downloads&direction=-1&limit=30`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export async function GET() {
  try {
    const results = await Promise.all(SEARCH_QUERIES.map(fetchDatasets));
    const seen = new Set<string>();
    const datasets: any[] = [];

    for (const batch of results) {
      for (const ds of batch) {
        if (!seen.has(ds.id)) {
          seen.add(ds.id);
          datasets.push({
            id: ds.id,
            description: ds.description,
            tags: ds.tags,
            downloads: ds.downloads,
            likes: ds.likes,
            lastModified: ds.lastModified,
          });
        }
      }
    }

    // Sort by downloads descending
    datasets.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));

    return NextResponse.json(datasets);
  } catch (err: any) {
    console.error("HF Hub Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

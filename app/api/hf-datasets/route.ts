import { listDatasets } from "@huggingface/hub";
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

export async function GET() {
  try {
    const seen = new Set<string>();
    const datasets: any[] = [];

    for (const search of SEARCH_QUERIES) {
      for await (const dataset of listDatasets({ search, limit: 30 })) {
        if (!seen.has(dataset.id)) {
          seen.add(dataset.id);
          datasets.push(dataset);
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

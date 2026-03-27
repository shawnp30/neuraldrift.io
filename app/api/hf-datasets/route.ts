import { listDatasets } from "@huggingface/hub";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch top 200 datasets for a comprehensive initial catalog
    const datasets = [];
    for await (const dataset of listDatasets({ limit: 200 })) {
      datasets.push(dataset);
    }
    
    return NextResponse.json(datasets);
  } catch (err: any) {
    console.error("HF Hub Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

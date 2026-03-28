import { listModels } from "@huggingface/hub";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch top 100 LoRA models
    const models = [];
    for await (const model of listModels({
      limit: 100,
      tags: ["lora", "diffusers"],
      sort: "downloads",
      direction: -1,
    })) {
      models.push(model);
    }
    
    return NextResponse.json(models);
  } catch (err: any) {
    console.error("HF Hub Model Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

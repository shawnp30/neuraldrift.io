import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import fs from "fs/promises";
import path from "path";

/**
 * SECTION 4 — Create LoRA Training Dataset Generator
 * Generates training images using HF API and captions them with BLIP.
 */
export async function POST(req: Request) {
  try {
    const { category, count, style, seedPrompt } = await req.json();
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return NextResponse.json({ error: "HF_TOKEN missing" }, { status: 401 });
    }

    const hf = new HfInference(HF_TOKEN);
    const datasetDir = path.join(process.cwd(), "data", "datasets", category);
    await fs.mkdir(datasetDir, { recursive: true });

    const results = [];

    for (let i = 0; i < (count || 5); i++) {
      const prompt = `${seedPrompt || category}, ${style || "high quality photography"}`;

      // 1. Generate Image
      const imgBlob = (await hf.textToImage({
        model: "black-forest-labs/FLUX.1-schnell",
        inputs: prompt,
      })) as unknown as Blob;

      const buffer = Buffer.from(await imgBlob.arrayBuffer());
      const fileName = `img_${Date.now()}_${i}.png`;
      const filePath = path.join(datasetDir, fileName);
      await fs.writeFile(filePath, buffer);

      // 2. Caption Image using BLIP
      const captionResponse = await hf.imageToText({
        model: "Salesforce/blip-image-captioning-base",
        data: imgBlob,
      });

      results.push({
        image: fileName,
        caption: captionResponse.generated_text,
        prompt,
      });
    }

    // Save metadata.json
    await fs.writeFile(
      path.join(datasetDir, "metadata.json"),
      JSON.stringify(results, null, 2)
    );

    return NextResponse.json({
      status: "dataset_generated",
      count: results.length,
      path: `/data/datasets/${category}`,
    });
  } catch (error: any) {
    console.error("Dataset Gen Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

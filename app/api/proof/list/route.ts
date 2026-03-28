// app/api/proof/list/route.ts
// Returns all proof images from Vercel Blob storage
// Used by the /proof gallery page

import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

// Workflow ID → title mapping
const WORKFLOW_TITLES: Record<string, string> = {
  "01-flux-dev-t2i": "FLUX Dev Text-to-Image",
  "02-flux-schnell-fast": "FLUX Schnell Ultra-Fast",
  "03-sdxl-standard": "SDXL Standard",
  "04-sdxl-portrait": "SDXL Portrait Studio",
  "05-sdxl-turbo-fast": "SDXL Turbo — 1-Step",
  "06-sd15-classic": "SD 1.5 Classic",
  "08-sdxl-lora-style": "SDXL + Style LoRA",
  "09-sdxl-landscape": "SDXL Landscape & Nature",
  "10-sd15-anime": "SD 1.5 Anime (AnythingV5)",
  "11-ltx-video-t2v-basic": "LTX Video 2.3 — Basic T2V",
  "12-ltx-video-cinematic": "LTX Video — Cinematic 9:16",
  "13-ltx-video-action-chase": "LTX Video — Action Chase",
  "14-ltx-video-fast-draft": "LTX Video — Fast Draft",
  "15-animatediff-simple": "AnimateDiff Simple Loop",
  "17-animatediff-loop": "AnimateDiff Seamless Loop",
  "18-animatediff-landscape": "AnimateDiff Landscape Timelapse",
  "19-animatediff-product": "AnimateDiff 360 Product Spin",
  "20-animatediff-zoom": "AnimateDiff Slow Zoom",
  "21-upscale-4x-esrgan": "4x ESRGAN Upscale",
  "22-upscale-anime": "4x Anime Upscale",
  "23-sdxl-img2img": "SDXL Image-to-Image",
  "24-sd15-style-transfer": "SD 1.5 Style Transfer",
  "25-sdxl-sketch-to-image": "SDXL Sketch to Photo",
  "26-sdxl-inpainting": "SDXL Inpainting",
  "27-sd15-object-removal": "SD 1.5 Object Removal",
  "28-sdxl-product-shot": "SDXL Product Photography",
  "29-sdxl-architecture": "SDXL Architectural Visualization",
  "30-flux-portrait-v2": "FLUX Portrait v2 — Editorial",
  "31-controlnet-canny-sdxl": "ControlNet Canny — SDXL",
  "32-controlnet-depth-sdxl": "ControlNet Depth — SDXL",
  "33-controlnet-openpose": "ControlNet OpenPose",
  "34-controlnet-lineart": "ControlNet Lineart — Anime",
  "35-controlnet-tile": "ControlNet Tile Upscale",
  "36-sdxl-batch-4": "SDXL Batch ×4 Variations",
  "37-sdxl-batch-8": "SDXL Batch ×8 Grid",
  "38-sdxl-logo-design": "SDXL Logo & Brand Design",
  "39-sdxl-concept-art": "SDXL Character Concept Sheet",
  "40-flux-realistic-person": "FLUX Realistic Person",
  "41-sdxl-interior-design": "SDXL Interior Design",
  "42-sd15-pixel-art": "SD 1.5 Pixel Art Generator",
  "43-sdxl-fashion-design": "SDXL Fashion Design",
  "44-flux-food-photography": "FLUX Food Photography",
  "45-sdxl-sci-fi-scene": "SDXL Sci-Fi Environment",
  "47-sdxl-abstract-art": "SDXL Abstract Art",
  "48-flux-wildlife-photo": "FLUX Wildlife Photography",
  "49-sdxl-night-city": "SDXL Night City Aerial",
  "50-flux-dev-portrait-v2": "FLUX Cinematic Portrait",
};

export const runtime = "edge";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "proof/" });

    const items = blobs.map((blob) => {
      // Extract workflowId from filename: proof/01-flux-dev-t2i-1234567890.jpg
      const filename = blob.pathname.replace("proof/", "");
      // Match the workflow ID pattern (e.g. "01-flux-dev-t2i")
      const match = filename.match(/^(\d{2}-[a-z0-9-]+?)-\d+\./);
      const workflowId = match ? match[1] : "unknown";

      return {
        url: blob.url,
        pathname: blob.pathname,
        workflowId,
        workflowTitle: WORKFLOW_TITLES[workflowId] || workflowId,
        caption: "", // Could be stored in blob metadata in future
        type: blob.pathname.endsWith(".mp4") ? "video/mp4" : "image/jpeg",
        uploadedAt: blob.uploadedAt.toISOString(),
        size: blob.size,
      };
    });

    // Sort newest first
    items.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not list uploads. Check BLOB_READ_WRITE_TOKEN env var.",
        items: [],
      },
      { status: 500 }
    );
  }
}

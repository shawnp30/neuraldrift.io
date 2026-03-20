import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const VALID_IDS = [
  "ltx-cinematic-chase",
  "flux-portrait-lora",
  "sdxl-concept-batch",
  "animatediff-character-loop",
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!VALID_IDS.includes(id)) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const templatePath = join(process.cwd(), "data/comfy-templates", `${id}.json`);

  if (!existsSync(templatePath)) {
    return NextResponse.json({ error: "Template file not found" }, { status: 404 });
  }

  const template = readFileSync(templatePath, "utf-8");

  return new NextResponse(template, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

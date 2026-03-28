import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

/**
 * Custom route to serve generated training images from /data/datasets
 */
export async function GET(
  req: Request,
  { params }: { params: { path: string[] } }
) {
  const filePath = path.join(process.cwd(), "data", "datasets", ...params.path);

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === ".png" ? "image/png" : "image/jpeg";

    return new Response(file, {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    return new Response("Image not found", { status: 404 });
  }
}

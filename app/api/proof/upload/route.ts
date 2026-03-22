// app/api/proof/upload/route.ts
// Handles image uploads for the workflow proof gallery
// Uses Vercel Blob for storage — install with: npm install @vercel/blob
// Add BLOB_READ_WRITE_TOKEN to your Vercel environment variables



   import { put } from "@vercel/blob";

   const { url } = await put('articles/blob.txt', 'Hello World!', { access: 'public' });



export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const workflowId = formData.get("workflowId") as string;
    const caption = formData.get("caption") as string || "";

    if (!file || !workflowId) {
      return NextResponse.json(
        { error: "Missing file or workflowId" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "video/mp4"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WebP images and MP4 videos are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (50MB max for video, 10MB for images)
    const maxSize = file.type.startsWith("video/") ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size: ${file.type.startsWith("video/") ? "50MB" : "10MB"}` },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop();
    const filename = `proof/${workflowId}-${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // Return the URL and metadata
    return NextResponse.json({
      success: true,
      url: blob.url,
      workflowId,
      caption,
      filename: blob.pathname,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Check BLOB_READ_WRITE_TOKEN is set in Vercel env vars." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();
    const { del } = await import("@vercel/blob");
    await del(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

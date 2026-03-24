"use server";

import { put } from "@vercel/blob";
import { createClient } from "@/lib/supabase/server";

export async function uploadWorkflow(formData: FormData) {
  try {
    const imageFile = formData.get("image") as File;
    const jsonFile = formData.get("json") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const tagsStr = formData.get("tags") as string;
    const videoUrl = formData.get("video_url") as string;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Upload image to Vercel Blob Storage
    let preview_image = "";
    if (imageFile && imageFile.size > 0) {
      const blob = await put(`previews/${imageFile.name}`, imageFile, {
        access: 'public',
      });
      preview_image = blob.url;
    } else {
      throw new Error("Preview image is required.");
    }

    // Upload JSON to Vercel Blob Storage
    let download_url = "";
    if (jsonFile && jsonFile.size > 0) {
      const blob = await put(`workflows/${jsonFile.name}`, jsonFile, {
        access: 'public',
      });
      download_url = blob.url;
    } else {
      throw new Error("Workflow JSON file is required.");
    }

    // Process tags
    const tags = tagsStr.split(",").map(t => t.trim()).filter(Boolean);

    // Insert into Supabase
    const supabase = createClient();
    const { error } = await supabase.from("workflows").insert({
      name,
      slug,
      description,
      tags,
      preview_image,
      preview_video: videoUrl || null,
      download_url
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, slug };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

import { listModels } from "@huggingface/hub";
import { NextResponse } from "next/server";
import { cleanModelDisplay } from "@/utils/modelNames";

export async function GET() {
  try {
    const models = [];
    const genAI = new (require("@google/generative-ai").GoogleGenerativeAI)(
      process.env.GOOGLE_AI_API_KEY || ""
    );
    const generativeModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    for await (const m of listModels({
      limit: 100,
      sort: "downloads",
      full: true,
    } as any)) {
      const model = m as any;
      const modelId = model.name; // model.name is the 'author/repo-name'; model.id is the MongoDB _id

      let description =
        model.cardData?.instance_prompt || model.description || "";

      if (!description && model.tags) {
        try {
          const tagContext = model.tags.slice(0, 5).join(", ");
          const result = await generativeModel.generateContent(
            `Generate a catchy 1-sentence description for an AI model with these tags: ${tagContext}, ID: ${modelId}. Focus on utility.`
          );
          description = result.response.text().trim();
        } catch (e) {
          description =
            "Advanced neural architecture optimized for high-performance inference.";
        }
      }

      // STRICT OVERRIDE: Map clean data properties
      models.push({
        id: modelId, // Author/Repo
        modelId: modelId, // Author/Repo
        displayName: cleanModelDisplay(modelId),
        title: model.cardData?.title,
        author: modelId.includes("/") ? modelId.split("/")[0] : "HuggingFace",
        pipeline_tag: model.pipeline_tag || model.task,
        downloads: model.downloads,
        likes: model.likes,
        updatedAt: model.updatedAt,
        baseModel: model.cardData?.base_model || "FLUX",
        description: description.substring(0, 120),
      });
    }

    return NextResponse.json(models);
  } catch (err: any) {
    console.error("HF Models Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

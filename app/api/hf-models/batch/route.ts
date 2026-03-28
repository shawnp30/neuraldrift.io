import { listModels } from "@huggingface/hub";
import { NextResponse } from "next/server";
import { cleanModelDisplay } from "@/utils/modelNames";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    const models = [];
    const genAI = new (require("@google/generative-ai").GoogleGenerativeAI)(
      process.env.GOOGLE_AI_API_KEY || ""
    );
    const generativeModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    for (const id of ids) {
      try {
        const results = listModels({
          search: { modelId: id },
          limit: 1,
          full: true,
        } as any);

        for await (const m of results) {
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

          models.push({
            id: modelId,
            modelId: modelId,
            displayName: cleanModelDisplay(modelId),
            title: model.cardData?.title,
            author: modelId.includes("/")
              ? modelId.split("/")[0]
              : "HuggingFace",
            pipeline_tag: model.pipeline_tag || model.task,
            downloads: model.downloads,
            likes: model.likes,
            updatedAt: model.updatedAt,
            baseModel: model.cardData?.base_model || "FLUX",
            description: description.substring(0, 120),
          });
        }
      } catch (e) {
        console.error(`Error fetching model ${id}:`, e);
      }
    }

    return NextResponse.json(models);
  } catch (err: any) {
    console.error("Batch HF Models Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

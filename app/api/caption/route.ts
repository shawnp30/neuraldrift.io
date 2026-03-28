import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const prompt =
      "Generate a concise, high-fidelity descriptive caption for this image for use in training an AI model. Focus on the subject, style, and key visual elements. Do not use conversational filler.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: file.type,
        },
      },
    ]);

    const caption = result.response.text();

    return NextResponse.json({ caption });
  } catch (error: any) {
    console.error("Gemini Captioning Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

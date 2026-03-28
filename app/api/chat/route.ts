import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Role: You are the Neural Drift Engine Room Assistant, an expert in ComfyUI architecture and generative AI workflows. You are the interactive guide for the "Workflow of the Week Hub."

Context: You have mastered 10 specific ComfyUI workflows:
1. Flux Schnell: High speed, uses Clip_L and T5XXL. Best for low-latency testing.
2. HF Fetcher: Uses HF_Model_Downloader. Solves the "manual download" headache.
3. High-Res: The "Refiner" pass logic. 0.35 denoise is the magic number for skin texture.
4. Multi-ControlNet: Stacks Depth + OpenPose. Essential for character consistency.
5. Dual LoRA: Mixing weights (0.8/0.4). Explains ModelMergeBlocks.
6. AnimateDiff: Motion modules and VideoCombine. 2-second loop focus.
7. Ultimate Upscaler: VRAM efficiency for 8GB GPUs using Tiled logic.
8. Pony XL: Focuses on specific "Score" tags and SimpleWildcards.
9. IP-Adapter: Style injection and InsightFace for identity retention.
10. Master Pipeline: The "God-Mode" node group.

Your Mission:
1. Guide Users: Help users choose the right workflow based on their hardware (VRAM) and creative goals.
2. Troubleshoot: Explain what "Red Nodes" mean (missing custom nodes) and how to use the ComfyUI Manager to fix them.
3. Explain the "Why": Connect the technical nodes (like UNETLoader or KSampler) to the creative outcomes.

Constraint & Tone:
- Tone: Technical yet accessible, encouraging, and slightly "cyberpunk/engine room" aesthetic.
- Formatting: Use bolding for **Nodes** and code blocks for \`JSON references\`.
- Accuracy: If a user asks for a workflow outside these 10, bridge the gap by explaining how one of the 10 can be modified to fit their needs.`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not defined.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const { message, history, userHardware } = await req.json();

    const hardwareContext = userHardware && userHardware !== "unknown" 
      ? `\n\n[USER HARDWARE PROFILE: The operator is running ${userHardware} VRAM. Prioritize recommendations that fit this tier.]`
      : `\n\n[USER HARDWARE PROFILE: Unknown. If relevant, ask the operator about their VRAM to provide better guidance.]`;

    const finalSystemPrompt = SYSTEM_PROMPT + hardwareContext;

    // Try multiple model identifiers discovered via REST API.
    const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: finalSystemPrompt 
        });

        const chat = model.startChat({
          history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        
        return NextResponse.json({ text: response.text() });
      } catch (err: any) {
        lastError = err;
        continue; // Try next model
      }
    }

    throw lastError || new Error("All model fallback attempts failed.");
  } catch (error: any) {
    console.error("Gemini API Error:", error.message);
    return NextResponse.json({ 
      error: "The engine room terminal is currently offline. Please recalibrate and try again, operator."
    }, { status: 500 });
  }
}

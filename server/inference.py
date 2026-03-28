from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
from peft import PeftModel
import os

app = FastAPI()

# SECTION 7 — Implement Optional Local GPU Inference Server
# Loads base model + LoRA adapter with PEFT

class GenerateRequest(BaseModel):
    base_model: str = "stabilityai/stable-diffusion-xl-base-1.0"
    lora_adapter: str = None
    prompt: str
    num_inference_steps: int = 30

@app.get("/")
def read_root():
    return {"status": "Neuraldrift Inference Server Active", "gpu": torch.cuda.is_available()}

@app.post("/generate")
async def generate(request: GenerateRequest):
    if not torch.cuda.is_available():
        raise HTTPException(status_code=500, detail="No GPU available for local inference")

    try:
        # 1. Load Base Model
        pipe = StableDiffusionXLPipeline.from_pretrained(
            request.base_model, 
            torch_dtype=torch.float16, 
            variant="fp16",
            use_safetensors=True
        ).to("cuda")
        
        # 2. Add LoRA if provided
        if request.lora_adapter:
            # Note: request.lora_adapter could be a path or HF ID
            pipe.load_lora_weights(request.lora_adapter)

        # 3. Generate
        image = pipe(prompt=request.prompt, num_inference_steps=request.num_inference_steps).images[0]
        
        # Save placeholder
        output_path = f"data/merged/gen_{torch.randint(0, 1000000, (1,)).item()}.png"
        os.makedirs("data/merged", exist_ok=True)
        image.save(output_path)

        return {"status": "success", "url": output_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train(category: str):
    # SECTION 8 — Placeholder for LoRA Training Launcher
    # Would trigger subprocess for 'accelerate launch train_network.py'
    return {"status": "training_started", "category": category, "eta": "5m"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

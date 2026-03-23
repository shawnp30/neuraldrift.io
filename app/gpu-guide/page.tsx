// app/gpu-guide/page.tsx
// GPU Compatibility Guide + Model Reference
// Data sourced from: ComfyUI official GitHub wiki, NVIDIA RTX AI Garage,
// Spheron benchmarks (March 2026), ComfyUI docs, community testing

import Link from "next/link";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const GPU_TIERS = [
  // ── S TIER — NVIDIA (Ampere+) ───────────────────────────────────────────────
  {
    tier: "S",
    tierLabel: "Best",
    tierColor: "#22c55e",
    brand: "NVIDIA",
    arch: "Blackwell (50 series)",
    precision: "fp16 · bf16 · fp8 · fp4",
    gpus: [
      {
        name: "RTX 5090",
        vram: "32GB",
        price: "~$2,000",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "Best consumer GPU. fp4 support = huge speed. 32GB handles everything except Wan 2.1 14B / HunyuanVideo in BF16.",
      },
      {
        name: "RTX 5080",
        vram: "16GB",
        price: "~$1,000",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "neuraldrift primary test GPU. GDDR7 bandwidth close to H100. fp8 + fp4 native. All image/video workflows run clean.",
      },
    ],
  },
  {
    tier: "S",
    tierLabel: "Best",
    tierColor: "#22c55e",
    brand: "NVIDIA",
    arch: "Ada Lovelace (40 series)",
    precision: "fp16 · bf16 · fp8",
    gpus: [
      {
        name: "RTX 4090",
        vram: "24GB",
        price: "~$1,600",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "Best previous-gen. 24GB handles FLUX Dev BF16 + LoRA simultaneously. No fp4 but fp8 native. Speed close to 5080.",
      },
      {
        name: "RTX 4080 Super",
        vram: "16GB",
        price: "~$900",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "Same VRAM as 5080. fp8 native. Slightly slower but excellent price/performance ratio.",
      },
      {
        name: "RTX 4070 Ti Super",
        vram: "16GB",
        price: "~$700",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "16GB at mid-range price. All LTX Video and AnimateDiff workflows. FLUX fp8 runs clean.",
      },
      {
        name: "RTX 4070 Super",
        vram: "12GB",
        price: "~$500",
        sdxl: "✓",
        flux: "fp8",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "12GB is the FLUX fp8 sweet spot. LTX Video at 97 frames works. Tight on FLUX Dev BF16.",
      },
      {
        name: "RTX 4070",
        vram: "12GB",
        price: "~$400",
        sdxl: "✓",
        flux: "fp8",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "Same 12GB as 4070 Super, slightly slower. Solid all-rounder for content creators.",
      },
      {
        name: "RTX 4060 Ti 16GB",
        vram: "16GB",
        price: "~$450",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "Underrated. 16GB VRAM in a mid-range GPU. Slower GDDR6 bandwidth but runs full FLUX workflows.",
      },
      {
        name: "RTX 4060 Ti 8GB",
        vram: "8GB",
        price: "~$280",
        sdxl: "✓",
        flux: "GGUF",
        ltxVideo: "limited",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "8GB requires --lowvram for SDXL. FLUX GGUF Q5 works. AnimateDiff 16 frames at 512px. LTX 25 frames max.",
      },
      {
        name: "RTX 4060",
        vram: "8GB",
        price: "~$250",
        sdxl: "✓",
        flux: "GGUF",
        ltxVideo: "limited",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "Entry Ada. Same VRAM situation as 4060 Ti 8GB. Use --lowvram + GGUF quantization.",
      },
    ],
  },
  {
    tier: "S",
    tierLabel: "Best",
    tierColor: "#22c55e",
    brand: "NVIDIA",
    arch: "Ampere (30 series)",
    precision: "fp16 · bf16",
    gpus: [
      {
        name: "RTX 3090",
        vram: "24GB",
        price: "~$700 used",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "Best used GPU value. 24GB + BF16 native. No fp8 hardware acceleration but software fp8 works fine.",
      },
      {
        name: "RTX 3080 16GB",
        vram: "16GB",
        price: "~$350 used",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "neuraldrift secondary test GPU. Fantastic used value. Full FLUX Dev fp8, LTX Video cinematic, all AnimateDiff.",
      },
      {
        name: "RTX 3080 10GB",
        vram: "10GB",
        price: "~$280 used",
        sdxl: "✓",
        flux: "fp8",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "10GB runs FLUX fp8 clean. LTX Video up to 73 frames. Solid used buy.",
      },
      {
        name: "RTX 3070",
        vram: "8GB",
        price: "~$200 used",
        sdxl: "✓",
        flux: "GGUF",
        ltxVideo: "limited",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "8GB needs --lowvram. FLUX GGUF Q4/Q5 only. AnimateDiff 16 frames. Tight but workable.",
      },
      {
        name: "RTX 3060",
        vram: "12GB",
        price: "~$230 used",
        sdxl: "✓",
        flux: "fp8",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "Budget hero. 12GB fits FLUX fp8 and LTX Video 25 frames. Slower CUDA cores but capable.",
      },
      {
        name: "RTX 3060 Ti",
        vram: "8GB",
        price: "~$200 used",
        sdxl: "✓",
        flux: "GGUF",
        ltxVideo: "limited",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "Fast 8GB. Better than 3060 for speed but less VRAM. GGUF FLUX, SD1.5, SDXL 768px.",
      },
    ],
  },
  {
    tier: "S",
    tierLabel: "Best",
    tierColor: "#22c55e",
    brand: "NVIDIA",
    arch: "Turing (20 series)",
    precision: "fp16 only",
    gpus: [
      {
        name: "RTX 2080 Ti",
        vram: "11GB",
        price: "~$200 used",
        sdxl: "✓",
        flux: "fp8 slow",
        ltxVideo: "limited",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "Still works. fp16 hardware, fp8 is software-only (slower). SDXL + AnimateDiff run fine. FLUX fp8 takes 2x longer.",
      },
      {
        name: "RTX 2080 Super",
        vram: "8GB",
        price: "~$150 used",
        sdxl: "✓",
        flux: "GGUF slow",
        ltxVideo: "✗",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "8GB Turing. SDXL 768px with --lowvram. AnimateDiff 16 frames. FLUX GGUF possible but slow.",
      },
      {
        name: "RTX 2070 Super",
        vram: "8GB",
        price: "~$120 used",
        sdxl: "✓",
        flux: "GGUF slow",
        ltxVideo: "✗",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes: "Same situation as 2080 Super. Works for basic SD workflows.",
      },
    ],
  },
  // ── AVOID ────────────────────────────────────────────────────────────────────
  {
    tier: "AVOID",
    tierLabel: "Avoid",
    tierColor: "#ef4444",
    brand: "NVIDIA",
    arch: "Pascal (10 series) & older",
    precision: "fp32 only — no fp16 hardware",
    gpus: [
      {
        name: "GTX 1080 Ti",
        vram: "11GB",
        price: "~$100 used",
        sdxl: "slow",
        flux: "✗",
        ltxVideo: "✗",
        animatediff: "slow",
        hunyuan: "✗",
        wan21: "✗",
        lora: "slow",
        notes:
          "fp32 only = 2-4x slower than Turing. Will be deprecated in CUDA 13. Avoid for AI work.",
      },
      {
        name: "GTX 1080",
        vram: "8GB",
        price: "~$80 used",
        sdxl: "very slow",
        flux: "✗",
        ltxVideo: "✗",
        animatediff: "very slow",
        hunyuan: "✗",
        wan21: "✗",
        lora: "very slow",
        notes:
          "fp32 only. Functional but painful. Being deprecated in CUDA 13. Not recommended.",
      },
      {
        name: "GTX 1070 Ti / 1070",
        vram: "8GB",
        price: "~$60 used",
        sdxl: "✗",
        flux: "✗",
        ltxVideo: "✗",
        animatediff: "✗",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✗",
        notes:
          "Below the line. fp32 only, deprecated soon. Get a 3060 instead.",
      },
      {
        name: "GTX 1660 Ti / 1660",
        vram: "6GB",
        price: "~$80 used",
        sdxl: "SD1.5 only",
        flux: "✗",
        ltxVideo: "✗",
        animatediff: "SD1.5 only",
        hunyuan: "✗",
        wan21: "✗",
        lora: "SD1.5 only",
        notes:
          "Turing architecture but no tensor cores in the 1660 line. SD1.5 works. SDXL marginal. Upgrade when possible.",
      },
    ],
  },
  // ── B TIER — AMD ─────────────────────────────────────────────────────────────
  {
    tier: "B",
    tierLabel: "Good (Linux)",
    tierColor: "#f59e0b",
    brand: "AMD",
    arch: "RDNA 3/4 (7000/9000 series)",
    precision: "fp16 · bf16 (ROCm Linux)",
    gpus: [
      {
        name: "RX 9070 XT",
        vram: "16GB",
        price: "~$600",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "RDNA 4. 'A tier experience' per official ComfyUI wiki on latest ROCm. Linux only for full performance.",
      },
      {
        name: "RX 7900 XTX",
        vram: "24GB",
        price: "~$700",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "Best consumer AMD. 24GB on ROCm Linux nearly matches RTX 3090. Windows ROCm 20-30% slower.",
      },
      {
        name: "RX 7900 XT",
        vram: "20GB",
        price: "~$500",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "20GB is excellent for AI. Linux ROCm highly recommended for this card.",
      },
      {
        name: "RX 7800 XT",
        vram: "16GB",
        price: "~$380",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "Value AMD option. 16GB on ROCm Linux performs well. Windows ROCm stable from 7000 series up.",
      },
    ],
  },
  // ── D TIER — MAC ─────────────────────────────────────────────────────────────
  {
    tier: "D",
    tierLabel: "Slow",
    tierColor: "#7a8a9a",
    brand: "Apple Silicon",
    arch: "M-series (Metal)",
    precision: "fp32 · fp16 (no fp8)",
    gpus: [
      {
        name: "M4 Max (128GB)",
        vram: "128GB unified",
        price: "~$4,000",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "✓",
        hunyuan: "partial",
        wan21: "partial",
        lora: "✓",
        notes:
          "Massive unified memory fits everything. But no fp8 = slower than RTX 4080 for most workflows. macOS quirks break things regularly.",
      },
      {
        name: "M3 Ultra (96GB)",
        vram: "96GB unified",
        price: "~$6,000",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "✓",
        animatediff: "slow",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "Expensive and overkill for ComfyUI. No fp8 hardware means 2-5x slower than equivalent NVIDIA for diffusion.",
      },
      {
        name: "M3 Max (48GB)",
        vram: "48GB unified",
        price: "~$3,500",
        sdxl: "✓",
        flux: "✓",
        ltxVideo: "slow",
        animatediff: "slow",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✓",
        notes:
          "SDXL and FLUX work but are slow. Many ops not properly GPU-accelerated on Metal.",
      },
      {
        name: "M3 Pro / M3 (16–36GB)",
        vram: "16–36GB unified",
        price: "~$1,500–2,500",
        sdxl: "✓",
        flux: "fp16 slow",
        ltxVideo: "✗",
        animatediff: "very slow",
        hunyuan: "✗",
        wan21: "✗",
        lora: "slow",
        notes:
          "Functional for basic SDXL. Very slow for video. Better to use cloud for serious work on this hardware.",
      },
    ],
  },
  // ── F TIER ───────────────────────────────────────────────────────────────────
  {
    tier: "F",
    tierLabel: "Don't Use",
    tierColor: "#dc2626",
    brand: "Qualcomm",
    arch: "Snapdragon AI PC",
    precision: "N/A",
    gpus: [
      {
        name: "Snapdragon X Elite",
        vram: "varies",
        price: "varies",
        sdxl: "✗",
        flux: "✗",
        ltxVideo: "✗",
        animatediff: "✗",
        hunyuan: "✗",
        wan21: "✗",
        lora: "✗",
        notes:
          "PyTorch does not work. ComfyUI will not run. Qualcomm has promised support for years — avoid entirely until proven.",
      },
    ],
  },
];

// ── MODEL REFERENCE ────────────────────────────────────────────────────────────
const MODELS = [
  // IMAGE
  {
    category: "Image — Current Best",
    color: "#22c55e",
    entries: [
      {
        name: "FLUX.1 Dev",
        type: "Diffusion (DiT)",
        vram: "16GB (fp8) / 24GB (bf16)",
        size: "23GB (bf16) / 12GB (fp8)",
        folder: "models/diffusion_models/",
        file: "flux1-dev.safetensors",
        also: "OR models/checkpoints/ for single-file fp8 version",
        source: "huggingface.co/black-forest-labs/FLUX.1-dev",
        cfg: "1.0–3.5",
        sampler: "euler / dpmpp_2m",
        steps: "20–25",
        requires:
          "t5xxl_fp16.safetensors (text_encoders/) + clip_l.safetensors + ae.safetensors (vae/)",
        notes:
          "Best image quality model available locally. Non-commercial license. Use fp8 for 16GB cards.",
        best_for:
          "Portraits, photorealism, text in images, complex compositions",
      },
      {
        name: "FLUX.1 Schnell",
        type: "Diffusion (DiT) — Distilled",
        vram: "12GB (fp8)",
        size: "12GB (fp8 checkpoint)",
        folder: "models/checkpoints/",
        file: "flux1-schnell-fp8.safetensors",
        also: "",
        source: "huggingface.co/Comfy-Org/flux1-schnell",
        cfg: "1.0",
        sampler: "euler",
        steps: "4",
        requires: "Same CLIP/T5 encoders as Dev",
        notes:
          "4-step distilled model. Apache 2.0 license (commercial OK). Near Dev quality in ~6s on RTX 5080.",
        best_for:
          "Rapid prototyping, commercial use, high-throughput batch generation",
      },
      {
        name: "FLUX.1 Kontext Dev",
        type: "Diffusion (DiT) — Edit Model",
        vram: "16GB (fp8)",
        size: "12GB (fp8)",
        folder: "models/diffusion_models/",
        file: "flux1-kontext-dev.safetensors",
        also: "",
        source: "huggingface.co/black-forest-labs/FLUX.1-Kontext-dev",
        cfg: "3.5",
        sampler: "euler",
        steps: "25",
        requires: "t5xxl + clip_l + ae.safetensors",
        notes:
          "Image editing model — give it an image + instruction and it edits it. e.g. 'remove the person on the left'.",
        best_for:
          "Image editing, inpainting with text, style transfer with reference",
      },
      {
        name: "SDXL Base 1.0",
        type: "Latent Diffusion",
        vram: "8GB+",
        size: "6.9GB",
        folder: "models/checkpoints/",
        file: "sd_xl_base_1.0.safetensors",
        also: "sd_xl_refiner_1.0.safetensors for optional refiner pass",
        source: "huggingface.co/stabilityai/stable-diffusion-xl-base-1.0",
        cfg: "7.0–7.5",
        sampler: "dpmpp_2m",
        steps: "25–30",
        requires:
          "Built-in CLIP. Optional: sdxl_vae.safetensors (models/vae/) for best colors",
        notes:
          "Workhorse model. Massive LoRA ecosystem on CivitAI. Works at 8GB with --normalvram.",
        best_for:
          "General use, LoRA training base, concept art, style transfer",
      },
      {
        name: "SD 3.5 Large",
        type: "MMDiT (Multimodal DiT)",
        vram: "16GB (fp8)",
        size: "8.9GB (fp8)",
        folder: "models/checkpoints/",
        file: "sd3.5_large_fp8_scaled.safetensors",
        also: "",
        source: "huggingface.co/stabilityai/stable-diffusion-3.5-large",
        cfg: "4.5–7.0",
        sampler: "dpmpp_2m",
        steps: "28",
        requires: "clip_g + clip_l + t5xxl text encoders",
        notes:
          "Latest Stability AI model. Better than SDXL for photorealism. Non-commercial license.",
        best_for: "High quality photorealism when FLUX Dev is too slow",
      },
      {
        name: "Stable Diffusion 1.5",
        type: "Latent Diffusion (UNet)",
        vram: "4GB (fp16)",
        size: "2GB (fp16 pruned)",
        folder: "models/checkpoints/",
        file: "v1-5-pruned-emaonly.ckpt",
        also: "",
        source: "huggingface.co/stable-diffusion-v1-5",
        cfg: "7.0–7.5",
        sampler: "dpmpp_2m",
        steps: "20",
        requires: "Built-in CLIP encoder",
        notes:
          "Access to the largest LoRA ecosystem ever. GTX 1660 Ti compatible. Huge CivitAI library.",
        best_for: "Anime, characters, legacy LoRA compatibility, 6GB GPU users",
      },
      {
        name: "Qwen-Image 6B",
        type: "DiT (Alibaba)",
        vram: "12GB (fp8)",
        size: "~8GB (fp8)",
        folder: "models/diffusion_models/",
        file: "qwen_image_6b_fp8.safetensors",
        also: "",
        source: "huggingface.co/Comfy-Org/Qwen-Image_ComfyUI",
        cfg: "3.5",
        sampler: "euler",
        steps: "25",
        requires: "qwen_image_text_encoder.safetensors",
        notes:
          "Alibaba's 6B model. Excellent for multilingual text rendering in images. Faster than FLUX on 16GB cards.",
        best_for:
          "Text in images, multilingual content, editing with natural language",
      },
    ],
  },
  // VIDEO
  {
    category: "Video — Current Best",
    color: "#38bdf8",
    entries: [
      {
        name: "LTX Video 2.3 (LTX-V)",
        type: "Video DiT",
        vram: "12GB (fp8) / 16GB (bf16)",
        size: "9.7GB",
        folder: "models/video_models/",
        file: "ltx-video-2b-v0.9.5.safetensors",
        also: "",
        source: "huggingface.co/Lightricks/LTX-Video",
        cfg: "3.0–4.0",
        sampler: "dpmpp_2m",
        steps: "20–25",
        requires: "ComfyUI-LTXVideo custom node + VideoHelperSuite",
        notes:
          "Fastest local video model. 9:16 vertical format native. ~47s for 97 frames on RTX 5080. neuraldrift primary video model.",
        best_for:
          "YouTube Shorts, TikTok, Instagram Reels, short cinematic clips",
      },
      {
        name: "Wan 2.1 T2V 14B",
        type: "Video DiT (Alibaba)",
        vram: "60–70GB (bf16) — needs H100/cloud",
        size: "~28GB",
        folder: "models/diffusion_models/",
        file: "wan2.1_t2v_14B_bf16.safetensors",
        also: "wan2.1_i2v_720p_14B_fp8 for image-to-video",
        source: "huggingface.co/Wan-AI/Wan2.1-T2V-14B",
        cfg: "6.0",
        sampler: "dpmpp_2m",
        steps: "50",
        requires:
          "umt5_xxl text encoder + wan_2.1_vae.safetensors + clip_vision_h.safetensors",
        notes:
          "Highest quality video model available locally. Requires 60GB+ VRAM in bf16. Use cloud (RunPod A100/H100) for local < 32GB.",
        best_for:
          "High-quality video, 720p generation, image-to-video conversion",
      },
      {
        name: "Wan 2.1 T2V 1.3B",
        type: "Video DiT (Alibaba) — Lite",
        vram: "8–10GB",
        size: "~3GB",
        folder: "models/diffusion_models/",
        file: "wan2.1_t2v_1.3B_bf16.safetensors",
        also: "",
        source: "huggingface.co/Wan-AI/Wan2.1-T2V-1.3B",
        cfg: "5.0",
        sampler: "dpmpp_2m",
        steps: "30",
        requires: "umt5_xxl (can use fp8 version) + wan_2.1_vae.safetensors",
        notes:
          "The 1.3B lite version fits on 8–10GB cards. Lower quality than 14B but accessible. Good for experimentation.",
        best_for:
          "Budget GPU video generation, quick previews before cloud renders",
      },
      {
        name: "HunyuanVideo (13B)",
        type: "Video DiT (Tencent)",
        vram: "80GB+ (bf16) — H100 minimum",
        size: "~26GB",
        folder: "models/diffusion_models/",
        file: "hunyuan_video_720_cfgdistill_fp8_e4m3fn.safetensors",
        also: "",
        source: "huggingface.co/tencent/HunyuanVideo",
        cfg: "1.0 (distilled)",
        sampler: "euler",
        steps: "50",
        requires: "llava_llama3 vision encoder + hunyuan_video_vae_bf16",
        notes:
          "Highest quality video model. 80GB+ in bf16. Use cloud only. RTX 5090 32GB can run fp8 with offloading but very slow.",
        best_for: "Professional-grade video output, premium cloud renders",
      },
      {
        name: "AnimateDiff v3 (SD1.5)",
        type: "Motion Module for SD1.5",
        vram: "8GB+",
        size: "1.7GB",
        folder: "custom_nodes/ComfyUI-AnimateDiff-Evolved/models/",
        file: "mm_sd_v15_v3.ckpt",
        also: "mm_sdxl_v10_beta.ckpt for SDXL",
        source: "huggingface.co/guoyww/animatediff",
        cfg: "7.0–8.0",
        sampler: "dpmpp_2m",
        steps: "20–25",
        requires: "ComfyUI-AnimateDiff-Evolved + VideoHelperSuite",
        notes:
          "Converts any SD1.5/SDXL model into video. 8GB friendly. Massive LoRA compatibility for character consistency.",
        best_for: "Looping social content, character animation, seamless loops",
      },
    ],
  },
  // UPSCALING
  {
    category: "Upscaling & Enhancement",
    color: "#f59e0b",
    entries: [
      {
        name: "RealESRGAN x4plus",
        type: "Upscale Model (ESRGAN)",
        vram: "2GB+",
        size: "64MB",
        folder: "models/upscale_models/",
        file: "RealESRGAN_x4plus.pth",
        also: "",
        source: "github.com/xinntao/Real-ESRGAN/releases",
        cfg: "N/A",
        sampler: "N/A",
        steps: "N/A",
        requires: "Nothing extra — built into ComfyUI nodes",
        notes:
          "The standard 4x photorealistic upscaler. Runs on any GPU. Essential finishing step.",
        best_for: "Photo upscaling, general 4x enhancement",
      },
      {
        name: "RealESRGAN x4plus Anime",
        type: "Upscale Model (ESRGAN)",
        vram: "2GB+",
        size: "18MB",
        folder: "models/upscale_models/",
        file: "RealESRGAN_x4plus_anime_6B.pth",
        also: "",
        source: "github.com/xinntao/Real-ESRGAN/releases",
        cfg: "N/A",
        sampler: "N/A",
        steps: "N/A",
        requires: "Nothing extra",
        notes:
          "Anime-optimized. 6-block architecture preserves flat colors and crisp linework.",
        best_for: "Anime upscaling, illustration enhancement, line art",
      },
      {
        name: "4x-UltraSharp",
        type: "Upscale Model (SwinIR variant)",
        vram: "2GB+",
        size: "133MB",
        folder: "models/upscale_models/",
        file: "4x-UltraSharp.pth",
        also: "",
        source: "civitai.com (search: 4x-UltraSharp)",
        cfg: "N/A",
        sampler: "N/A",
        steps: "N/A",
        requires: "Nothing extra",
        notes:
          "Community favorite for photorealistic details. Often preferred over stock ESRGAN for faces.",
        best_for: "Portrait sharpening, detail enhancement, face upscaling",
      },
    ],
  },
  // VAE
  {
    category: "VAEs (Required for most models)",
    color: "#c084fc",
    entries: [
      {
        name: "FLUX VAE (ae.safetensors)",
        type: "VAE",
        vram: "1GB",
        size: "335MB",
        folder: "models/vae/",
        file: "ae.safetensors",
        also: "",
        source:
          "huggingface.co/black-forest-labs/FLUX.1-dev/blob/main/ae.safetensors",
        cfg: "N/A",
        sampler: "N/A",
        steps: "N/A",
        requires: "Required for all FLUX workflows",
        notes:
          "The only VAE for FLUX models. Single file, shared across Dev, Schnell, and Kontext.",
        best_for: "All FLUX workflows",
      },
      {
        name: "SDXL VAE (sdxl_vae)",
        type: "VAE",
        vram: "512MB",
        size: "320MB",
        folder: "models/vae/",
        file: "sdxl_vae.safetensors",
        also: "",
        source: "huggingface.co/stabilityai/sdxl-vae",
        cfg: "N/A",
        sampler: "N/A",
        steps: "N/A",
        requires: "Optional but strongly recommended for SDXL",
        notes:
          "Fixes SDXL color shift issue with the baked-in VAE. Always use this for best SDXL colors.",
        best_for: "All SDXL workflows",
      },
      {
        name: "Wan VAE",
        type: "VAE (Video)",
        vram: "1GB",
        size: "450MB",
        folder: "models/vae/",
        file: "wan_2.1_vae.safetensors",
        also: "",
        source: "huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged",
        cfg: "N/A",
        sampler: "N/A",
        steps: "N/A",
        requires: "Required for all Wan 2.1 video workflows",
        notes:
          "Required for Wan 2.1 video decode. Without it you get blank black video output.",
        best_for: "Wan 2.1 video generation",
      },
    ],
  },
];

// ── CLOUD SERVICES ─────────────────────────────────────────────────────────────
const CLOUD_SERVICES = [
  {
    name: "Comfy Cloud",
    url: "comfy.org/cloud",
    tagline: "Official ComfyUI cloud — run in browser, zero setup",
    pricing: "Pay-per-GPU-use (idle is free)",
    gpu: "Server-grade (unspecified, managed)",
    bestFor:
      "Anyone who wants ComfyUI without any install. All models pre-loaded. Import own LoRAs on paid plans.",
    verdict: "Best for absolute beginners or travel/secondary device use.",
    badge: "Official",
    badgeColor: "#22c55e",
    models: "FLUX, SDXL, SD3.5, Wan 2.1, AnimateDiff, LoRAs",
  },
  {
    name: "RunPod",
    url: "runpod.io",
    tagline: "GPU pods on demand — ComfyUI template, per-second billing",
    pricing: "RTX 4090: ~$0.34/hr · A100 80GB: ~$1.89/hr · H100: ~$2.49/hr",
    gpu: "RTX 4090 · A100 40/80GB · H100 · B200 · L40S",
    bestFor:
      "Developers and power users. Full control, custom nodes, any model. Run Wan 2.1 14B and HunyuanVideo on A100.",
    verdict:
      "Best for users who need cloud Wan 2.1 / HunyuanVideo on a budget. Use the ComfyUI template.",
    badge: "Best Value",
    badgeColor: "#f59e0b",
    models: "Any — you install what you want",
  },
  {
    name: "Vast.ai",
    url: "vast.ai",
    tagline: "Marketplace of rental GPUs — cheapest hourly rates",
    pricing: "RTX 4090: ~$0.20–0.55/hr (varies by host)",
    gpu: "RTX 4090 · A100 · 3090 · community GPUs",
    bestFor:
      "Budget users doing batch generation. Cheapest $/image on the market. Variable uptime.",
    verdict:
      "Lowest cost. Good for batch runs of 50–200 images. Less reliable than RunPod.",
    badge: "Cheapest",
    badgeColor: "#38bdf8",
    models: "Any — you install what you want",
  },
  {
    name: "RunComfy",
    url: "runcomfy.com",
    tagline: "Dedicated ComfyUI cloud — zero-setup, pre-built workflows",
    pricing: "Subscription with GPU hour allotments",
    gpu: "Managed (A10/L4 class)",
    bestFor:
      "Artists who want cloud ComfyUI with workflow library and no technical setup.",
    verdict:
      "Easiest cloud ComfyUI after Comfy Cloud. Good for creators who don't want to manage infrastructure.",
    badge: "Easiest",
    badgeColor: "#c084fc",
    models: "FLUX, SDXL, AnimateDiff, LoRAs library",
  },
  {
    name: "ThinkDiffusion",
    url: "thinkdiffusion.com",
    tagline: "Managed ComfyUI + educational content",
    pricing: "Credits-based, ~$0.50–1.50/hr equivalent",
    gpu: "Managed (A100/H100 class for video)",
    bestFor:
      "Learners and educators. Best documentation. 20% extra credits for community users.",
    verdict: "Best for learning. Less flexible than RunPod but more guided.",
    badge: "Best for Learning",
    badgeColor: "#fb923c",
    models: "FLUX, SDXL, Wan 2.1, AnimateDiff",
  },
  {
    name: "Spheron Network",
    url: "spheron.network",
    tagline: "RTX 5090 cloud GPU — best $/image for image generation",
    pricing: "RTX 5090: ~$0.76/hr · H100 PCIe: ~$2.01/hr",
    gpu: "RTX 5090 · H100 PCIe",
    bestFor:
      "Image generation at scale. RTX 5090 delivers ~40% of H100 cost-per-image due to GDDR7 bandwidth.",
    verdict:
      "Best cost-per-image for SDXL/FLUX at scale. Use H100 only if you need Wan 2.1 14B.",
    badge: "Best $/Image",
    badgeColor: "#22c55e",
    models: "Any — you provision",
  },
];

// ─── LAUNCH FLAGS TABLE ────────────────────────────────────────────────────────
const LAUNCH_FLAGS = [
  {
    vram: "32GB+ (RTX 5090, 3090, 4090)",
    flag: "--gpu-only --highvram",
    effect: "Everything in VRAM. Max speed. No offloading.",
  },
  {
    vram: "16GB (RTX 5080, 4080, 3080 16GB)",
    flag: "--gpu-only --highvram",
    effect: "Keeps all models GPU-resident. Required for LTX Video cinematic.",
  },
  {
    vram: "12GB (RTX 4070, 3060, 3080 10GB)",
    flag: "--gpu-only",
    effect:
      "Default mode. Offloads text encoders when needed. FLUX fp8 + LTX 25fr works.",
  },
  {
    vram: "10GB (RTX 3080 10GB)",
    flag: "--gpu-only",
    effect: "Same as 12GB. Tight for LTX Video. Reduce to 73 frames if OOM.",
  },
  {
    vram: "8GB (RTX 4060, 3070, 2080)",
    flag: "--lowvram",
    effect:
      "Aggressive model swapping. Slower. Use with FLUX GGUF, SDXL 768px, AnimateDiff 16fr.",
  },
  {
    vram: "6GB (GTX 1660 Ti)",
    flag: "--lowvram --dont-upcast-attention",
    effect: "Maximum VRAM savings. SD 1.5 only. SDXL marginal. No video.",
  },
  {
    vram: "CPU (no discrete GPU)",
    flag: "--cpu",
    effect:
      "10–50x slower than GPU. Only for emergencies. SD 1.5 takes 10+ minutes per image.",
  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

const TIER_BG: Record<string, string> = {
  S: "rgba(34,197,94,0.06)",
  B: "rgba(245,158,11,0.06)",
  D: "rgba(122,138,154,0.06)",
  AVOID: "rgba(239,68,68,0.06)",
  F: "rgba(220,38,38,0.06)",
};

function Check({ val }: { val: string }) {
  const color = val === "✓" ? "#22c55e" : val === "✗" ? "#ef4444" : "#f59e0b";
  return (
    <span
      style={{
        fontFamily: "var(--font-jetbrains-mono)",
        fontSize: 11,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {val}
    </span>
  );
}

export default function GPUGuidePage() {
  return (
    <div
      style={{
        background: "#080b0f",
        minHeight: "100vh",
        color: "#e8edf2",
        fontFamily: "var(--font-dm-sans), sans-serif",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 2rem",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(8,11,15,0.9)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "1.1rem",
            color: "#fff",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#f59e0b",
              display: "inline-block",
            }}
          />
          neuraldrift<span style={{ color: "#f59e0b" }}>.ai</span>
        </Link>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <Link
            href="/optimizer"
            style={{
              background: "#f59e0b",
              color: "#000",
              padding: "0.4rem 1rem",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: "0.8rem",
              textDecoration: "none",
            }}
          >
            Score My GPU →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{ padding: "4rem 2rem 3rem", maxWidth: 1200, margin: "0 auto" }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.7rem",
            color: "#f59e0b",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          // GPU Compatibility Guide
        </div>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: "1rem",
          }}
        >
          Which GPUs work.
          <br />
          Which <span style={{ color: "#ef4444" }}>don&apos;t.</span>
          <br />
          <span style={{ color: "#9aafc0" }}>And what to do about it.</span>
        </h1>
        <p
          style={{
            color: "#9aafc0",
            fontSize: "1.05rem",
            maxWidth: 620,
            lineHeight: 1.8,
            fontWeight: 300,
            marginBottom: "1rem",
          }}
        >
          Sourced directly from the{" "}
          <a
            href="https://github.com/comfyanonymous/ComfyUI/wiki/Which-GPU-should-I-buy-for-ComfyUI"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#f59e0b", textDecoration: "none" }}
          >
            official ComfyUI GitHub wiki
          </a>
          , NVIDIA&apos;s RTX AI Garage benchmarks, and Spheron cloud benchmarks
          from March 2026. Every number has a source.
        </p>
        {/* Quick verdict boxes */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          {[
            {
              label: "Best budget build",
              value: "RTX 3060 12GB ($230 used)",
              color: "#22c55e",
            },
            {
              label: "Best mid-range",
              value: "RTX 4070 Super ($500)",
              color: "#22c55e",
            },
            {
              label: "Best all-rounder",
              value: "RTX 5080 16GB ($1,000)",
              color: "#f59e0b",
            },
            {
              label: "Need Wan 2.1 / Hunyuan?",
              value: "Use cloud (RunPod A100)",
              color: "#38bdf8",
            },
          ].map((v) => (
            <div
              key={v.label}
              style={{
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "1rem 1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#5a6a7a",
                  fontFamily: "var(--font-jetbrains-mono)",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {v.label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: v.color,
                  fontFamily: "var(--font-syne)",
                }}
              >
                {v.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GPU Compatibility Table */}
      <section
        style={{ padding: "0 2rem 4rem", maxWidth: 1200, margin: "0 auto" }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.7rem",
            color: "#f59e0b",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          // GPU Tier List — Official ComfyUI Rankings
        </div>

        {GPU_TIERS.map((tier) => (
          <div
            key={`${tier.tier}-${tier.arch}`}
            style={{
              marginBottom: "2rem",
              border: `1px solid rgba(255,255,255,0.07)`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Tier header */}
            <div
              style={{
                background: TIER_BG[tier.tier],
                padding: "1rem 1.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 800,
                  fontSize: "1.4rem",
                  color: tier.tierColor,
                  lineHeight: 1,
                }}
              >
                {tier.tier}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "#fff",
                  }}
                >
                  {tier.brand} — {tier.arch}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "0.7rem",
                    color: "#5a6a7a",
                    marginTop: 2,
                  }}
                >
                  Precision: {tier.precision}
                </div>
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 10,
                  padding: "3px 10px",
                  borderRadius: 4,
                  background: `${tier.tierColor}18`,
                  border: `1px solid ${tier.tierColor}30`,
                  color: tier.tierColor,
                }}
              >
                {tier.tierLabel}
              </span>
            </div>

            {/* GPU rows */}
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr style={{ background: "#0d1117" }}>
                    {[
                      "GPU",
                      "VRAM",
                      "Price",
                      "SDXL",
                      "FLUX",
                      "LTX Video",
                      "AnimateDiff",
                      "Hunyuan",
                      "Wan 2.1",
                      "LoRA Train",
                      "Notes",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: 10,
                          color: "#f59e0b",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tier.gpus.map((gpu, i) => (
                    <tr
                      key={gpu.name}
                      style={{
                        background: i % 2 === 0 ? "#0d1117" : "#0a0e14",
                      }}
                    >
                      <td
                        style={{
                          padding: "9px 12px",
                          fontFamily: "var(--font-syne)",
                          fontWeight: 600,
                          color: "#e8edf2",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        {gpu.name}
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          fontFamily: "var(--font-jetbrains-mono)",
                          color: "#f59e0b",
                          fontSize: 11,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        {gpu.vram}
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          color: "#9aafc0",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        {gpu.price}
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Check val={gpu.sdxl} />
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Check val={gpu.flux} />
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Check val={gpu.ltxVideo} />
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Check val={gpu.animatediff} />
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Check val={gpu.hunyuan} />
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Check val={gpu.wan21} />
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Check val={gpu.lora} />
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          color: "#7a8a9a",
                          fontSize: 11,
                          lineHeight: 1.5,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          maxWidth: 280,
                        }}
                      >
                        {gpu.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Key note */}
        <div
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 10,
            padding: "1.25rem 1.5rem",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            ⚠️ Wan 2.1 14B & HunyuanVideo require 60–80GB VRAM
          </div>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#9aafc0",
              lineHeight: 1.7,
              margin: 0,
              fontWeight: 300,
            }}
          >
            No consumer GPU — including the RTX 5090 32GB — can run these models
            in bf16 natively. Your options: use the
            <strong style={{ color: "#f59e0b" }}>
              {" "}
              Wan 2.1 1.3B lite model
            </strong>{" "}
            locally (8–10GB), or rent a{" "}
            <strong style={{ color: "#f59e0b" }}>
              RunPod A100 80GB (~$1.89/hr)
            </strong>{" "}
            for on-demand access. A 5-minute Wan 2.1 14B video generation costs
            roughly $0.16 in cloud compute.
          </p>
        </div>
      </section>

      {/* Launch Flags */}
      <section
        style={{ padding: "0 2rem 4rem", maxWidth: 1200, margin: "0 auto" }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.7rem",
            color: "#f59e0b",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          // Launch Flags — Use the Right One for Your GPU
        </div>
        <div
          style={{
            overflowX: "auto",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: "#111820" }}>
                {["GPU VRAM", "Launch Flag", "Effect"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 16px",
                      textAlign: "left",
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 10,
                      color: "#f59e0b",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LAUNCH_FLAGS.map((row, i) => (
                <tr
                  key={row.vram}
                  style={{ background: i % 2 === 0 ? "#0d1117" : "#0a0e14" }}
                >
                  <td
                    style={{
                      padding: "10px 16px",
                      color: "#9aafc0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      fontSize: 13,
                    }}
                  >
                    {row.vram}
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <code
                      style={{
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: 12,
                        color: "#f59e0b",
                        background: "rgba(245,158,11,0.08)",
                        padding: "2px 7px",
                        borderRadius: 4,
                      }}
                    >
                      {row.flag}
                    </code>
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      color: "#7a8a9a",
                      fontSize: 12,
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {row.effect}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Model Reference */}
      <section
        style={{ padding: "0 2rem 4rem", maxWidth: 1200, margin: "0 auto" }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.7rem",
            color: "#f59e0b",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          // Model Reference — Exact Files, Folders, Settings
        </div>
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            color: "#fff",
            marginBottom: "0.75rem",
          }}
        >
          Every model. Every detail. No guessing.
        </h2>
        <p
          style={{
            color: "#9aafc0",
            fontSize: "1rem",
            lineHeight: 1.7,
            maxWidth: 600,
            fontWeight: 300,
            marginBottom: "2.5rem",
          }}
        >
          Exact filenames, download sources, folder paths, and optimal ComfyUI
          settings. Copy and paste into your setup.
        </p>

        {MODELS.map((group) => (
          <div key={group.category} style={{ marginBottom: "2.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: group.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#fff",
                }}
              >
                {group.category}
              </span>
            </div>

            {group.entries.map((m) => (
              <div
                key={m.name}
                style={{
                  background: "#0d1117",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: "1.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: "#fff",
                      margin: 0,
                    }}
                  >
                    {m.name}
                  </h3>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: `${group.color}18`,
                      border: `1px solid ${group.color}30`,
                      color: group.color,
                    }}
                  >
                    {m.type}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      color: "#f59e0b",
                    }}
                  >
                    VRAM: {m.vram}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#7a8a9a",
                    }}
                  >
                    Size: {m.size}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {[
                    { label: "📁 Folder", val: m.folder },
                    { label: "📄 File", val: m.file },
                    { label: "🔗 Source", val: m.source },
                    ...(m.requires
                      ? [{ label: "🔗 Also needs", val: m.requires }]
                      : []),
                    ...(m.cfg !== "N/A"
                      ? [
                          { label: "⚙️ CFG", val: m.cfg },
                          { label: "🎛️ Sampler", val: m.sampler },
                          { label: "📊 Steps", val: m.steps },
                        ]
                      : []),
                    { label: "🎯 Best for", val: m.best_for },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        background: "#080b0f",
                        borderRadius: 6,
                        padding: "0.6rem 0.8rem",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: 10,
                          color: "#5a6a7a",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: 3,
                        }}
                      >
                        {row.label}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-jetbrains-mono)",
                          fontSize: 11,
                          color: "#f59e0b",
                          wordBreak: "break-all",
                        }}
                      >
                        {row.val}
                      </div>
                    </div>
                  ))}
                </div>

                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#9aafc0",
                    lineHeight: 1.6,
                    margin: 0,
                    fontWeight: 300,
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    paddingTop: "0.75rem",
                  }}
                >
                  {m.notes}
                  {m.also && (
                    <span
                      style={{
                        display: "block",
                        marginTop: 4,
                        color: "#7a8a9a",
                        fontFamily: "var(--font-jetbrains-mono)",
                        fontSize: 11,
                      }}
                    >
                      // Also available: {m.also}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* Cloud Services */}
      <section
        style={{ padding: "0 2rem 5rem", maxWidth: 1200, margin: "0 auto" }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.7rem",
            color: "#f59e0b",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          // Cloud ComfyUI — When Your GPU Isn&apos;t Enough
        </div>
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            color: "#fff",
            marginBottom: "0.75rem",
          }}
        >
          No RTX 5090? Run it in the cloud.
        </h2>
        <p
          style={{
            color: "#9aafc0",
            fontSize: "1rem",
            lineHeight: 1.7,
            maxWidth: 600,
            fontWeight: 300,
            marginBottom: "2rem",
          }}
        >
          Wan 2.1 14B generates at 720p quality in 5 minutes on a RunPod A100
          for $0.16. That same render would take 3+ hours with heavy offloading
          on a 16GB local GPU.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {CLOUD_SERVICES.map((svc) => (
            <div
              key={svc.name}
              style={{
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  {svc.name}
                </h3>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: `${svc.badgeColor}18`,
                    border: `1px solid ${svc.badgeColor}30`,
                    color: svc.badgeColor,
                    whiteSpace: "nowrap",
                  }}
                >
                  {svc.badge}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#9aafc0",
                  lineHeight: 1.6,
                  fontWeight: 300,
                  marginBottom: "0.75rem",
                }}
              >
                {svc.tagline}
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  marginBottom: "1rem",
                }}
              >
                {[
                  { k: "Pricing", v: svc.pricing },
                  { k: "GPUs", v: svc.gpu },
                  { k: "Models", v: svc.models },
                ].map((r) => (
                  <div
                    key={r.k}
                    style={{ display: "flex", gap: "0.5rem", fontSize: 12 }}
                  >
                    <span
                      style={{
                        color: "#5a6a7a",
                        fontFamily: "var(--font-jetbrains-mono)",
                        whiteSpace: "nowrap",
                        minWidth: 56,
                      }}
                    >
                      {r.k}:
                    </span>
                    <span style={{ color: "#9aafc0" }}>{r.v}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "#080b0f",
                  borderRadius: 6,
                  padding: "0.6rem 0.8rem",
                  marginBottom: "1rem",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: 10,
                    color: "#5a6a7a",
                    marginBottom: 3,
                  }}
                >
                  VERDICT
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#e8edf2",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {svc.verdict}
                </p>
              </div>

              <a
                href={`https://${svc.url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  color: "#f59e0b",
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 11,
                  padding: "7px 14px",
                  borderRadius: 6,
                  textDecoration: "none",
                  textAlign: "center",
                  display: "block",
                  transition: "all 0.2s",
                }}
              >
                Visit {svc.url} →
              </a>
            </div>
          ))}
        </div>

        {/* Upgrade path CTA */}
        <div
          style={{
            marginTop: "3rem",
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.05), transparent)",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: 16,
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "1.8rem",
              color: "#fff",
              marginBottom: "1rem",
            }}
          >
            Not sure which GPU to buy?
          </h2>
          <p
            style={{
              color: "#9aafc0",
              fontSize: "1rem",
              lineHeight: 1.7,
              maxWidth: 500,
              margin: "0 auto 2rem",
              fontWeight: 300,
            }}
          >
            Our hardware partner ComputeAtlas.ai takes your workload — the
            models you want to run, the resolution you need, your budget — and
            outputs an exact parts list.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://computeatlas.ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#f59e0b",
                color: "#000",
                padding: "0.85rem 2rem",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
              }}
            >
              Plan Your AI Rig on ComputeAtlas →
            </a>
            <Link
              href="/optimizer"
              style={{
                background: "transparent",
                color: "#e8edf2",
                border: "1px solid rgba(255,255,255,0.15)",
                padding: "0.85rem 2rem",
                borderRadius: 8,
                fontWeight: 500,
                fontSize: "0.95rem",
                textDecoration: "none",
              }}
            >
              Score My Current GPU
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

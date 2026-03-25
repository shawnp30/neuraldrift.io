const fs = require('fs');
const path = require('path');

const SHOWCASES = [
  {
    slug: "cyberpunk-city",
    ckpt: "flux1-dev-fp8.safetensors",
    posPrompt: "A breathtaking cinematic cyberpunk cityscape at night, towering skyscrapers, neon signs reflecting in puddles, flying cars, heavy rain, volumetric fog, highly detailed, 8k resolution, Unreal Engine 5 render, cinematic lighting.",
    negPrompt: "lowres, text, error, cropped, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, bad proportions",
    width: 1536,
    height: 1024,
    note: "🔴 REQUIRED MODELS:\n\n1. FLUX.1 Dev FP8\nGet it from: HuggingFace (black-forest-labs/FLUX.1-dev)\nPlace in: ComfyUI/models/checkpoints/\n\n💡 Tip: Use a high VRAM GPU for FLUX generation (16GB+ recommended)."
  },
  {
    slug: "photo-portrait",
    ckpt: "juggernautXL_v9Rundiffusion.safetensors",
    posPrompt: "Professional studio lighting portrait photography of a beautiful 25-year-old woman, highly detailed skin texture, hyper-realistic, 8k, photorealistic, cinematic lighting, shot on 85mm lens, f/1.8.",
    negPrompt: "ugly, artificial, plastic skin, CGI, 3d render, illustration, deformed eyes, bad anatomy, bad hands, low resolution, artifacts, blurry",
    width: 1024,
    height: 1024,
    note: "🔴 REQUIRED MODELS:\n\n1. Juggernaut XL v9\nGet it from: Civitai.com (Search 'Juggernaut XL')\nPlace in: ComfyUI/models/checkpoints/\n\n💡 Tip: Perfect for insane SDXL photorealism."
  },
  {
    slug: "anime-transfer",
    ckpt: "anythingV5_PrtRE.safetensors",
    posPrompt: "Masterpiece, best quality, ultra-detailed, 1girl, studio ghibli style, vibrant colors, lush green forest background, magical atmosphere, anime illustration, miyazaki.",
    negPrompt: "lowres, bad anatomy, bad hands, text, missing fingers, extra digit, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark",
    width: 1024,
    height: 512,
    note: "🔴 REQUIRED MODELS:\n\n1. Anything V5\nGet it from: Civitai.com (Search 'Anything V5')\nPlace in: ComfyUI/models/checkpoints/\n\n💡 Tip: SD 1.5 model. Very fast, perfect for Studio Ghibli vibes."
  },
  {
    slug: "product-mockups",
    ckpt: "flux1-schnell.safetensors",
    posPrompt: "Commercial product photography of a sleek minimalist smart watch on a pure white background, studio lighting, hyper detailed, sharp focus, 8k, professional e-commerce shot.",
    negPrompt: "shadowy background, cluttered, messy, low quality, grainy, blurry, text, watermark",
    width: 1024,
    height: 1024,
    note: "🔴 REQUIRED MODELS:\n\n1. FLUX.1 Schnell\nGet it from: HuggingFace (black-forest-labs/FLUX.1-schnell)\nPlace in: ComfyUI/models/checkpoints/\n\n💡 Tip: 4 steps required for FLUX Schnell. Very fast output."
  },
  {
    slug: "cinematic-ltx",
    ckpt: "ltxVideo2.3.safetensors",
    posPrompt: "A high-speed cinematic chase through a dense futuristic city. The camera tracks smoothly behind a hovering motorcycle. Motion blur, neon lighting, 24fps film look.",
    negPrompt: "static, slow motion, distorted, ugly, bad anatomy, bad proportions, bad lighting, low resolution",
    width: 1280,
    height: 720,
    note: "🔴 REQUIRED MODELS:\n\n1. LTX Video 2.3 Checkpoint\nGet it from: HuggingFace (Lightricks/LTX-Video)\nPlace in: ComfyUI/models/checkpoints/\n\n💡 Tip: Video generation requires heavy VRAM and custom video nodes."
  },
  {
    slug: "logo-vector",
    ckpt: "sd_xl_base_1.0.safetensors",
    posPrompt: "A flat vector logo design for a tech startup, minimalist, clean lines, geometric fox symbol, gradients of deep purple and cyan, white background, corporate identity, dribbble style.",
    negPrompt: "3d render, realistic, photographic, messy, complex, text, lettering, watermark, sketched",
    width: 1024,
    height: 1024,
    note: "🔴 REQUIRED MODELS:\n\n1. SDXL Base 1.0\nGet it from: HuggingFace (stabilityai/stable-diffusion-xl-base-1.0)\nPlace in: ComfyUI/models/checkpoints/"
  },
  {
    slug: "interior-staging",
    ckpt: "RealVisXL_V4.0.safetensors",
    posPrompt: "Interior design of a modern luxury living room, large windows overlooking a city, contemporary furniture, minimalist decor, natural lighting, architectural photography, hyper-realistic, 8k.",
    negPrompt: "people, cluttered, messy, dirty, CGI, 3d render, cartoon, illustration",
    width: 1536,
    height: 1024,
    note: "🔴 REQUIRED MODELS:\n\n1. RealVisXL V4.0\nGet it from: Civitai.com (Search 'RealVisXL')\nPlace in: ComfyUI/models/checkpoints/\n\n💡 Tip: Combine with SDXL ControlNet Depth for staging."
  },
  {
    slug: "character-sheet",
    ckpt: "flux1-dev-fp8.safetensors",
    posPrompt: "A character turnaround sheet of a sci-fi rogue female hero, front view, side view, back view, concept art, highly detailed, white background, simple T-pose, RPG character design.",
    negPrompt: "3d render, complex background, environments, distorted anatomy, text, watermark",
    width: 1920,
    height: 1080,
    note: "🔴 REQUIRED MODELS:\n\n1. FLUX.1 Dev FP8\nGet it from: HuggingFace\nPlace in: ComfyUI/models/checkpoints/\n\n💡 Tip: Use Character Turnaround Custom Nodes for strict consistency."
  },
  {
    slug: "audio-reactive",
    ckpt: "v1-5-pruned-emaonly.safetensors",
    posPrompt: "Trippy abstract fractal universe, expanding colors, highly detailed, psychedelic music video visuals, fluid dynamics, cosmic background.",
    negPrompt: "text, watermark, human, realistic, boring, static",
    width: 512,
    height: 512,
    note: "🔴 REQUIRED MODELS:\n\n1. SD 1.5 Base\n2. AnimateDiff v3 Motion Module\nPlace in: ComfyUI/custom_nodes/ComfyUI-AnimateDiff-Evolved/models/\n\n💡 Tip: Requires AudioReactive custom nodes installed via Manager."
  },
  {
    slug: "tshirt-graphic",
    ckpt: "sd_xl_base_1.0.safetensors",
    posPrompt: "A bold vibrant t-shirt graphic design featuring an angry cybernetic skull with neon pink and green accents, isolated on white background, thick black outlines, streetwear aesthetic, vector illustration style.",
    negPrompt: "photorealistic, 3d, gradient background, complex scenery, humans",
    width: 1024,
    height: 1024,
    note: "🔴 REQUIRED MODELS:\n\n1. SDXL Base 1.0\nGet it from: HuggingFace\nPlace in: ComfyUI/models/checkpoints/"
  }
];

// Helper to generate a valid ComfyUI JSON structure
function generateWorkflowJSON(showcase) {
  return {
    last_node_id: 10,
    last_link_id: 9,
    nodes: [
      {
        id: 3,
        type: "KSampler",
        pos: [800, 200],
        size: [300, 260],
        title: "KSampler (Generation Core)",
        inputs: [
          { name: "model", type: "MODEL", link: 1 },
          { name: "positive", type: "CONDITIONING", link: 2 },
          { name: "negative", type: "CONDITIONING", link: 3 },
          { name: "latent_image", type: "LATENT", link: 4 }
        ],
        outputs: [
          { name: "LATENT", type: "LATENT", links: [8] }
        ],
        // widgets_values order for KSampler: seed, control_after_generate, steps, cfg, sampler_name, scheduler, denoise
        widgets_values: [ Math.floor(Math.random() * 1000000000), "randomize", 25, 7.5, "euler", "normal", 1.0 ]
      },
      {
        id: 4,
        type: "CheckpointLoaderSimple",
        pos: [50, 200],
        size: [300, 100],
        title: "Load Model Checkpoint",
        outputs: [
          { name: "MODEL", type: "MODEL", links: [1] },
          { name: "CLIP", type: "CLIP", links: [5, 6] },
          { name: "VAE", type: "VAE", links: [7] }
        ],
        widgets_values: [ showcase.ckpt ]
      },
      {
        id: 6,
        type: "CLIPTextEncode",
        pos: [400, 150],
        size: [350, 150],
        title: "Positive Prompt",
        inputs: [
          { name: "clip", type: "CLIP", link: 5 }
        ],
        outputs: [
          { name: "CONDITIONING", type: "CONDITIONING", links: [2] }
        ],
        widgets_values: [ showcase.posPrompt ]
      },
      {
        id: 7,
        type: "CLIPTextEncode",
        pos: [400, 350],
        size: [350, 150],
        title: "Negative Prompt",
        inputs: [
          { name: "clip", type: "CLIP", link: 6 }
        ],
        outputs: [
          { name: "CONDITIONING", type: "CONDITIONING", links: [3] }
        ],
        widgets_values: [ showcase.negPrompt ]
      },
      {
        id: 5,
        type: "EmptyLatentImage",
        pos: [400, 550],
        size: [300, 106],
        title: "Empty Latent Image (Resolution)",
        outputs: [
          { name: "LATENT", type: "LATENT", links: [4] }
        ],
        widgets_values: [ showcase.width, showcase.height, 1 ]
      },
      {
        id: 8,
        type: "VAEDecode",
        pos: [1150, 200],
        size: [210, 46],
        title: "VAE Decode",
        inputs: [
          { name: "samples", type: "LATENT", link: 8 },
          { name: "vae", type: "VAE", link: 7 }
        ],
        outputs: [
          { name: "IMAGE", type: "IMAGE", links: [9] }
        ]
      },
      {
        id: 9,
        type: "SaveImage",
        pos: [1400, 200],
        size: [300, 260],
        title: "Save Image Final Output",
        inputs: [
          { name: "images", type: "IMAGE", link: 9 }
        ],
        widgets_values: [ "Neuraldrift_Showcase" ]
      },
      {
        id: 10,
        type: "Note",
        pos: [50, 400],
        size: [300, 200],
        title: "📝 IMPORTANT: Instructions",
        widgets_values: [ showcase.note ]
      }
    ],
    links: [
      [1, 4, 0, 3, 0, "MODEL"],
      [2, 6, 0, 3, 1, "CONDITIONING"],
      [3, 7, 0, 3, 2, "CONDITIONING"],
      [4, 5, 0, 3, 3, "LATENT"],
      [5, 4, 1, 6, 0, "CLIP"],
      [6, 4, 1, 7, 0, "CLIP"],
      [7, 4, 2, 8, 1, "VAE"],
      [8, 3, 0, 8, 0, "LATENT"],
      [9, 8, 0, 9, 0, "IMAGE"]
    ],
    groups: [],
    config: {},
    extra: {}
  };
}

const dir = path.join(__dirname, '..', 'public', 'workflows');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

SHOWCASES.forEach(showcase => {
  const workflow = generateWorkflowJSON(showcase);
  
  // Inject strict slot_indexes for ComfyUI connection compatibility
  workflow.nodes = workflow.nodes.map(n => {
    if (n.outputs) {
      n.outputs = n.outputs.map((out, idx) => ({ ...out, slot_index: idx }));
    }
    return n;
  });

  const filePath = path.join(dir, `showcase_${showcase.slug.replace(/-/g, '_')}.json`);
  fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2), 'utf8');
  console.log(`Created: ${filePath}`);
});

export interface Tutorial {
  slug: string;
  videoId: string;
  title: string;
  duration: string;
  category: string;
  description: string;
}

export const TUTORIALS: Tutorial[] = [
  { slug: 'comfyui-beginner-guide', videoId: 'AbBcfjIYhTg', title: 'ComfyUI Beginner Guide', duration: '25:10', category: 'Masterclass', description: 'Deep dive into setup and basic node architecture by Olivio Sarikas. Perfect for those looking to understand the core engine before scaling.' },
  { slug: 'comfyui-advanced-latent-workflows', videoId: '2XN2J3T-BFA', title: 'ComfyUI Advanced Latent Workflows', duration: '34:20', category: 'Technical Guide', description: 'Learn how to push the boundaries of latent noise injection and node manipulation from Latent Vision.' },
  { slug: 'comfyui-for-beginners-full-guide', videoId: '23VkGD-4uwk', title: 'ComfyUI for Beginners — Full Guide', duration: '39:00', category: 'Beginner', description: 'Sebastian Kamph walks through installation to your first image generation, including nodes, connections, text-to-image, and sampler parameters.' },
  { slug: 'comfyui-full-course-from-scratch', videoId: 'HkoRkNLWQzY', title: 'ComfyUI Full Course — From Scratch', duration: '5:00:00', category: 'Masterclass', description: 'A comprehensive course covering major node types, workflow patterns, model management, and advanced techniques.' },
  { slug: 'comfyui-introduction-and-installation', videoId: 'Zko_s2LO9Wo', title: 'ComfyUI Introduction & Installation', duration: '15:00', category: 'Beginner', description: 'Quick-start guide covering ComfyUI installation, initial configuration, and a first text-to-image workflow.' },
  { slug: 'flux-lora-explained', videoId: '-aW1U8QEak0', title: 'FLUX LoRA Explained — Best Settings & New UI', duration: '18:00', category: 'Technical Guide', description: 'A practical overview of loading FLUX LoRA models, balancing quality and speed, and navigating the current ComfyUI interface.' },
  { slug: 'flux-controlnet-union-pro', videoId: 'WHuhxKk40k4', title: 'How to Use FLUX ControlNet Union Pro', duration: '20:00', category: 'Technical Guide', description: 'Learn to combine canny, depth, and pose conditioning with a unified FLUX ControlNet workflow.' },
  { slug: 'ipadapter-and-lora-for-flux', videoId: 'KinUqRWG8q4', title: 'IPAdapter & LoRA for FLUX — Full Setup', duration: '22:00', category: 'Technical Guide', description: 'Setup and usage tutorial for IPAdapter and LoRA with FLUX models, including model downloads and combined style transfer.' },
  { slug: 'flux-tools-fill-redux-depth-canny', videoId: 'o7sCHUJNkJI', title: 'Install & Use FLUX Tools: Fill, Redux, Depth, Canny', duration: '19:00', category: 'Technical Guide', description: 'Walkthrough of the FLUX Tools suite for inpainting, variations, and structural control.' },
  { slug: 'flux-kontext-inpainting-consistency', videoId: '9-onDeEWWvU', title: 'Master FLUX Kontext — Inpainting & Consistency', duration: '16:00', category: 'Advanced', description: 'Advanced FLUX Kontext techniques for precision inpainting, multi-subject editing, and character consistency.' },
  { slug: 'sketch-to-image-sdxl-flux', videoId: 'YOGDSdLW0rg', title: 'Sketch to Image with SDXL or FLUX', duration: '14:00', category: 'Creative', description: 'Turn rough sketches into polished images using ControlNet sketch conditioning with SDXL or FLUX.' },
  { slug: 'animations-with-ipadapter-and-comfyui', videoId: 'ddYbhv3WgWw', title: 'Animations with IPAdapter & ComfyUI', duration: '18:00', category: 'Creative', description: 'Create style-consistent AI animations using IPAdapter, AnimateDiff, keyframe control, and export workflows.' },
];

export function tutorialDurationIso(duration: string): string | undefined {
  const parts = duration.split(':').map(Number);
  if (parts.some(Number.isNaN)) return undefined;
  if (parts.length === 2) return `PT${parts[0]}M${parts[1]}S`;
  if (parts.length === 3) return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
  return undefined;
}

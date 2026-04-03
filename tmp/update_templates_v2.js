const fs = require('fs');
const path = require('path');

const templatesDir = path.join(process.cwd(), 'public', 'workflows', 'templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));

const MODEL_LINKS = {
  'flux1-dev-fp8.safetensors': 'https://huggingface.co/Kijai/flux-fp8/resolve/main/flux1-dev-fp8.safetensors',
  't5xxl_fp16.safetensors': 'https://huggingface.co/comfyanonymous/direct-ml-t5-v1-1-xxl/resolve/main/t5xxl_fp16.safetensors',
  'clip_l.safetensors': 'https://huggingface.co/comfyanonymous/direct-ml-clip-l/resolve/main/clip_l.safetensors',
  'ae.safetensors': 'https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/ae.safetensors',
  'animatediff_v15_3.safetensors': 'https://huggingface.co/guoyww/AnimateDiff/resolve/main/v3_sd15_mm.ckpt',
  'sd_v1-5_pruned_noema.safetensors': 'https://huggingface.co/runwayml/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors',
  'sdxl_lighting_4step.safetensors': 'https://huggingface.co/ByteDance/SDXL-Lightning/resolve/main/sdxl_lighting_4step_unet.safetensors',
  'ltx-2.3-22b-dev-fp8.safetensors': 'https://huggingface.co/Lightricks/LTX-2.3-fp8/resolve/main/ltx-2.3-22b-dev-fp8.safetensors'
};

files.forEach(file => {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Very flexible regex for type and widgets_values in separate lines
  const noteRegex = /("type"\s*:\s*"(?:Markdown)?Note"[\s\S]*?"widgets_values"\s*:\s*\[\s*")([\s\S]*?)("\s*\])/g;
  
  let updated = false;
  if (noteRegex.test(content)) {
    content = content.replace(noteRegex, (match, prefix, noteText, suffix) => {
      // If links are already present, skip to avoid duplicates
      if (noteText.includes('DOWNLOAD LINKS (Direct):')) return match;
      
      let newNoteText = noteText + '\\n\\nDOWNLOAD LINKS (Direct):';
      
      let foundAny = false;
      Object.keys(MODEL_LINKS).forEach(model => {
        // Robust check: normalize both
        const cleanContent = content.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanModel = model.toLowerCase().split('.')[0].replace(/[^a-z0-9]/g, '');
        
        if (cleanContent.includes(cleanModel)) {
          newNoteText += `\\n- ${model}: ${MODEL_LINKS[model]}`;
          foundAny = true;
        }
      });
      
      if (!foundAny) return match; 
      
      updated = true;
      return `${prefix}${newNoteText}${suffix}`;
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
});

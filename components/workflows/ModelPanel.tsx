import { Package, ExternalLink, AlertCircle } from 'lucide-react';

interface ModelPanelProps {
  modelFilename: string;
}

export function ModelPanel({ modelFilename }: ModelPanelProps) {
  const getInstallPath = (name: string) => {
    const lower = name.toLowerCase();
    if ((lower.includes('flux') || lower.includes('sd')) && (lower.endsWith('.safetensors') || lower.endsWith('.ckpt'))) {
      return 'ComfyUI/models/checkpoints/';
    }
    if (lower.includes('t5') || lower.includes('clip') || lower.includes('text_encoder')) {
      return 'ComfyUI/models/text_encoders/';
    }
    if (lower.includes('vae')) {
      return 'ComfyUI/models/vae/';
    }
    if (lower.includes('control')) {
      return 'ComfyUI/models/controlnet/';
    }
    if (lower.includes('lora')) {
      return 'ComfyUI/models/loras/';
    }
    if (lower.includes('upscale') || lower.includes('esrgan') || lower.includes('realesrgan')) {
      return 'ComfyUI/models/upscale_models/';
    }
    return 'ComfyUI/models/checkpoints/';
  };

  const installPath = getInstallPath(modelFilename);

  // For the purpose of this panel, we'll show the primary model and potentially common sub-models
  // if the primary model is a FLUX or SDXL model.
  const isFlux = modelFilename.toLowerCase().includes('flux');
  const isSDXL = modelFilename.toLowerCase().includes('sd_xl');

  const models = [
    { name: modelFilename, path: installPath }
  ];

  if (isFlux) {
    models.push({ name: 't5xxl_fp16.safetensors', path: 'ComfyUI/models/text_encoders/' });
    models.push({ name: 'ae.safetensors (VAE)', path: 'ComfyUI/models/vae/' });
  } else if (isSDXL) {
    models.push({ name: 'sd_xl_vae.safetensors', path: 'ComfyUI/models/vae/' });
  }

  return (
    <div className="bg-[#111113] border border-[#2a2a30] border-t-[#f59e0b] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[#2a2a30] bg-[#111113]/50 flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <AlertCircle size={14} className="text-[#f59e0b]" />
          Required Models
        </h3>
        <span className="text-[10px] text-[#f59e0b] font-mono font-medium uppercase">
          Setup Needed
        </span>
      </div>
      
      <div className="p-5 space-y-6">
        <p className="text-[#8888a0] text-xs leading-relaxed">
          ⚠️ Download these before running the workflow. Place them in the exact target directories shown below.
        </p>

        <div className="space-y-4">
          {models.map((model, idx) => (
            <div key={idx} className="group/model">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-2 bg-[#2a2a30]/30 rounded group-hover/model:bg-[#7c6af7]/10 transition-colors">
                  <Package size={16} className="text-[#7c6af7]" />
                </div>
                <div>
                  <div className="text-[13px] font-mono font-bold text-[#e8e8f0] break-all leading-tight mb-1">
                    {model.name}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#8888a0] font-mono leading-none">→ Place in:</span>
                    <span className="text-[11px] font-mono text-[#4ade80] break-all">{model.path}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-10">
                <a 
                  href={`https://huggingface.co/search/fulltext?q=${model.name}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono font-bold border border-[#2a2a30] px-2 py-1 rounded text-[#8888a0] hover:text-white hover:border-[#7c6af7] transition-all flex items-center gap-1"
                >
                  HF <ExternalLink size={10} />
                </a>
                <a 
                  href={`https://civitai.com/search/models?query=${model.name}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono font-bold border border-[#2a2a30] px-2 py-1 rounded text-[#8888a0] hover:text-white hover:border-[#7c6af7] transition-all flex items-center gap-1"
                >
                  Civit <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

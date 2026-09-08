import fs from 'node:fs';
const assets=JSON.parse(fs.readFileSync('data/workflow-assets.json'));const oi=JSON.parse(fs.readFileSync('tmp/object-info.json'));
// Correct known model-family mismatches and unsupported animation settings in inherited graphs.
for(const id of ['15','16','17','18','19']){
 const file=`public/workflows/${id}.json`,g=JSON.parse(fs.readFileSync(file));
 for(const n of g.nodes){if(n.type==='ADE_AnimateDiffLoaderWithContext')n.widgets_values=['mm_sd_v15_v3.ckpt','autoselect',1,true];if(n.type==='EmptyLatentImage')n.widgets_values[2]=16;}
 fs.writeFileSync(file,JSON.stringify(g,null,2)+'\n');
}
for(const id of ['32','33','35']){
 const file=`public/workflows/${id}.json`,g=JSON.parse(fs.readFileSync(file));
 for(const n of g.nodes){
  if(id==='32'&&n.type==='ControlNetLoader')n.widgets_values=['diffusion_pytorch_model.safetensors'];
  if(['33','35'].includes(id)&&n.type==='CheckpointLoaderSimple')n.widgets_values=['v1-5-pruned-emaonly-fp16.safetensors'];
  if(id==='35'&&n.type==='ControlNetLoader')n.widgets_values=['control_v11f1e_sd15_tile.pth'];
  if(['33','35'].includes(id)&&n.type==='EmptyLatentImage')n.widgets_values=[512,512,1];
 }
 fs.writeFileSync(file,JSON.stringify(g,null,2)+'\n');
}
// Meaningful LTX variants: change only explicit upstream integer and prompt controls.
for(const id of ['12','13','14']){
 const file=`public/workflows/${id}.json`,g=JSON.parse(fs.readFileSync(file));const n=g.definitions.subgraphs.flatMap(s=>s.nodes);
 if(id==='12'){n.find(n=>n.id===257).widgets_values[0]=720;n.find(n=>n.id===258).widgets_values[0]=1280;}
 if(id==='13')n.find(n=>n.id===266).widgets_values[0]='A cinematic tracking shot follows a cyclist along a winding forest trail, sunlight through the trees, natural motion.';
 if(id==='14'){n.find(n=>n.id===225).widgets_values[0]=2;n.find(n=>n.id===257).widgets_values[0]=768;n.find(n=>n.id===258).widgets_values[0]=512;}
 fs.writeFileSync(file,JSON.stringify(g,null,2)+'\n');
}
// Sources for exact filenames verified against the upstream workflow notes or model repositories.
const sources={
 'v1-5-pruned-emaonly-fp16.safetensors':'https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5',
 'diffusion_pytorch_model.safetensors':'https://huggingface.co/diffusers/controlnet-depth-sdxl-1.0',
 'control_v11p_sd15_openpose.pth':'https://huggingface.co/lllyasviel/ControlNet-v1-1',
 'control_v11p_sd15_lineart.pth':'https://huggingface.co/lllyasviel/ControlNet-v1-1',
 'control_v11f1e_sd15_tile.pth':'https://huggingface.co/lllyasviel/ControlNet-v1-1',
 'RealESRGAN_x4plus.pth':'https://github.com/xinntao/Real-ESRGAN/releases',
 'RealESRGAN_x4plus_anime_6B.pth':'https://github.com/xinntao/Real-ESRGAN/releases',
 'mm_sd_v15_v3.ckpt':'https://huggingface.co/guoyww/animatediff',
 'flux1-dev.safetensors':'https://huggingface.co/black-forest-labs/FLUX.1-dev',
 'flux1-schnell.safetensors':'https://huggingface.co/black-forest-labs/FLUX.1-schnell'
};
const dirs={CheckpointLoaderSimple:'checkpoints',UNETLoader:'diffusion_models',VAELoader:'vae',CLIPLoader:'text_encoders',DualCLIPLoader:'text_encoders',TripleCLIPLoader:'text_encoders',QuadrupleCLIPLoader:'text_encoders',LoraLoader:'loras',LoraLoaderModelOnly:'loras',ControlNetLoader:'controlnet',UpscaleModelLoader:'upscale_models',CLIPVisionLoader:'clip_vision',ADE_AnimateDiffLoaderWithContext:'animatediff_models',LTXAVTextEncoderLoader:'text_encoders',LTXVAudioVAELoader:'checkpoints',LatentUpscaleModelLoader:'latent_upscale_models'};
for(const [id,a] of Object.entries(assets)){
 const g=JSON.parse(fs.readFileSync(`public/workflows/${id}.json`));const nodes=[...g.nodes,...(g.definitions?.subgraphs||[]).flatMap(s=>s.nodes)];
 const old=new Map(a.models.map(m=>[m.file,m]));a.models=[];a.settings=[];a.inputFiles=[];
 for(const n of nodes){
  if(['KSampler','KSamplerAdvanced','EmptyLatentImage','EmptyLTXVLatentVideo','PrimitiveInt','EmptyAceStep1.5LatentAudio'].includes(n.type))a.settings.push({node:n.type,id:n.id,values:n.widgets_values});
  if(n.type==='LoadImage')a.inputFiles.push(n.widgets_values?.[0]);
  for(const file of Array.isArray(n.widgets_values)?n.widgets_values:[])if(typeof file==='string'&&/\.(safetensors|ckpt|pth|pt|bin|gguf)$/i.test(file)){
   const existing=old.get(file);const url=existing?.downloadUrl||sources[file]||null;
   const modelDir=n.type==='LTXAVTextEncoderLoader'&&file.startsWith('ltx-')?'checkpoints':dirs[n.type]||'unknown';
   a.models.push({file,dir:`ComfyUI/models/${modelDir}/`,downloadUrl:url});
  }
 }
 a.models=Array.from(new Map(a.models.map(m=>[m.file,m])).values());
 a.nodeTypes=[...new Set(nodes.map(n=>n.type))];
 a.missingModelSources=a.models.filter(m=>!m.downloadUrl).map(m=>m.file);
}
fs.writeFileSync('data/workflow-assets.json',JSON.stringify(assets,null,2)+'\n');

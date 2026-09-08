import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const mod={exports:{}};new Function('exports',ts.transpile(fs.readFileSync('lib/workflowsData.ts','utf8'),{module:ts.ModuleKind.CommonJS}))(mod.exports);
const catalog=mod.exports.WORKFLOWS;
const templates='D:/AI/ComfyUI/venv/Lib/site-packages/comfyui_workflow_templates_json/templates';
const backup='tmp/original-numbered-workflows';fs.mkdirSync(backup,{recursive:true});
for(const w of catalog)if(!fs.existsSync(`${backup}/${w.id}.json`))fs.copyFileSync(`public/workflows/${w.id}.json`,`${backup}/${w.id}.json`);
fs.mkdirSync('public/workflows/licenses',{recursive:true});
for(const file of ['comfy-templates-license.txt','comfy-examples-license.txt'])fs.copyFileSync('tmp/upstream/'+file,'public/workflows/licenses/'+file);
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const local=id=>fs.readdirSync('public/workflows').find(f=>f.startsWith(id+'-'));
const mapping={
 '01':`${backup}/01.json`,'02':`${templates}/flux_schnell_full_text_to_image.json`,'03':`${templates}/sdxl_refiner_prompt_example.json`,
 '04':'public/workflows/06-sd15-classic.json','05':`${templates}/hidream_i1_dev.json`,'06':'tmp/upstream/hunyuan.json','07':'tmp/upstream/lumina.json',
 '08':`${templates}/image_qwen_image_edit.json`,'09':`${templates}/image_chroma_text_to_image.json`,'10':'tmp/upstream/aura.json',
 '11':`${templates}/video_ltx2_3_t2v.json`,'12':`${templates}/video_ltx2_3_t2v.json`,'13':`${templates}/video_ltx2_3_t2v.json`,'14':`${templates}/video_ltx2_3_t2v.json`,
 '15':'public/workflows/15-animatediff-simple.json','16':'public/workflows/17-animatediff-loop.json','17':'public/workflows/18-animatediff-landscape.json','18':'public/workflows/19-animatediff-product.json','19':'public/workflows/20-animatediff-zoom.json',
 '20':`${backup}/32.json`,'43':`${templates}/audio_ace_step_1_5_checkpoint.json`,
 '46':'public/workflows/47-sdxl-abstract-art.json','47':'public/workflows/09-sdxl-landscape.json','48':'public/workflows/09-sdxl-landscape.json',
};
// Use the known separate-loader Flux architecture for all Flux prompt variants.
for(const id of ['30','40','44','50'])mapping[id]=`${backup}/01.json`;
const records={};
for(const w of catalog){
 const source=mapping[w.id]||'public/workflows/'+local(w.id);
 const graph=read(source);
 const allNodes=[...(graph.nodes||[]),...(graph.definitions?.subgraphs||[]).flatMap(s=>s.nodes||[])];
 const isTemplate=source.startsWith(templates), isExample=source.startsWith('tmp/upstream');
 const sourceUrl=isTemplate?`https://github.com/Comfy-Org/workflow_templates/blob/main/templates/${path.basename(source)}`:isExample?`https://comfyanonymous.github.io/ComfyUI_examples/${{hunyuan:'hunyuan_image',lumina:'lumina2',aura:'aura_flow'}[path.basename(source,'.json')]}/`:source.includes('original-numbered')?'https://github.com/Comfy-Org/workflow_templates':'Existing NeuralDrift workflow asset';
 // Repair the classic checkpoint name to the actual official fp16 file (also installed locally).
 if(w.id==='04')for(const n of allNodes)if(n.type==='CheckpointLoaderSimple')n.widgets_values=['v1-5-pruned-emaonly-fp16.safetensors'];
 // Core image prompt variants; never change upstream video/audio widget schemas by guesswork.
 if(['28','29','30','36','37','38','39','40','41','42','44','45','46','47','48','49','50'].includes(w.id)) {
   const positive=allNodes.find(n=>n.type==='CLIPTextEncodeFlux')||allNodes.find(n=>n.type==='CLIPTextEncode');
   if(positive&&typeof positive.widgets_values?.[0]==='string')positive.widgets_values[0]=w.proofPrompt;
 }
 // Remove unsupported hardware/benchmark notes from older locally authored graphs.
 if(!isTemplate&&!isExample)for(const n of allNodes)if(n.type==='Note'){
   n.widgets_values=['NeuralDrift workflow. Review dependencies on the workflow page. Hardware compatibility and generation speed require an actual test.'];
   if(n.properties?.text)n.properties.text=n.widgets_values[0];
 }
 let license=isTemplate?'comfy-templates-license.txt':isExample?'comfy-examples-license.txt':null;
 graph.extra={...graph.extra,neuraldrift:{catalogId:w.id,source:sourceUrl,sourceAsset:path.basename(source),license:license?`/workflows/licenses/${license}`:null,executionTested:false}};
 fs.writeFileSync(`public/workflows/${w.id}.json`,JSON.stringify(graph,null,2)+'\n');
 const models=[]; const urls=JSON.stringify(graph).match(/https?:[^\s"<>\\)]+/g)||[];
 const dirs={CheckpointLoaderSimple:'checkpoints',UNETLoader:'diffusion_models',VAELoader:'vae',CLIPLoader:'text_encoders',DualCLIPLoader:'text_encoders',TripleCLIPLoader:'text_encoders',QuadrupleCLIPLoader:'text_encoders',LoraLoader:'loras',LoraLoaderModelOnly:'loras',ControlNetLoader:'controlnet',UpscaleModelLoader:'upscale_models',CLIPVisionLoader:'clip_vision',ADE_AnimateDiffLoaderWithContext:'animatediff_models'};
 for(const n of allNodes)for(const value of Array.isArray(n.widgets_values)?n.widgets_values:[])if(typeof value==='string'&&/\.(safetensors|ckpt|pt|pth|bin|gguf)$/i.test(value)){
   const existing=w.modelPaths.find(m=>m.file===value);
   const modelUrl=n.properties?.models?.find(m=>m.name===value)?.url || urls.find(u=>u.includes(value)&&/huggingface.co/.test(u)) || existing?.downloadUrl || null;
   models.push({file:value,dir:`ComfyUI/models/${dirs[n.type]||'unknown'}/`,downloadUrl:modelUrl});
 }
 records[w.id]={source:sourceUrl,sourceAsset:path.basename(source),license:license?`/workflows/licenses/${license}`:null,models:Array.from(new Map(models.map(m=>[m.file,m])).values()),nodeTypes:[...new Set(allNodes.map(n=>n.type))],hasSubgraphs:!!graph.definitions?.subgraphs?.length,executionTested:false};
}
fs.writeFileSync('data/workflow-assets.json',JSON.stringify(records,null,2)+'\n');
console.log('Repaired 50 numbered download mappings; original numbered assets preserved in tmp/original-numbered-workflows.');

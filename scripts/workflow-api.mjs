import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { workflowSha256 } from './workflow-hashes.mjs';
// Graphs with subgraphs are converted by ComfyUI's own frontend (scripts/convert-subgraph-workflows.mjs)
// and saved with the hash of the workflow file they came from. A missing or stale conversion
// is a setup gap, so this throws instead of guessing.
export function savedSubgraphPrompt(id){
 const file=`data/subgraph-prompts/${id}.json`;
 if(!fs.existsSync(file))throw new Error(`Workflow ${id} uses subgraphs and has no frontend conversion: run npm run evidence:subgraphs -- ${id}`);
 const saved=JSON.parse(fs.readFileSync(file,'utf8'));
 if(saved.workflowSha256!==workflowSha256(id))throw new Error(`${file} was converted from a different version of workflow ${id}: run npm run evidence:subgraphs -- ${id}`);
 return saved.prompt;
}
export function apiPrompt(graph, info = JSON.parse(fs.readFileSync('tmp/object-info.json'))){
 if(graph.definitions?.subgraphs?.length)throw new Error('Subgraph conversion requires the ComfyUI frontend: use savedSubgraphPrompt.');
 const prompt={};const nodes=new Map(graph.nodes.map(n=>[n.id,n]));
 for(const node of graph.nodes){
  if(['Note','MarkdownNote','PrimitiveNode','Reroute'].includes(node.type))continue;
  if(node.mode&&node.mode!==0)throw new Error('Bypass/mute graph needs frontend conversion');
  const schema=info[node.type];if(!schema)throw new Error('Unavailable node: '+node.type);
  const inputs={};let wi=0;
  // Dynamic combos (V3 nodes, e.g. SaveVideo's format) send the selected key under their own
  // name and the selected option's inputs as "parent.child", saved in that order in
  // widgets_values. Hidden inputs have no widget and no saved value.
  const walk=(defs,prefix)=>{for(const [key,[type,options]] of Object.entries(defs)){
   if(options?.hidden)continue;
   const name=prefix+key;
   const connection=node.inputs?.find(n=>n.name===name);
   const dynamic=type==='COMFY_DYNAMICCOMBO_V3';
   const widget=dynamic||Array.isArray(type)||['INT','FLOAT','STRING','BOOLEAN','COMBO'].includes(type);
   if(connection?.link!=null){
    const link=graph.links.find(l=>l[0]===connection.link);const from=nodes.get(link[1]);
    if(from.type==='PrimitiveNode')inputs[name]=from.widgets_values[0];else inputs[name]=[String(link[1]),link[2]];
   }
   if(widget&&!options?.forceInput){
    const value=Array.isArray(node.widgets_values)?node.widgets_values[wi]:node.widgets_values?.[name];
    if(connection?.link==null) { if(value!==undefined)inputs[name]=value; else if(options?.default!==undefined)inputs[name]=options.default; }
    wi++;if(options?.control_after_generate||['seed','noise_seed'].includes(name)&&['fixed','randomize','increment','decrement'].includes(node.widgets_values?.[wi]))wi++;
    if(dynamic){
     const selected=options.options.find(o=>o.key===inputs[name]);
     if(!selected)throw new Error(`${node.type}.${name}: "${inputs[name]}" is not an option`);
     walk({...selected.inputs.required,...selected.inputs.optional},name+'.');
    }
   }
  }};
  walk({...schema.input.required,...schema.input.optional},'');
  prompt[node.id]={class_type:node.type,inputs};
 }
 return prompt;
}
if(process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href && process.argv[2]){const id=process.argv[2];const graph=JSON.parse(fs.readFileSync(`public/workflows/${id}.json`));fs.writeFileSync(`tmp/${id}-api.json`,JSON.stringify({prompt:apiPrompt(graph)},null,2));}

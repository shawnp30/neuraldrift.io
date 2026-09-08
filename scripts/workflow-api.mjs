import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
export function apiPrompt(graph, info = JSON.parse(fs.readFileSync('tmp/object-info.json'))){
 if(graph.definitions?.subgraphs?.length)throw new Error('Subgraph conversion requires the ComfyUI frontend.');
 const prompt={};const nodes=new Map(graph.nodes.map(n=>[n.id,n]));
 for(const node of graph.nodes){
  if(['Note','MarkdownNote','PrimitiveNode','Reroute'].includes(node.type))continue;
  if(node.mode&&node.mode!==0)throw new Error('Bypass/mute graph needs frontend conversion');
  const schema=info[node.type];if(!schema)throw new Error('Unavailable node: '+node.type);
  const inputs={};let wi=0;const defs={...schema.input.required,...schema.input.optional};
  for(const [name,[type,options]] of Object.entries(defs)){
   const connection=node.inputs?.find(n=>n.name===name);
   const widget=Array.isArray(type)||['INT','FLOAT','STRING','BOOLEAN','COMBO'].includes(type);
   if(connection?.link!=null){
    const link=graph.links.find(l=>l[0]===connection.link);const from=nodes.get(link[1]);
    if(from.type==='PrimitiveNode')inputs[name]=from.widgets_values[0];else inputs[name]=[String(link[1]),link[2]];
   }
   if(widget&&!options?.forceInput){
    const value=Array.isArray(node.widgets_values)?node.widgets_values[wi]:node.widgets_values?.[name];
    if(connection?.link==null) { if(value!==undefined)inputs[name]=value; else if(options?.default!==undefined)inputs[name]=options.default; }
    wi++;if(options?.control_after_generate||['seed','noise_seed'].includes(name)&&['fixed','randomize','increment','decrement'].includes(node.widgets_values?.[wi]))wi++;
   }
  }
  prompt[node.id]={class_type:node.type,inputs};
 }
 return prompt;
}
if(process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href && process.argv[2]){const id=process.argv[2];const graph=JSON.parse(fs.readFileSync(`public/workflows/${id}.json`));fs.writeFileSync(`tmp/${id}-api.json`,JSON.stringify({prompt:apiPrompt(graph)},null,2));}

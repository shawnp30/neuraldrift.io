import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync('lib/workflowsData.ts','utf8');
const js = ts.transpile(source,{module:ts.ModuleKind.CommonJS});
const mod={exports:{}}; new Function('exports',js)(mod.exports);
const rows=mod.exports.WORKFLOWS.map(w=>{
 const path='public'+(w.workflowJsonUrl||`/workflows/${w.id}.json`);
 if(!fs.existsSync(path))return {id:w.id,title:w.title,missing:path};
 const graph=JSON.parse(fs.readFileSync(path,'utf8'));
 const nodes=graph.nodes||[]; const ids=new Set(nodes.map(n=>n.id)); const errors=[];
 for(const l of graph.links||[]) {if(!ids.has(l[1])||!ids.has(l[3]))errors.push(`Dangling link ${l[0]}`);}
 const models=nodes.filter(n=>/Loader/.test(n.type)).map(n=>({type:n.type,values:n.widgets_values}));
 return {id:w.id,title:w.title,nodes:nodes.length,errors,types:[...new Set(nodes.map(n=>n.type))],models,listedModels:w.modelPaths.map(m=>m.file),imageExists:fs.existsSync('public'+w.imageUrl)};
});
fs.writeFileSync('tmp/workflow-audit.json',JSON.stringify(rows,null,2));
console.log(JSON.stringify(rows.map(({models,listedModels,types,...r})=>r),null,2));

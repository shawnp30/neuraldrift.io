import fs from 'node:fs';
const info=JSON.parse(fs.readFileSync('tmp/object-info.json'));
const audit=[];
for(let i=1;i<=50;i++){
 const id=String(i).padStart(2,'0'),g=JSON.parse(fs.readFileSync(`public/workflows/${id}.json`));const errors=[];
 for(const [label,graph] of [['root',g],...(g.definitions?.subgraphs||[]).map(s=>[s.id,s])]){
  const nodes=new Map(graph.nodes.map(n=>[n.id,n]));const linkMap=new Map((graph.links||[]).map(l=>Array.isArray(l)?[l[0],l]:[l.id,[l.id,l.origin_id,l.origin_slot,l.target_id,l.target_slot,l.type]]));
  for(const [lid,l] of linkMap){const from=nodes.get(l[1]),to=nodes.get(l[3]);if(!from&&l[1]>=0||!to&&l[3]>=0){errors.push(`${label}: link ${lid} missing node`);continue;}if(from&&!from.outputs?.[l[2]])errors.push(`${label}: link ${lid} missing source slot`);if(to&&!to.inputs?.[l[4]])errors.push(`${label}: link ${lid} missing target slot`);if(to&&to.inputs?.[l[4]]?.link!==lid)errors.push(`${label}: link ${lid} target disagrees`);if(from&&from.outputs?.[l[2]]?.links&&!from.outputs[l[2]].links.includes(lid))errors.push(`${label}: link ${lid} source disagrees`);}
  for(const n of nodes.values())for(const input of n.inputs||[])if(input.link!==null&&input.link!==undefined&&!linkMap.has(input.link))errors.push(`${label}: ${n.id} missing input link ${input.link}`);
 }
 const types=[...new Set([...(g.nodes||[]),...(g.definitions?.subgraphs||[]).flatMap(s=>s.nodes)].map(n=>n.type))];
 const unknown=types.filter(t=>!info[t]&&!['Note','MarkdownNote','PrimitiveNode','Reroute'].includes(t)&&!(g.definitions?.subgraphs||[]).some(s=>s.id===t));
 audit.push({id,errors,unavailableNodes:unknown});
}
fs.writeFileSync('tmp/graph-validation.json',JSON.stringify(audit,null,2)); console.log(JSON.stringify(audit.filter(a=>a.errors.length||a.unavailableNodes.length),null,2));

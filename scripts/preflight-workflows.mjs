import fs from 'node:fs';import {apiPrompt} from './workflow-api.mjs';
const oi=JSON.parse(fs.readFileSync('tmp/object-info.json'));const report=[];
for(let i=1;i<=50;i++){
 const id=String(i).padStart(2,'0');try{const prompt=apiPrompt(JSON.parse(fs.readFileSync(`public/workflows/${id}.json`)));const issues=[];
 for(const n of Object.values(prompt)){for(const [key,def] of Object.entries(oi[n.class_type].input.required||{})){
  if(n.inputs[key]===undefined)issues.push(`${n.class_type}.${key}: missing`);
  else if(Array.isArray(def[0])&&!Array.isArray(n.inputs[key])&&!def[0].includes(n.inputs[key]))issues.push(`${n.class_type}.${key}: ${n.inputs[key]} not available`);
 }}report.push({id,issues});fs.writeFileSync(`tmp/${id}-api.json`,JSON.stringify({prompt},null,2));
 }catch(e){report.push({id,issues:[e.message]});}
}
fs.writeFileSync('tmp/execution-preflight.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

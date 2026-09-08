import fs from 'node:fs';import crypto from 'node:crypto';
const history=JSON.parse(fs.readFileSync('tmp/comfy-history.json'));const run=Object.values(history)[0];const output=Object.values(run.outputs)[0].images[0];
fs.mkdirSync('public/workflow-tests',{recursive:true});fs.copyFileSync(`tmp/comfy-output/${output.subfolder?output.subfolder+'/':''}${output.filename}`,'public/workflow-tests/04-output.png');
const stats=JSON.parse(fs.readFileSync('tmp/comfy-system.json'));const times=run.status.messages;const start=times.find(m=>m[0]==='execution_start')?.[1].timestamp;const end=times.find(m=>m[0]==='execution_success')?.[1].timestamp;
const api=JSON.parse(fs.readFileSync('tmp/04-api.json')).prompt;
const record={workflowId:'04',status:'completed',workflowSha256:crypto.createHash('sha256').update(fs.readFileSync('public/workflows/04.json')).digest('hex'),testDate:new Date(end).toISOString(),gpu:stats.devices[0].name,gpuMemoryBytes:stats.devices[0].vram_total,systemRamBytes:stats.system.ram_total,os:stats.system.os,python:stats.system.python_version,comfyUI:stats.system.comfyui_version,pytorch:stats.system.pytorch_version,settings:api['5'].inputs,resolution:'512 × 512',batchSize:1,generationSeconds:(end-start)/1000,peakMemory:null,model:'v1-5-pruned-emaonly-fp16.safetensors',modelSha256:null,customNodes:'None; custom nodes disabled',preview:'/workflow-tests/04-output.png',prompt:api['2'].inputs.text};
fs.writeFileSync('data/workflow-tests.json',JSON.stringify({'04':record},null,2));
fs.writeFileSync('public/workflow-tests/04-record.json',JSON.stringify(record,null,2));
console.log(record.gpu,record.generationSeconds,record.resolution);

import fs from 'node:fs';import crypto from 'node:crypto';
const tests=JSON.parse(fs.readFileSync('data/workflow-tests.json'));
for(const t of Object.values(tests)){const h=crypto.createHash('sha256');for await(const chunk of fs.createReadStream('D:/AI/ComfyUI/models/checkpoints/'+t.model))h.update(chunk);t.modelSha256=h.digest('hex');fs.writeFileSync(`public/workflow-tests/${t.workflowId}-record.json`,JSON.stringify(t,null,2));}
fs.writeFileSync('data/workflow-tests.json',JSON.stringify(tests,null,2));console.log('Recorded exact model hashes for both completed runs.');

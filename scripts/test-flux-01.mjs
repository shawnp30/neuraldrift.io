import fs from 'fs';
import http from 'http';

function graphToPrompt(graph) {
  const prompt = {};
  const links = new Map();
  (graph.links || []).forEach(l => {
    links.set(l[0], [String(l[1]), l[2]]);
  });

  for (const node of graph.nodes) {
    if (node.type === 'MarkdownNote' || node.type === 'Note') continue;

    const pNode = {
      class_type: node.type,
      inputs: {}
    };

    if (node.inputs) {
      for (const input of node.inputs) {
        if (input.link != null && links.has(input.link)) {
          pNode.inputs[input.name] = links.get(input.link);
        }
      }
    }

    if (node.widgets_values) {
      if (node.type === 'UNETLoader') {
        pNode.inputs['unet_name'] = 'flux1-dev-fp8.safetensors';
        pNode.inputs['weight_dtype'] = node.widgets_values[1] || 'default';
      } else if (node.type === 'DualCLIPLoader') {
        pNode.inputs['clip_name1'] = 'clip_l.safetensors';
        pNode.inputs['clip_name2'] = 't5xxl_fp8_e4m3fn.safetensors';
        pNode.inputs['type'] = 'flux';
      } else if (node.type === 'VAELoader') {
        pNode.inputs['vae_name'] = 'ae.safetensors';
      } else if (node.type === 'KSampler') {
        pNode.inputs['seed'] = 42;
        pNode.inputs['steps'] = 15;
        pNode.inputs['cfg'] = 1.0;
        pNode.inputs['sampler_name'] = 'euler';
        pNode.inputs['scheduler'] = 'simple';
        pNode.inputs['denoise'] = 1.0;
      } else if (node.type === 'CLIPTextEncodeFlux') {
        pNode.inputs['clip_l'] = node.widgets_values[0] || 'beautiful digital art';
        pNode.inputs['t5xxl'] = node.widgets_values[1] || 'beautiful digital art';
        pNode.inputs['guidance'] = node.widgets_values[2] || 3.5;
      } else if (node.type === 'EmptySD3LatentImage') {
        pNode.inputs['width'] = 512;
        pNode.inputs['height'] = 512;
        pNode.inputs['batch_size'] = 1;
      } else if (node.type === 'SaveImage') {
        pNode.inputs['filename_prefix'] = 'neuraldrift_test_01';
      }
    }

    prompt[String(node.id)] = pNode;
  }
  return prompt;
}

const graph = JSON.parse(fs.readFileSync('public/workflows/01.json', 'utf8'));
const prompt = graphToPrompt(graph);

console.log('Sending Flux.1 Dev prompt to ComfyUI...');

const postData = JSON.stringify({ prompt });

const req = http.request({
  hostname: '127.0.0.1',
  port: 8191,
  path: '/prompt',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', err => console.error('Error:', err));
req.write(postData);
req.end();

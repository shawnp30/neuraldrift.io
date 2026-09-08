import fs from 'fs';
import http from 'http';

function graphToPrompt(graph, id) {
  const prompt = {};
  const links = new Map();
  (graph.links || []).forEach(l => {
    links.set(l[0], [String(l[1]), l[2]]);
  });

  for (const node of graph.nodes) {
    if (node.type === 'Note' || node.type === 'MarkdownNote') continue;

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
      const vals = node.widgets_values;
      if (node.type === 'CheckpointLoaderSimple') {
        pNode.inputs['ckpt_name'] = 'realisticVisionV60B1_v60B1VAE.safetensors';
      } else if (node.type === 'ADE_AnimateDiffLoaderWithContext') {
        pNode.inputs['model_name'] = 'mm_sd_v15_v2.ckpt';
        pNode.inputs['beta_schedule'] = 'autoselect';
      } else if (node.type === 'EmptyLatentImage') {
        pNode.inputs['width'] = 512;
        pNode.inputs['height'] = 512;
        pNode.inputs['batch_size'] = 8; // 8 frames for rapid verification
      } else if (node.type === 'KSampler') {
        pNode.inputs['seed'] = typeof vals[0] === 'number' ? vals[0] : 42;
        pNode.inputs['steps'] = 12; // fast validation steps
        pNode.inputs['cfg'] = 7.0;
        pNode.inputs['sampler_name'] = 'euler';
        pNode.inputs['scheduler'] = 'normal';
        pNode.inputs['denoise'] = 1.0;
      } else if (node.type === 'CLIPTextEncode') {
        pNode.inputs['text'] = vals[0] || '';
      } else if (node.type === 'VHS_VideoCombine') {
        pNode.inputs['frame_rate'] = 8;
        pNode.inputs['loop_count'] = 0;
        pNode.inputs['filename_prefix'] = `nd_test_${id}`;
        pNode.inputs['format'] = 'video/h264-mp4';
        pNode.inputs['pingpong'] = false;
        pNode.inputs['save_output'] = true;
      }
    }

    prompt[String(node.id)] = pNode;
  }
  return prompt;
}

const graph = JSON.parse(fs.readFileSync('public/workflows/15.json', 'utf8'));
const prompt = graphToPrompt(graph, '15');

console.log('Sending AnimateDiff prompt to ComfyUI on port 8192...');

const postData = JSON.stringify({ prompt });

const req = http.request({
  hostname: '127.0.0.1',
  port: 8192,
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

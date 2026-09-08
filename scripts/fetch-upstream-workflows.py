import urllib.request, io, json, pathlib
from PIL import Image
out=pathlib.Path('tmp/upstream');out.mkdir(exist_ok=True)
for name,url in {
'aura':'https://comfyanonymous.github.io/ComfyUI_examples/aura_flow/aura_flow_0.2_example.png',
'hunyuan':'https://comfyanonymous.github.io/ComfyUI_examples/hunyuan_image/hunyuan_image_example.png',
'lumina':'https://comfyanonymous.github.io/ComfyUI_examples/lumina2/lumina2_basic_example.png'
}.items():
 data=urllib.request.urlopen(url,timeout=30).read(); im=Image.open(io.BytesIO(data)); graph=json.loads(im.info['workflow']);(out/(name+'.json')).write_text(json.dumps(graph,indent=2)); print(name,len(graph['nodes']))
for name,url in {'comfy-templates-license.txt':'https://raw.githubusercontent.com/Comfy-Org/workflow_templates/main/LICENSE','comfy-examples-license.txt':'https://raw.githubusercontent.com/comfyanonymous/ComfyUI_examples/master/LICENSE'}.items():
 (out/name).write_bytes(urllib.request.urlopen(url,timeout=30).read())

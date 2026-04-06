const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DESKTOP_BASE = 'C:\\Users\\shawn\\Desktop\\workflow updates';
const PROJECT_ROOT = process.cwd();
const DEST_JSON = path.join(PROJECT_ROOT, 'public', 'workflows');
const DEST_THUMBS = path.join(PROJECT_ROOT, 'public', 'workflow-thumbs');

// Ensure destination directories exist
if (!fs.existsSync(DEST_JSON)) fs.mkdirSync(DEST_JSON, { recursive: true });
if (!fs.existsSync(DEST_THUMBS)) fs.mkdirSync(DEST_THUMBS, { recursive: true });

const mapping = {
  "01": "flux_dev_t2i.json",
  "02": "flux_schnell_full.json",
  "03": "sdxl_simple.json",
  "04": "get_started.json",
  "05": "hidream_dev.json",
  "06": "hunyuan_t2v.json",
  "07": "lumina_t2i.json",
  "08": "qwen_subgraph.json",
  "09": "chroma_t2i.json",
  "10": "sd35_simple.json",
  "11": "image_to_real.json",
  "12": "flux_kontext.json",
  "13": "sd35_blur.json",
  "14": "sd35_simple.json",
  "15": "flux_fill_inpaint.json",
  "16": "flux_fill_inpaint.json",
  "17": "flux_outpaint.json",
  "18": "flux_canny.json",
  "19": "sdpose_multi.json",
  "20": "flux_depth.json",
  "21": "qwen_layered_control.json",
  "22": "flux_redux.json",
  "23": "interpolation_upscale.json",
  "24": "realistic_2k.json",
  "25": "magnific_precise.json",
  "26": "qwen_lora_control.json",
  "27": "qwen_image_edit.json",
  "28": "flux_depth_lora.json",
  "29": "color_illustration.json",
  "30": "character_sheet.json",
  "31": "sdxl_revision.json",
  "32": "wan21_t2v.json",
  "33": "wan21_i2v.json",
  "34": "wan22_14B_i2v.json",
  "35": "ltxv_t2v.json",
  "36": "hunyuan_15_t2v.json",
  "37": "txt_to_img_to_vid.json",
  "38": "video_humo.json",
  "39": "wan_vace_v2v.json",
  "40": "hunyuan3d_i2model.json",
  "41": "multiview_to_model.json",
  "42": "all_in_one_edit.json",
  "43": "ace_step_t2a_song.json",
  "44": "stable_audio.json",
  "45": "portrait_light.json",
  "46": "character_sheet.json",
  "47": "wan22_fun_control.json",
  "48": "sdxlturbo.json",
  "49": "omnigen2_t2i.json",
  "50": "z_image.json"
};

const chunks = [
  'workflow_chunk1_image_gen',
  'workflow_chunk2_controlnet_lora',
  'workflow_chunk3_video_composition',
  'workflow_chunk4_audio_face_experimental'
];

let successCount = 0;
let failCount = 0;

for (const [id, jsonName] of Object.entries(mapping)) {
  let found = false;
  const idPrefix = id.toString().padStart(2, '0');

  for (const chunk of chunks) {
    const imagesDir = path.join(DESKTOP_BASE, chunk, 'workflow_images');
    if (!fs.existsSync(imagesDir)) continue;

    const folders = fs.readdirSync(imagesDir);
    const targetFolder = folders.find(f => f.startsWith(idPrefix + '_'));

    if (targetFolder) {
      const folderPath = path.join(imagesDir, targetFolder);
      const possibleJsonNames = [
        jsonName,
        jsonName.replace('.json', 'json.json'),
        'default.json'
      ];

      let jsonSourcePath = null;
      let actualJsonName = null;
      for (const pName of possibleJsonNames) {
        if (fs.existsSync(path.join(folderPath, pName))) {
          jsonSourcePath = path.join(folderPath, pName);
          actualJsonName = pName;
          break;
        }
      }

      if (jsonSourcePath) {
        // Copy JSON
        const destJsonPath = path.join(DEST_JSON, `${idPrefix}.json`);
        fs.copyFileSync(jsonSourcePath, destJsonPath);

        // Handle Image
        const baseName = actualJsonName.replace('.json', '');
        const possibleWebpNames = [
          path.join(folderPath, `${baseName}-1.webp`),
          path.join(folderPath, `${baseName}.webp`),
          path.join(folderPath, `default-1.webp`),
          path.join(folderPath, `preview-1.webp`)
        ];

        let webpSourcePath = null;
        for (const pImg of possibleWebpNames) {
          if (fs.existsSync(pImg)) {
            webpSourcePath = pImg;
            break;
          }
        }

        if (webpSourcePath) {
          const pngDestPath = path.join(DEST_THUMBS, `${idPrefix}.png`);
          try {
            // Using -vframes 1 to ensure we get a static thumbnail from any video/animated file
            execSync(`ffmpeg -y -i "${webpSourcePath}" -vframes 1 "${pngDestPath}"`, { stdio: 'ignore' });
            process.stdout.write(`[OK] Migrated ${idPrefix}\n`);
          } catch (err) {
            process.stdout.write(`[ERR] Failed Image ${idPrefix}: ${webpSourcePath}\n`);
          }
        } else {
          process.stdout.write(`[WARN] No Image ${idPrefix}\n`);
        }

        found = true;
        successCount++;
        break;
      }
    }
  }

  if (!found) {
    process.stdout.write(`[FAIL] ID ${idPrefix} missing\n`);
    failCount++;
  }
}

console.log(`\nMigration completed: ${successCount} workflows migrated.`);

// Fix script: copy remaining missing thumbnails as .webp (skipping conversion)
// and update workflowsData.ts to use all local paths

const fs = require('fs');
const path = require('path');

const DESKTOP_BASE = 'C:/Users/shawn/Desktop/workflow updates';
const PROJECT_ROOT = process.cwd();
const DEST_THUMBS = path.join(PROJECT_ROOT, 'public', 'workflow-thumbs');

const chunks = [
  'workflow_chunk1_image_gen',
  'workflow_chunk2_controlnet_lora',
  'workflow_chunk3_video_composition',
  'workflow_chunk4_audio_face_experimental'
];

// For each missing ID, find the first .webp in its folder and copy it
const missingIds = [30, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47];

// Build a catalog of all folder contents
const folderMap = {};
chunks.forEach(chunk => {
  const imagesDir = path.join(DESKTOP_BASE, chunk, 'workflow_images');
  if (!fs.existsSync(imagesDir)) return;
  fs.readdirSync(imagesDir).forEach(folder => {
    const match = folder.match(/^(\d{2})_/);
    if (match) folderMap[match[1]] = path.join(imagesDir, folder);
  });
});

missingIds.forEach(id => {
  const idp = id.toString().padStart(2, '0');
  const folderPath = folderMap[idp];
  if (!folderPath) { console.log(`[FAIL] No folder for ${idp}`); return; }

  const files = fs.readdirSync(folderPath);
  // Find the first -1.webp file
  const webp = files.find(f => f.endsWith('-1.webp')) || files.find(f => f.endsWith('.webp'));
  if (!webp) { console.log(`[WARN] No webp for ${idp}`); return; }

  const src = path.join(folderPath, webp);
  // Copy as .webp (browsers support it natively)
  const dest = path.join(DEST_THUMBS, `${idp}.webp`);
  fs.copyFileSync(src, dest);
  console.log(`[OK] Copied ${idp}.webp`);
});

// ─── Now update workflowsData.ts to use all local paths ─────────────────────
console.log('\nUpdating workflowsData.ts...');
const dataFile = path.join(PROJECT_ROOT, 'lib', 'workflowsData.ts');
let content = fs.readFileSync(dataFile, 'utf8');

// Check what thumbnails exist
const thumbsDir = fs.readdirSync(DEST_THUMBS);
const thumbMap = {};
thumbsDir.forEach(f => {
  const match = f.match(/^(\d{2})\.(png|webp)$/);
  if (match) thumbMap[match[1]] = `/workflow-thumbs/${f}`;
});

// Replace each imageUrl in the WORKFLOWS array
// Pattern: entry id "XX" should get imageUrl: `/workflow-thumbs/XX.png` or `.webp`
let updated = 0;
for (const [idp, localPath] of Object.entries(thumbMap)) {
  // Find the entry with id: "XX" and update its imageUrl
  // Use a regex that matches the imageUrl line after the id declaration
  const idNum = parseInt(idp, 10);
  // The entries have  id: "01", id: "02" etc.
  // We need to update imageUrl for each entry
  // Build pattern that matches imageUrl within proximity of id: "XX"
}

// Simpler approach: replace all imageUrl that point to external BASE URLs
// with local /workflow-thumbs/ paths based on a sequential mapping
const idToLocalPath = thumbMap;

// Replace imageUrl values for each workflow entry
// The id field and imageUrl are both in each entry object
// We'll do a single-pass replacement using the known workflow IDs
const idMapping = {
  "01": "flux_dev_t2i", "02": "flux_schnell", "03": "sdxl", "04": "sd15",
  "05": "hidream", "06": "hunyuan", "07": "lumina", "08": "qwen",
  "09": "chroma", "10": "sd35", "11": "img2img", "12": "flux_kontext",
  "13": "sd35_blur", "14": "sd35_b", "15": "flux_fill", "16": "flux_fill2",
  "17": "flux_outpaint", "18": "flux_canny", "19": "sdpose", "20": "flux_depth",
  "21": "qwen_ctrl", "22": "flux_redux", "23": "esrgan", "24": "hires",
  "25": "supir", "26": "lora", "27": "embeddings", "28": "flux_lora",
  "29": "color", "30": "char_sheet", "31": "unclip", "32": "wan21_t2v",
  "33": "wan21_i2v", "34": "wan22", "35": "ltxv", "36": "hunyuan_vid",
  "37": "svd", "38": "mochi", "39": "cosmos", "40": "hunyuan3d",
  "41": "zero123", "42": "merge", "43": "ace_step", "44": "stable_audio",
  "45": "reactor", "46": "instantid", "47": "animatediff", "48": "lcm",
  "49": "omnigen", "50": "z_image"
};

// Parse and update each entry's imageUrl
// Match pattern: id: "XX", ... imageUrl: `...`
for (let i = 1; i <= 50; i++) {
  const idp = i.toString().padStart(2, '0');
  const localPath = idToLocalPath[idp];
  if (!localPath) continue;

  // Match imageUrl line(s) near the id declaration
  // Regex: find imageUrl inside a block that starts with id: "XX"
  // This is a simplified replace - find the imageUrl on the same logical entry
  // We'll do it by splitting on entries
}

// Best approach: do a block-based replace
// Split content into entry blocks and replace imageUrl in each
const entryRegex = /(\{\s*id:\s*"(\d{2})"[\s\S]*?imageUrl:\s*)(`.+?`|'.+?'|"[^"]+")([^}]*?\})/g;

const newContent = content.replace(entryRegex, (match, before, id, oldUrl, after) => {
  const localPath = idToLocalPath[id];
  if (!localPath) return match;
  updated++;
  return `${before}\`${localPath}\`${after}`;
});

if (updated > 0) {
  fs.writeFileSync(dataFile, newContent, 'utf8');
  console.log(`\n[OK] Updated ${updated} imageUrl entries in workflowsData.ts`);
} else {
  console.log('[WARN] No imageUrl entries were updated. Check regex.');
}

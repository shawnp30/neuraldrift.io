const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'content/guides');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));

const parseFM = (str) => {
  const match = str.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return {};
  const lines = match[1].split(/\r?\n/);
  const data = {};
  lines.forEach(l => {
    const colon = l.indexOf(':');
    if (colon > 0) {
      const key = l.slice(0, colon).trim();
      let val = l.slice(colon+1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      data[key] = val;
    }
  });
  return data;
}

const guides = files.map(f => {
  const c = fs.readFileSync(path.join(dir, f), 'utf-8');
  const data = parseFM(c);
  return {
    slug: f.replace('.mdx',''),
    title: data.title || f,
    difficulty: (data.difficulty && data.difficulty !== "undefined") ? data.difficulty : 'Beginner',
    tag: data.tag || 'Guide',
    desc: data.description || ''
  };
});
console.log(JSON.stringify(guides, null, 2));

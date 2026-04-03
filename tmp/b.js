const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'content/guides');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
const guides = files.map(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf-8');
  let slug = file.replace('.mdx', '');
  
  // Extract Frontmatter
  const titleMatch = content.match(/^title:\s*\"?([^\"]+)\"?/m);
  const descMatch = content.match(/^description:\s*\"?([^\"]+)\"?/m);
  const diffMatch = content.match(/^difficulty:\s*\"?([^\"]+)\"?/m);
  const timeMatch = content.match(/^readTime:\s*\"?([^\"]+)\"?/m);
  const tagMatch = content.match(/^tag:\s*\"?([^\"]+)\"?/m);
  
  // Find First Image
  const imgMatch = content.match(/!\[.*?\]\((.*?)\)/) || content.match(/<img.*?src=[\"'](.*?)[\"']/);
  const image = imgMatch ? imgMatch[1] : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop';

  return {
    slug,
    difficulty: diffMatch ? diffMatch[1] : 'Beginner',
    title: titleMatch ? titleMatch[1] : slug,
    desc: descMatch ? descMatch[1] : '',
    time: timeMatch ? timeMatch[1] : '10 min',
    tag: tagMatch ? tagMatch[1] : 'Guide',
    image,
    minVram: 8,
    modelId: 'sdxl'
  };
});
console.log(JSON.stringify(guides, null, 2));

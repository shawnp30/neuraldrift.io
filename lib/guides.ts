import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

export function getGuides() {
  return readdirSync(join(process.cwd(), 'content/guides')).filter(file => file.endsWith('.mdx')).map(file => {
    const { data } = matter(readFileSync(join(process.cwd(), 'content/guides', file), 'utf8'));
    return { slug: file.slice(0, -4), title: String(data.title || file.slice(0, -4)), description: String(data.description || '') };
  });
}

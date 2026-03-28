# neuraldrift

> The hub for building, training, and mastering AI systems.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** with custom design tokens
- **Supabase** (auth + database)
- **Vercel** (deployment)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in your keys
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/              Next.js App Router pages
components/       React components
  home/           Homepage sections
  layout/         Navbar, Footer, Sidebar
  dashboard/      Dashboard UI components
  shared/         Reusable primitives
content/guides/   MDX guide content
lib/              Supabase clients, utilities
styles/           Global CSS + Tailwind tokens
supabase/         Migrations + config
types/            TypeScript interfaces
```

## Adding Content

### New Guide

1. Create `content/guides/your-guide-slug.mdx`
2. Add frontmatter: `title`, `description`, `difficulty`, `readTime`, `tag`
3. Add to guide list in `components/home/GuidesPreview.tsx`

### New LoRA

Insert into Supabase `loras` table or use the dashboard upload UI.

## Environment Variables

See `.env.example` for all required variables.

## Deploy

```bash
vercel deploy
```

---

## Developer Setup Required

> [!IMPORTANT]
> Uploads require `@vercel/blob` and a `BLOB_READ_WRITE_TOKEN` environment variable to function correctly. Configure this in your Vercel Project Settings first.

Built with neuraldrift · ComputeAtlas Partner

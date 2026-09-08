-- Supabase Schema for Workflows Table
-- Copy and paste this directly into your Supabase SQL Editor.

CREATE TABLE public.workflows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  preview_image text NOT NULL,
  preview_video text,
  download_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Set up Row Level Security (RLS) to protect your data
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- Allow public read access (everyone can see the previews)
CREATE POLICY "Workflows are visible to everyone." ON public.workflows
  FOR SELECT USING (true);

-- Allow authenticated admins to insert/update workflows
CREATE POLICY "Admins can insert workflows" ON public.workflows
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update workflows" ON public.workflows
  FOR UPDATE USING (auth.role() = 'authenticated');

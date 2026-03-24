"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { uploadWorkflow } from "./actions";

export default function AdminUploadWorkflow() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await uploadWorkflow(formData);

    if (result.success) {
      setMessage(`Successfully uploaded! Workflow live at /workflows/${result.slug}`);
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage(`Error: ${result.error}`);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 pt-32 pb-32">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-[900] mb-8">Upload New Workflow</h1>
        
        <form onSubmit={handleSubmit} className="bg-[#0f172a]/50 p-8 rounded-2xl border border-white/10 space-y-6">
          
          <div>
            <label className="block text-xs font-[800] uppercase text-zinc-400 mb-2">Workflow Title</label>
            <input name="name" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-xs font-[800] uppercase text-zinc-400 mb-2">Description</label>
            <textarea name="description" required rows={4} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-xs font-[800] uppercase text-zinc-400 mb-2">Preview Image (Required)</label>
            <input name="image" type="file" required accept="image/*" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-xs font-[800] uppercase text-zinc-400 mb-2">Preview Video URL (Optional)</label>
            <input name="video_url" type="url" placeholder="e.g. https://youtube.com/..." className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-xs font-[800] uppercase text-zinc-400 mb-2">Workflow JSON File (.json)</label>
            <input name="json" type="file" required accept=".json" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-xs font-[800] uppercase text-zinc-400 mb-2">Tags (Comma separated)</label>
            <input name="tags" placeholder="FLUX, LoRA, SDXL" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-indigo-500" />
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm font-[600] ${message.startsWith("Error") ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-indigo-500 text-white font-[800] rounded-lg hover:bg-indigo-400 disabled:opacity-50 transition-colors"
          >
            {loading ? "Uploading to Vercel & Supabase..." : "Publish Workflow"}
          </button>
        </form>
      </div>
    </div>
  );
}

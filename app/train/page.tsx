"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  Settings2,
  Info,
  ChevronRight,
  Edit3,
} from "lucide-react";
import { HubSidebar } from "@/components/HubSidebar";
import NextImage from "next/image";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  caption: string;
}

export default function TrainingPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [triggerWord, setTriggerWord] = useState("");
  const [isCaptioning, setIsCaptioning] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );

    const uploads = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      caption: "",
    }));

    setFiles((prev) => [...prev, ...uploads]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const generateCaptions = async () => {
    if (files.length === 0) return;
    setIsCaptioning(true);

    try {
      const updatedFiles = await Promise.all(
        files.map(async (fileObj) => {
          if (fileObj.caption) return fileObj; // Skip if already captioned

          const formData = new FormData();
          formData.append("image", fileObj.file);

          const res = await fetch("/api/caption", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error("Captioning failed");

          const data = await res.json();
          return { ...fileObj, caption: data.caption || "" };
        })
      );

      setFiles(updatedFiles);
    } catch (error) {
      console.error("Captioning Error:", error);
    } finally {
      setIsCaptioning(false);
    }
  };

  const applyTriggerWord = () => {
    if (!triggerWord) return;
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        caption: f.caption.includes(triggerWord)
          ? f.caption
          : `${triggerWord}, ${f.caption}`,
      }))
    );
  };

  return (
    <main className="min-h-screen bg-transparent pb-24 pt-32 text-slate-50">
      <div className="mx-auto flex max-w-[1600px] gap-8 px-6 lg:px-12">
        <HubSidebar />

        <div className="min-w-0 flex-1">
          <header className="mb-12">
            <h1 className="mb-2 font-syne text-4xl font-black tracking-tight text-white">
              Deep Training Suite
            </h1>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              High-performance LoRA optimization via NeuralDrift Core
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_350px]">
            <div className="space-y-8">
              {/* DROP ZONE */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="group relative cursor-pointer"
              >
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-accent/20 to-purple-500/20 opacity-25 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200"></div>
                <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-[#161b22] px-6 py-16 transition-all hover:border-accent/40">
                  <div className="mb-4 rounded-full bg-accent/10 p-4">
                    <Upload className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">
                    Initialize Dataset
                  </h3>
                  <p className="max-w-sm text-center font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Drag and drop your training images here. <br />
                    Supports JPG, PNG, WEBP (Max 50 images recommended)
                  </p>
                  <input
                    type="file"
                    multiple
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) =>
                      handleFiles(Array.from(e.target.files || []))
                    }
                  />
                </div>
              </div>

              {/* IMAGE GRID */}
              {files.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-white/5 bg-[#161b22]"
                    >
                      <NextImage
                        src={file.preview}
                        alt="Preview"
                        fill
                        unoptimized
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => removeFile(file.id)}
                          className="absolute right-2 top-2 rounded-lg bg-red-500/20 p-1.5 text-red-500 transition-colors hover:bg-red-500/40"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <p className="line-clamp-3 text-center font-mono text-[10px] text-zinc-300">
                          {file.caption || "Awaiting caption..."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {files.length > 0 && (
                <div className="flex justify-end gap-4">
                  <button
                    onClick={generateCaptions}
                    disabled={isCaptioning}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 disabled:opacity-50"
                  >
                    <Sparkles
                      className={`h-4 w-4 text-accent ${isCaptioning ? "animate-spin" : ""}`}
                    />
                    {isCaptioning
                      ? "Auto-Captioning..."
                      : "Run Gemini Auto-Caption"}
                  </button>
                </div>
              )}
            </div>

            {/* SIDEBARS */}
            <div className="space-y-6">
              {/* TRIGGER WORD EDITOR */}
              <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg border border-accent/20 bg-accent/10 p-2">
                    <Edit3 className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white">
                    Bulk Editor
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block font-mono text-[10px] uppercase text-zinc-500">
                      Unique Trigger Word
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ND_Alien"
                      className="w-full rounded-xl border border-white/5 bg-[#0d1117] p-3 font-mono text-xs outline-none focus:border-accent/40"
                      value={triggerWord}
                      onChange={(e) => setTriggerWord(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={applyTriggerWord}
                    className="w-full rounded-xl bg-accent px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-black transition-all hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] active:scale-[0.98]"
                  >
                    Inject Trigger Word
                  </button>
                </div>
              </div>

              {/* EXPERT INSIGHTS */}
              <div className="rounded-2xl border border-accent/10 bg-accent/[0.02] p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Info className="h-4 w-4 text-accent" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-accent">
                    NeuralDrift Method
                  </h3>
                </div>
                <div className="space-y-4 font-mono text-[11px] leading-relaxed text-zinc-400">
                  <p>
                    <span className="font-bold text-white">20-30 images</span>{" "}
                    is the gold standard for high-fidelity LoRAs.
                  </p>
                  <ul className="list-none space-y-2 marker:text-accent">
                    <li className="flex gap-2">
                      <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                      <span>10 Close-ups for texture detail</span>
                    </li>
                    <li className="flex gap-2">
                      <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                      <span>10 Medium shots for anatomy</span>
                    </li>
                    <li className="flex gap-2">
                      <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                      <span>10 Full-body for composition</span>
                    </li>
                  </ul>
                  <p className="border-t border-accent/10 pt-2">
                    Use unique trigger words to decouple character from
                    environment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

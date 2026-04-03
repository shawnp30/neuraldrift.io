"use client";

import { Download } from "lucide-react";

interface DownloadButtonProps {
  downloadUrl: string;
  workflowName: string;
}

export default function DownloadButton({ downloadUrl, workflowName }: DownloadButtonProps) {
  const handleDownload = async () => {
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="group relative w-full py-6 bg-white text-black font-black rounded-2xl transition-all shadow-[0_15px_40px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 text-lg transform hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-[#7c6af7]/10 to-[#22d3ee]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Download className="w-6 h-6 transition-transform group-hover:translate-y-0.5" />
      <span className="relative z-10">DOWNLOAD JSON ARCHITECTURE</span>
    </button>
  );
}

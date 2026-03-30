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
      className="w-full py-6 bg-indigo-500 hover:bg-indigo-400 text-black font-black rounded-2xl transition-all shadow-[0_15px_40px_rgba(99,102,241,0.3)] flex items-center justify-center gap-3 text-lg transform hover:-translate-y-1 active:scale-[0.98]"
    >
      <Download className="w-6 h-6" /> DOWNLOAD JSON
    </button>
  );
}

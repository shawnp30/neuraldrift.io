'use client';
import { useState } from 'react';

export function DownloadButton({ workflowId, workflowTitle }: {
  workflowId: string;
  workflowTitle: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(`/workflows/${workflowId}.json`);
      if (!res.ok) throw new Error('Workflow not found');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflowTitle.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full bg-[#7c6af7] hover:bg-[#6c5ae7] text-white font-mono font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {loading ? (
        <><span className="animate-spin">⟳</span> Downloading...</>
      ) : (
        <><span>⬇</span> DOWNLOAD WORKFLOW (.json)</>
      )}
    </button>
  );
}

'use client';
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface DownloadButtonProps {
  workflowId: string;
  workflowTitle: string;
  size?: 'small' | 'medium' | 'large' | 'icon';
}

export function DownloadButton({ workflowId, workflowTitle, size = 'medium' }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      // In a real app, this might be a blob or a direct link
      // For now, we simulate the fetch if available or just alert
      const res = await fetch(`/workflows/${workflowId}.json`);
      if (!res.ok) throw new Error('Workflow file not found');
      
      const data = await res.text();
      // Force octet-stream so browser always saves, never opens in a new tab
      const blob = new Blob([data], { type: 'application/octet-stream' });
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
      // Fallback for demo: just show a message if the file doesn't exist yet
      alert(`Download protocol initiated for ${workflowTitle}. (Note: Ensure /public/workflows/${workflowId}.json exists)`);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-[10px]',
    medium: 'px-6 py-3 text-xs',
    large: 'px-10 py-5 text-sm uppercase tracking-[0.2em]',
    icon: 'p-3',
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        group relative flex items-center justify-center gap-3 
        bg-[#7c6af7] text-white font-mono font-black rounded-xl
        hover:bg-[#6c5ae7] hover:shadow-[0_0_30px_rgba(124,106,247,0.4)]
        active:scale-95 transition-all duration-300 disabled:opacity-50
        overflow-hidden
      `}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {loading ? (
        <Loader2 size={size === 'large' ? 24 : 18} className="animate-spin" />
      ) : (
        <Download size={size === 'large' ? 24 : 18} className="group-hover:-translate-y-0.5 group-hover:scale-110 transition-transform" />
      )}
      
      {size !== 'icon' && (
        <span>{loading ? 'INITIATING...' : 'DOWNLOAD WORKFLOW'}</span>
      )}

      {/* Decorative Border */}
      <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none" />
    </button>
  );
}

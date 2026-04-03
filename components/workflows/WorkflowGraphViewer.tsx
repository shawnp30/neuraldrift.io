'use client';
import { useState, useCallback, useRef } from 'react';
import { Upload, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ComfyNode {
  id: number;
  type: string;
  pos: [number, number];
  size: { 0: number; 1: number } | [number, number];
  title?: string;
}

interface ComfyLink {
  // [linkId, srcNodeId, srcSlot, dstNodeId, dstSlot, type]
  0: number; 1: number; 2: number; 3: number; 4: number; 5: string;
}

interface ComfyWorkflow {
  nodes?: ComfyNode[];
  links?: ComfyLink[];
}

const NODE_COLORS: Record<string, string> = {
  KSampler: '#7c6af7',
  KSamplerAdvanced: '#7c6af7',
  CheckpointLoaderSimple: '#22d3ee',
  CLIPTextEncode: '#4ade80',
  VAEDecode: '#f59e0b',
  VAEEncode: '#f59e0b',
  LoraLoader: '#a855f7',
  TextEncodeAceStepAudio: '#f97316',
  SaveImage: '#ec4899',
  LoadImage: '#ec4899',
  ControlNetApply: '#06b6d4',
  default: '#555565',
};

function getNodeColor(type: string) {
  return NODE_COLORS[type] || NODE_COLORS.default;
}

function getNodeWidth(node: ComfyNode): number {
  if (Array.isArray(node.size)) return node.size[0] || 200;
  return node.size?.[0] || 200;
}
function getNodeHeight(node: ComfyNode): number {
  if (Array.isArray(node.size)) return node.size[1] || 80;
  return node.size?.[1] || 80;
}

export function WorkflowGraphViewer({ workflowTitle }: { workflowTitle: string }) {
  const [graphData, setGraphData] = useState<ComfyWorkflow | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const parseAndRender = useCallback((text: string) => {
    try {
      const data = JSON.parse(text) as ComfyWorkflow;
      if (!data.nodes || data.nodes.length === 0) {
        setError('No nodes found in this workflow JSON.');
        return;
      }
      setGraphData(data);
      setError(null);
      // Auto-fit: reset zoom and center
      setZoom(0.6);
      setPan({ x: 40, y: 40 });
    } catch {
      setError('Invalid JSON file. Please drop a valid ComfyUI workflow.');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setError('Please drop a .json workflow file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => parseAndRender(ev.target?.result as string);
    reader.readAsText(file);
  }, [parseAndRender]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!graphData) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
  };
  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(2, Math.max(0.2, z - e.deltaY * 0.001)));
  };

  const reset = () => { setZoom(0.6); setPan({ x: 40, y: 40 }); };
  const clear = () => { setGraphData(null); setError(null); reset(); };

  // Compute canvas bounds from nodes
  let canvasW = 2000, canvasH = 1500;
  if (graphData?.nodes) {
    const maxX = Math.max(...graphData.nodes.map(n => (n.pos?.[0] || 0) + getNodeWidth(n)));
    const maxY = Math.max(...graphData.nodes.map(n => (n.pos?.[1] || 0) + getNodeHeight(n)));
    canvasW = maxX + 200;
    canvasH = maxY + 200;
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full select-none overflow-hidden bg-[#060810] transition-all duration-200 ${
        isDragOver ? 'ring-2 ring-[#7c6af7] ring-inset' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: graphData ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: `${pan.x % 40}px ${pan.y % 40}px`,
        }}
      />

      {!graphData && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center pointer-events-none">
          <div className={`p-5 rounded-2xl border-2 border-dashed transition-all duration-300 ${isDragOver ? 'border-[#7c6af7] bg-[#7c6af7]/10 scale-105' : 'border-[#333340]'}`}>
            <Upload size={36} className={isDragOver ? 'text-[#7c6af7]' : 'text-[#555565]'} />
          </div>
          <div>
            <p className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-1">
              {isDragOver ? 'DROP TO LOAD GRAPH' : 'DROP WORKFLOW JSON HERE'}
            </p>
            <p className="font-mono text-[10px] text-[#555565]">
              Drag the downloaded {workflowTitle} JSON into this panel
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <p className="font-mono text-xs text-[#ef4444] uppercase">{error}</p>
          <button onClick={clear} className="font-mono text-[10px] text-[#555565] hover:text-white uppercase border border-[#2a2a30] px-4 py-2 rounded-lg transition-all">
            Clear
          </button>
        </div>
      )}

      {graphData?.nodes && (
        <>
          {/* Zoom/pan controls */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-[#0a0a0b]/80 border border-[#2a2a30] rounded-lg p-1 backdrop-blur-sm">
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 text-[#555565] hover:text-white rounded transition-colors">
              <ZoomIn size={13} />
            </button>
            <span className="font-mono text-[9px] text-[#555565] w-9 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-1.5 text-[#555565] hover:text-white rounded transition-colors">
              <ZoomOut size={13} />
            </button>
            <div className="w-px h-4 bg-[#2a2a30] mx-0.5" />
            <button onClick={reset} className="p-1.5 text-[#555565] hover:text-white rounded transition-colors">
              <RotateCcw size={13} />
            </button>
            <button onClick={clear} className="px-2 py-1 font-mono text-[8px] text-[#ef4444] hover:text-white uppercase tracking-wider rounded transition-colors">
              CLR
            </button>
          </div>

          {/* Node count badge */}
          <div className="absolute top-3 left-3 z-20 px-2.5 py-1 bg-[#0a0a0b]/80 border border-[#2a2a30] rounded-lg backdrop-blur-sm">
            <span className="font-mono text-[9px] text-[#555565] uppercase">
              {graphData.nodes.length} nodes · {graphData.links?.length || 0} links
            </span>
          </div>

          {/* Canvas */}
          <div
            className="absolute"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: canvasW,
              height: canvasH,
            }}
          >
            {/* Links as SVG */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={canvasW}
              height={canvasH}
              style={{ overflow: 'visible' }}
            >
              {(graphData.links || []).map((link, i) => {
                const srcNode = graphData.nodes!.find(n => n.id === link[1]);
                const dstNode = graphData.nodes!.find(n => n.id === link[3]);
                if (!srcNode || !dstNode) return null;
                const x1 = (srcNode.pos?.[0] || 0) + getNodeWidth(srcNode);
                const y1 = (srcNode.pos?.[1] || 0) + 20 + link[2] * 20;
                const x2 = dstNode.pos?.[0] || 0;
                const y2 = (dstNode.pos?.[1] || 0) + 20 + link[4] * 20;
                const cx = (x1 + x2) / 2;
                return (
                  <path
                    key={i}
                    d={`M ${x1} ${y1} C ${cx} ${y1} ${cx} ${y2} ${x2} ${y2}`}
                    stroke={getNodeColor(srcNode.type)}
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    fill="none"
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {graphData.nodes.map(node => {
              const x = node.pos?.[0] || 0;
              const y = node.pos?.[1] || 0;
              const w = getNodeWidth(node);
              const h = getNodeHeight(node);
              const color = getNodeColor(node.type);
              const label = node.title || node.type;
              return (
                <div
                  key={node.id}
                  className="absolute rounded-lg border overflow-hidden"
                  style={{
                    left: x,
                    top: y,
                    width: w,
                    borderColor: color + '55',
                    background: `linear-gradient(135deg, #111113 0%, #0a0a0b 100%)`,
                  }}
                >
                  <div
                    className="px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase truncate"
                    style={{ background: color + '22', color }}
                  >
                    {label}
                  </div>
                  <div className="px-2 py-1.5 font-mono text-[8px] text-[#333340] truncate">
                    #{node.id} · {w.toFixed(0)}×{h.toFixed(0)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

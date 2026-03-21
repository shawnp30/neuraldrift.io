"use client";

interface Props {
  score: number;
  bandColor: string;
  showLabel?: boolean;
  animated?: boolean;
}

const MARKERS = [
  { pos: 40, label: "40", color: "#ef4444" },
  { pos: 60, label: "60", color: "#f97316" },
  { pos: 75, label: "75", color: "#00e5ff" },
  { pos: 90, label: "90", color: "#10b981" },
];

export function ScoreBar({ score, bandColor, showLabel = true, animated = true }: Props) {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between font-mono text-xs text-muted mb-1.5">
          <span>Compatibility</span>
          <span style={{ color: bandColor }}>{score}/100</span>
        </div>
      )}
      <div className="relative h-2 bg-border rounded-full overflow-visible">
        {/* Markers */}
        {MARKERS.map(m => (
          <div
            key={m.pos}
            className="absolute top-0 bottom-0 w-px opacity-30"
            style={{ left: `${m.pos}%`, backgroundColor: m.color }}
          />
        ))}
        {/* Fill */}
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            backgroundColor: bandColor,
            transition: animated ? "width 0.6s cubic-bezier(0.4,0,0.2,1)" : "none",
            boxShadow: `0 0 8px ${bandColor}60`,
          }}
        />
      </div>
      {/* Zone labels */}
      <div className="flex justify-between font-mono text-[9px] text-muted/40 mt-1 tracking-wider">
        <span>RISKY</span>
        <span style={{ marginLeft: "35%" }}>USABLE</span>
        <span>EXCELLENT</span>
      </div>
    </div>
  );
}

"use client";

interface Props {
  score: number;
  band: string;
  bandColor: string;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CompatibilityBadge({ score, band, bandColor, showScore = true, size = "md" }: Props) {
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-3 py-1",
    lg: "text-sm px-4 py-1.5",
  };

  return (
    <div className="flex items-center gap-2">
      {showScore && (
        <div className="flex items-center gap-1.5">
          <div
            className="relative w-8 h-8 flex-shrink-0"
            style={{ "--score-color": bandColor } as React.CSSProperties}
          >
            <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
              <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <circle
                cx="16" cy="16" r="13" fill="none"
                stroke={bandColor}
                strokeWidth="3"
                strokeDasharray={`${(score / 100) * 81.7} 81.7`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold" style={{ color: bandColor }}>
              {score}
            </span>
          </div>
        </div>
      )}
      <span
        className={`font-mono tracking-widest uppercase rounded-full font-medium ${sizes[size]}`}
        style={{ backgroundColor: `${bandColor}18`, color: bandColor, border: `1px solid ${bandColor}30` }}
      >
        {band}
      </span>
    </div>
  );
}

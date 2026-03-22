"use client";
// components/GuideBody.tsx
// Usage: import GuideBody from "@/components/GuideBody"
//        <GuideBody slug={params.slug} />

import { getGuideContent, GuideSection } from "@/lib/guideContent";

// ─── Code block ───────────────────────────────────────────────────────────────
function CodeBlock({ filename, language, body }: { filename: string; language: string; body: string }) {
  return (
    <div style={{ margin: "1.25rem 0", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{
        background: "#111820", padding: "8px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ef4444","#f59e0b","#22c55e"].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: "#7a8a9a" }}>{filename}</span>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#4a5a6a", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", padding: "2px 7px", borderRadius: 4 }}>{language}</span>
      </div>
      <pre style={{
        background: "#0a0e14", margin: 0, padding: "1.25rem 1.5rem",
        fontFamily: "monospace", fontSize: 13, lineHeight: 1.75,
        color: "#c9d1d9", overflowX: "auto", whiteSpace: "pre"
      }}>
        <code>{body}</code>
      </pre>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ margin: "1.25rem 0", overflowX: "auto", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#111820" }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: "10px 14px", textAlign: "left",
                fontFamily: "monospace", fontSize: 11, color: "#f59e0b",
                letterSpacing: "0.08em", textTransform: "uppercase",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                whiteSpace: "nowrap"
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "#0d1117" : "#0a0e14" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: "9px 14px", color: ci === 0 ? "#e8edf2" : "#7a8a9a",
                  fontFamily: ci === 0 ? "monospace" : "inherit",
                  fontSize: 13, lineHeight: 1.5,
                  borderBottom: "1px solid rgba(255,255,255,0.04)"
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Callout box ──────────────────────────────────────────────────────────────
function Callout({ type, text }: { type: "tip" | "warning"; text: string }) {
  const isTip = type === "tip";
  return (
    <div style={{
      margin: "1.25rem 0", padding: "1rem 1.25rem", borderRadius: 8,
      background: isTip ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
      border: `1px solid ${isTip ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
      display: "flex", gap: 12, alignItems: "flex-start"
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{isTip ? "💡" : "⚠️"}</span>
      <div>
        <span style={{
          fontFamily: "monospace", fontSize: 11, fontWeight: 600,
          color: isTip ? "#22c55e" : "#ef4444",
          textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4
        }}>{isTip ? "Tip" : "Warning"}</span>
        <p style={{ fontSize: 13, color: "#7a8a9a", lineHeight: 1.6, margin: 0 }}>{text}</p>
      </div>
    </div>
  );
}

// ─── Single section ───────────────────────────────────────────────────────────
function Section({ section, index }: { section: GuideSection; index: number }) {
  return (
    <div style={{
      padding: "2rem 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)"
    }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
        <span style={{
          fontFamily: "monospace", fontSize: 11, color: "#f59e0b",
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
          padding: "2px 8px", borderRadius: 4, flexShrink: 0
        }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 style={{
          fontFamily: "'Oxanium', monospace", fontWeight: 700,
          fontSize: "1.15rem", color: "#ffffff", margin: 0
        }}>
          {section.title}
        </h3>
      </div>

      {/* Body text */}
      <p style={{
        color: "#9aabb8", fontSize: "0.95rem", lineHeight: 1.75,
        fontWeight: 300, margin: "0 0 0.75rem 0", maxWidth: 760
      }}>
        {section.content}
      </p>

      {/* Optional tip */}
      {section.tip && <Callout type="tip" text={section.tip} />}

      {/* Optional warning */}
      {section.warning && <Callout type="warning" text={section.warning} />}

      {/* Optional code */}
      {section.code && (
        <CodeBlock
          filename={section.code.filename}
          language={section.code.language}
          body={section.code.body}
        />
      )}

      {/* Optional table */}
      {section.table && (
        <DataTable headers={section.table.headers} rows={section.table.rows} />
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GuideBody({ slug }: { slug: string }) {
  const guide = getGuideContent(slug);

  if (!guide) {
    return (
      <div style={{
        padding: "3rem 0", color: "#4a5a6a",
        fontFamily: "monospace", fontSize: 13, textAlign: "center"
      }}>
        // Guide content coming soon — check back shortly.
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "1rem" }}>
      {guide.sections.map((section, i) => (
        <Section key={i} section={section} index={i} />
      ))}

      {/* Footer CTA */}
      <div style={{
        marginTop: "2.5rem", paddingTop: "2rem",
        borderTop: "1px solid rgba(245,158,11,0.12)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem"
      }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#f59e0b", marginBottom: 6 }}>
            // Next step
          </div>
          <p style={{ color: "#7a8a9a", fontSize: 13, margin: 0 }}>
            Score your hardware against this workflow in the Optimizer →
          </p>
        </div>
        <a
          href="/optimizer"
          style={{
            background: "#f59e0b", color: "#000",
            padding: "0.7rem 1.5rem", borderRadius: 7,
            fontWeight: 700, fontSize: 13, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 6,
            flexShrink: 0
          }}
        >
          Open Optimizer →
        </a>
      </div>
    </div>
  );
}

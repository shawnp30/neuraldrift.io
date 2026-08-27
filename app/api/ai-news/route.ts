import { NextResponse } from "next/server";

/**
 * Live AI/hardware headlines for the homepage ticker.
 *
 * The previous implementation called gnews.io with a literal `apikey=demo`
 * placeholder and then parsed the JSON response with an RSS regex, so it could
 * never return anything. This uses the Hacker News Algolia endpoint instead:
 * no API key, no signup, and an audience that overlaps closely with this site's
 * (local inference, GPUs, open-weight models).
 *
 * Sorted by date rather than all-time points, because the all-time top "AI"
 * stories on HN are opinion pieces ("My AI skeptic friends are all nuts") —
 * wrong register for a workflow site. Recent + filtered gives release news.
 */

export const revalidate = 1800; // 30 minutes

// Algolia ANDs every word in `query`, so a single "A OR B" string matches
// nothing. Each term is fetched separately and the results merged.
const QUERIES = ["AI", "LLM", "GPU", "diffusion", "open weights"];
const WINDOW_DAYS = 45;
const MIN_POINTS = 30;

function endpointFor(q: string, cutoff: number) {
  const filters = `points>${MIN_POINTS},created_at_i>${cutoff}`;
  return (
    `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}` +
    `&tags=story&numericFilters=${encodeURIComponent(filters)}&hitsPerPage=30`
  );
}

// Shown when the upstream is unreachable. Deliberately evergreen — no version
// numbers or dates that can silently rot if this fallback ever goes live.
const FALLBACK = [
  "Local inference keeps closing the gap with hosted APIs",
  "Open-weight releases now ship with day-one ComfyUI support",
  "VRAM, not raw compute, is still the binding constraint for local gen",
  "Quantization keeps pulling larger models onto consumer cards",
];

// Title must carry actual technical signal — a model name, a hardware term, or
// release language. Matching on the body/URL is what surfaced "CDs vs. NIMBY".
const RELEVANT = new RegExp(
  [
    "\\b(llm|gpt|claude|gemini|gemma|llama|qwen|deepseek|mistral|kimi|glm|phi)\\b",
    "\\b(diffusion|stable diffusion|flux|comfyui|lora|checkpoint|sdxl|controlnet)\\b",
    "\\b(gpu|nvidia|amd|cuda|rtx|vram|tensor|quantiz\\w*|inference|fine.?tun\\w*)\\b",
    "\\b(open[- ]?weights?|open[- ]?source model|benchmark|context window|multimodal)\\b",
    "\\b(text.to.(image|video|speech)|image gen\\w*|video gen\\w*)\\b",
  ].join("|"),
  "i"
);

// HN's community-post prefixes and pure-discourse patterns.
const NOISE =
  /^(ask hn|show hn|launch hn|tell hn)\b|\b(hiring|i'?m tired of|my .* friends|hit piece|psychosis|nuts)\b/i;

export async function GET() {
  const cutoff = Math.floor(Date.now() / 1000) - WINDOW_DAYS * 86400;

  try {
    const responses = await Promise.all(
      QUERIES.map((q) =>
        fetch(endpointFor(q, cutoff), {
          next: { revalidate },
          headers: { Accept: "application/json" },
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    );

    const hits = responses.flatMap(
      (d: { hits?: { title?: string | null }[] } | null) => d?.hits ?? []
    );

    const seen = new Set<string>();
    const headlines = hits
      .map((h) => (h.title ?? "").trim())
      .filter((t) => t.length > 15 && t.length < 120)
      .filter((t) => !NOISE.test(t))
      .filter((t) => RELEVANT.test(t))
      .filter((t) => {
        const k = t.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, 12);

    if (headlines.length < 4) {
      return NextResponse.json({ headlines: FALLBACK, source: "fallback" });
    }

    return NextResponse.json({ headlines, source: "hn" });
  } catch {
    return NextResponse.json({ headlines: FALLBACK, source: "fallback" });
  }
}

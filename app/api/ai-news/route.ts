import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rss = await fetch("https://gnews.io/api/v4/search?q=ai&lang=en&country=us&max=10&apikey=demo", { cache: "no-store" });
    const text = await rss.text();

    const headlines = [...text.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)]
      .map(match => match[1])
      .filter(t => t.toLowerCase().includes("ai") || t.toLowerCase().includes("artificial intelligence"))
      .slice(0, 15);

    return NextResponse.json({ headlines });
  } catch {
    return NextResponse.json({ headlines: ["Unable to load AI news"] });
  }
}
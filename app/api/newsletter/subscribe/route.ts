// app/api/newsletter/subscribe/route.ts
// Thin Next.js adapter — all validation, rate limiting, and Kit logic lives in
// lib/newsletter.ts so it can be unit tested without the Next.js server runtime.

import { NextRequest, NextResponse } from "next/server";
import { handleNewsletterSubscribe } from "@/lib/newsletter";

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const { status, body } = await handleNewsletterSubscribe(raw, request.headers);
  return NextResponse.json(body, { status });
}

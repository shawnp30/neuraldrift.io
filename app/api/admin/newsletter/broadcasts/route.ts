import { NextRequest, NextResponse } from "next/server";
import { handleCreateNewsletterBroadcastDraft } from "@/lib/newsletter/broadcasts";

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const { status, body } = await handleCreateNewsletterBroadcastDraft(raw, request.headers);
  return NextResponse.json(body, { status });
}

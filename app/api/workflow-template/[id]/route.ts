import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Workflow template route is not implemented." },
    { status: 404 }
  );
}

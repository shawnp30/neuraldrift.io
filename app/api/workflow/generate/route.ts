import { NextResponse } from "next/server";
import { generateWorkflow } from "@/lib/workflowEngine";

export async function POST(req: Request) {
  const body = await req.json();

  const result = generateWorkflow(body);

  return NextResponse.json(result);
}

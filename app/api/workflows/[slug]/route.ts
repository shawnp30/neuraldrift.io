import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient();
  const slug = params.slug;

  const { data: workflow, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json(workflow);
}

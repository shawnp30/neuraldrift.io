import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  
  // Fetch all workflows ordered by newest first
  const { data: workflows, error } = await supabase
    .from("workflows")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase Workflows Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch workflows" }, { status: 500 });
  }

  return NextResponse.json(workflows);
}

import { type NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard"];

export async function middleware(request: NextRequest) {
  // TODO: Add Supabase auth check here when backend is ready
  // For now, pass through all requests
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

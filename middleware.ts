import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new NextResponse('Account features are unavailable until authentication is configured.', { status: 503, headers: { 'X-Robots-Tag': 'noindex' } });
  const response = NextResponse.next();
  const client = createServerClient(url, key, { cookies: { getAll: () => request.cookies.getAll(), setAll: (cookies: { name: string; value: string; options?: CookieOptions }[]) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } });
  try { const { data: { user }, error } = await client.auth.getUser(); if (error || !user) return new NextResponse('Sign in is required for account features.', { status: 401, headers: { 'X-Robots-Tag': 'noindex' } }); } catch { return new NextResponse('Authentication is temporarily unavailable.', { status: 503 }); }
  response.headers.set('X-Robots-Tag', 'noindex');
  return response;
}
export const config = { matcher: ['/dashboard/:path*', '/proofs/upload/:path*', '/api/proof/upload'] };


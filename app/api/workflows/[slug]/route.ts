import { NextResponse } from 'next/server';
import { CATALOG } from '@/lib/catalog';
export async function GET(request: Request, { params }: { params: { slug: string } }) { const workflow = CATALOG.find(w => w.id === params.slug); return workflow ? NextResponse.json(workflow) : NextResponse.json({ error: 'Workflow not found' }, { status: 404 }); }

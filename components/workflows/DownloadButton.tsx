"use client";

import Link from 'next/link';
import { CATALOG, compatibilityStatus, downloadUrl } from '@/lib/catalog';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics';
interface Props { workflowId: string; workflowTitle: string; size?: 'small' | 'medium' | 'large' | 'icon' }
export function DownloadButton({ workflowId, workflowTitle, size = 'medium' }: Props) {
 const workflow = CATALOG.find(w => w.id === workflowId);
 if (!workflow) return <Link href="/workflows" className="nd-text-link">Find this workflow in the catalog</Link>;
 return <a className="nd-button" href={downloadUrl(workflow)} download aria-label={`Download ${workflowTitle} JSON`} onClick={() => trackEvent(ANALYTICS_EVENTS.workflowDownload, { workflowId, category: workflow.category, evidenceStatus: compatibilityStatus(workflow), sourcePage: typeof window === 'undefined' ? undefined : window.location.pathname })}>{size === 'icon' ? '↓' : 'Download workflow JSON ↓'}</a>;
}

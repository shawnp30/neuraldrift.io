"use client";

import type { MouseEvent } from 'react';
import Link from 'next/link';
import { CATALOG, compatibilityStatus, downloadUrl } from '@/lib/catalog';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics';
interface Props { workflowId: string; workflowTitle: string; size?: 'small' | 'medium' | 'large' | 'icon' }
export function DownloadButton({ workflowId, workflowTitle, size = 'medium' }: Props) {
 const workflow = CATALOG.find(w => w.id === workflowId);
 if (!workflow) return <Link href="/workflows" className="nd-text-link">Find this workflow in the catalog</Link>;
 const href = downloadUrl(workflow);
 const handleDownload = (event: MouseEvent<HTMLAnchorElement>) => {
   event.preventDefault();
   trackEvent(ANALYTICS_EVENTS.workflowDownload, {
     workflow_id: workflowId,
     workflow_title: workflowTitle,
     workflow_category: workflow.category,
     evidence_status: compatibilityStatus(workflow),
     source_page: window.location.pathname,
   });
   if (process.env.NODE_ENV !== 'production') {
     console.debug('[NeuralDrift analytics] workflow_download');
   }

   window.setTimeout(() => {
     const downloadLink = document.createElement('a');
     downloadLink.href = href;
     downloadLink.download = '';
     document.body.appendChild(downloadLink);
     downloadLink.click();
     downloadLink.remove();
   }, 0);
 };

 return <a className="nd-button" href={href} download aria-label={`Download ${workflowTitle} JSON`} onClick={handleDownload}>{size === 'icon' ? '↓' : 'Download workflow JSON ↓'}</a>;
}

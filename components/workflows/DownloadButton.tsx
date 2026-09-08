import Link from 'next/link';
import { CATALOG, downloadUrl } from '@/lib/catalog';
interface Props { workflowId: string; workflowTitle: string; size?: 'small' | 'medium' | 'large' | 'icon' }
export function DownloadButton({ workflowId, workflowTitle, size = 'medium' }: Props) {
 const workflow = CATALOG.find(w => w.id === workflowId);
 if (!workflow) return <Link href="/workflows" className="nd-text-link">Find this workflow in the catalog</Link>;
 return <a className="nd-button" href={downloadUrl(workflow)} download aria-label={`Download ${workflowTitle} JSON`}>{size === 'icon' ? '↓' : 'Download workflow JSON ↓'}</a>;
}

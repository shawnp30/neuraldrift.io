'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { WorkflowEntry } from '@/lib/workflowsData';
import { downloadUrl } from '@/lib/catalog';
const Graph = dynamic(() => import('./WorkflowGraphViewer').then(m => m.WorkflowGraphViewer), { ssr: false, loading: () => <p>Loading graph viewer…</p> });
export function WorkflowTools({ workflow }: { workflow: WorkflowEntry }) {
  const [showGraph, setShowGraph] = useState(false);
  const [message, setMessage] = useState('');
  async function copy(json: boolean) {
    try {
      let text = workflow.proofPrompt;
      if (json) { const response = await fetch(downloadUrl(workflow)); if (!response.ok) throw new Error(); text = JSON.stringify(await response.json(), null, 2); }
      await navigator.clipboard.writeText(text); setMessage(json ? 'Workflow JSON copied.' : 'Prompt copied.');
    } catch { setMessage('Could not copy. Use the download link or select the prompt text above.'); }
  }
  return <section className="nd-section"><h2>Explore the workflow</h2><div className="nd-actions"><button className="nd-button nd-secondary" onClick={() => copy(false)}>Copy prompt</button><button className="nd-button nd-secondary" onClick={() => copy(true)}>Copy JSON</button><button className="nd-button nd-secondary" aria-expanded={showGraph} onClick={() => setShowGraph(!showGraph)}>{showGraph ? 'Hide' : 'Open'} graph viewer</button></div><p role="status">{message}</p>{showGraph && <Graph workflowId={workflow.id} workflowTitle={workflow.title} />}</section>;
}

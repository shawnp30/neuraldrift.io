import { HARDWARE_PROFILES, evidenceFreshness, workflowExecutions, crossGpuComparisons } from '@/lib/hardware/executions';

export function ExecutionHistory({ workflowId }: { workflowId: string }) {
  const records = workflowExecutions(workflowId);
  const comparisons = crossGpuComparisons(workflowId);
  return <section className="nd-card nd-card-body" style={{ marginTop: '1rem', overflowX: 'auto' }}>
    <h3>Execution history ({records.length})</h3>
    <p className="nd-subtle">Success applies to the recorded settings. Failure is an outcome; STANDARD and OPTIMIZED describe execution settings. Historical runs without that distinction remain unclassified.</p>
    {records.length ? <table style={{ width: '100%', textAlign: 'left' }}>
      <thead><tr><th>Hardware / date</th><th>Profile / outcome</th><th>Workflow evidence</th><th>Details</th></tr></thead>
      <tbody>{records.map(r => <tr key={r.id}>
        <td>{HARDWARE_PROFILES.find(p => p.id === r.hardwareProfileId)?.name ?? 'Unknown hardware'}<br /><small>{r.testDate}</small></td>
        <td>{r.executionProfile}<br />{r.outcome}{r.runtimeSeconds !== null && ` · ${r.runtimeSeconds.toFixed(2)}s`}</td>
        <td>{evidenceFreshness(r)}<br /><code title={r.workflowSha256 ?? 'Not recorded'}>{r.workflowSha256?.slice(0, 12) ?? 'No hash'}</code></td>
        <td><a href={r.evidenceUrl}>Exact record</a>{r.artifact && <> · <a href={r.artifact}>Output</a></>}
          <details><summary>Settings and notes</summary><pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(r.settings, null, 2)}</pre><p>{r.optimizationNotes}</p>{r.failure && <p>{r.failure.stage}: {r.failure.type}: {r.failure.message}</p>}</details></td>
      </tr>)}</tbody>
    </table> : <p>No recorded executions.</p>}
    <p className="nd-subtle">{comparisons.length ? `${comparisons.length} comparable cross-GPU record pairs.` : 'No comparable cross-GPU executions. Timing comparisons require matching workflow, inputs, model hashes, settings, software, precision and timing protocol.'}</p>
    {comparisons.map(c => <p key={`${c.recordA}:${c.recordB}`}>{c.recordA}: {c.secondsA}s · {c.recordB}: {c.secondsB}s</p>)}
  </section>;
}

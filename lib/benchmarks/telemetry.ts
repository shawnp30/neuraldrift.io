// lib/benchmarks/telemetry.ts
// Runs a generation process while sampling GPU and process-tree memory with one method for every
// runtime, so numbers from different implementations are measured the same way (Node only).

import { spawn, execFileSync } from 'node:child_process';

export interface GpuSnapshot {
  memoryUsedBytes: number;
  utilizationPct: number;
}

export interface MonitoredProcessResult {
  exitCode: number | null;
  signal: string | null;
  wallMs: number;
  stdout: string;
  stderr: string;
  spawnError: string | null;
  vramBaselineBytes: number | null;
  peakVramBytes: number | null;
  peakGpuUtilizationPct: number | null;
  peakProcessTreeRamBytes: number | null;
  gpuSamples: number;
  ramSamples: number;
  method: string;
}

const MIB = 1024 * 1024;
const GPU_INTERVAL_MS = 200;
const RAM_INTERVAL_MS = 500;

export function readGpuSnapshot(gpuIndex = 0): GpuSnapshot | null {
  try {
    const out = execFileSync(
      'nvidia-smi',
      ['-i', String(gpuIndex), '--query-gpu=memory.used,utilization.gpu', '--format=csv,noheader,nounits'],
      { encoding: 'utf8', windowsHide: true, timeout: 10000 }
    );
    const [used, util] = out.trim().split(',').map((s) => Number(s.trim()));
    return Number.isFinite(used) && Number.isFinite(util) ? { memoryUsedBytes: used * MIB, utilizationPct: util } : null;
  } catch {
    return null;
  }
}

// Sums the working set of a process and all of its descendants. Python launchers and worker
// processes would otherwise hide most of the memory from a single-PID measurement.
const WINDOWS_TREE_RAM_SCRIPT = (rootPid: number) => `
$root = ${rootPid}
while ($true) {
  $all = Get-CimInstance Win32_Process -Property ProcessId,ParentProcessId,WorkingSetSize
  if (-not ($all | Where-Object { $_.ProcessId -eq $root })) { break }
  $ids = @{ $root = $true }
  do {
    $added = $false
    foreach ($p in $all) {
      if ($ids.ContainsKey([int]$p.ParentProcessId) -and -not $ids.ContainsKey([int]$p.ProcessId)) { $ids[[int]$p.ProcessId] = $true; $added = $true }
    }
  } while ($added)
  $sum = [int64]0
  foreach ($p in $all) { if ($ids.ContainsKey([int]$p.ProcessId)) { $sum += [int64]$p.WorkingSetSize } }
  [Console]::Out.WriteLine($sum)
  Start-Sleep -Milliseconds ${RAM_INTERVAL_MS}
}`;

export async function runMonitoredProcess(
  command: string,
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv; gpuIndex?: number; timeoutMs?: number } = {}
): Promise<MonitoredProcessResult> {
  const gpuIndex = options.gpuIndex ?? 0;
  const baseline = readGpuSnapshot(gpuIndex);

  let peakVram: number | null = baseline?.memoryUsedBytes ?? null;
  let peakUtil: number | null = baseline?.utilizationPct ?? null;
  let gpuSamples = 0;
  const gpuSampler = baseline
    ? spawn('nvidia-smi', ['-i', String(gpuIndex), '--query-gpu=memory.used,utilization.gpu', '--format=csv,noheader,nounits', `-lms`, String(GPU_INTERVAL_MS)], { windowsHide: true })
    : null;
  gpuSampler?.stdout.setEncoding('utf8').on('data', (chunk: string) => {
    for (const line of chunk.split(/\r?\n/)) {
      const [used, util] = line.split(',').map((s) => Number(s.trim()));
      if (!Number.isFinite(used) || !Number.isFinite(util)) continue;
      gpuSamples++;
      peakVram = Math.max(peakVram ?? 0, used * MIB);
      peakUtil = Math.max(peakUtil ?? 0, util);
    }
  });
  gpuSampler?.on('error', () => undefined);

  const started = process.hrtime.bigint();
  const child = spawn(command, args, { cwd: options.cwd, env: options.env ?? process.env, windowsHide: true });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8').on('data', (d: string) => { stdout += d; });
  child.stderr.setEncoding('utf8').on('data', (d: string) => { stderr += d; });

  let peakRam: number | null = null;
  let ramSamples = 0;
  const ramSampler = process.platform === 'win32' && child.pid
    ? spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', WINDOWS_TREE_RAM_SCRIPT(child.pid)], { windowsHide: true })
    : null;
  ramSampler?.stdout.setEncoding('utf8').on('data', (chunk: string) => {
    for (const line of chunk.split(/\r?\n/)) {
      const bytes = Number(line.trim());
      if (!line.trim() || !Number.isFinite(bytes)) continue;
      ramSamples++;
      peakRam = Math.max(peakRam ?? 0, bytes);
    }
  });
  ramSampler?.on('error', () => undefined);

  const timer = options.timeoutMs ? setTimeout(() => child.kill(), options.timeoutMs) : null;
  const { exitCode, signal, spawnError } = await new Promise<{ exitCode: number | null; signal: string | null; spawnError: string | null }>((resolve) => {
    child.on('error', (err) => resolve({ exitCode: null, signal: null, spawnError: err.message }));
    child.on('close', (code, sig) => resolve({ exitCode: code, signal: sig, spawnError: null }));
  });
  const wallMs = Number(process.hrtime.bigint() - started) / 1e6;
  if (timer) clearTimeout(timer);
  gpuSampler?.kill();
  ramSampler?.kill();

  return {
    exitCode,
    signal,
    wallMs,
    stdout,
    stderr,
    spawnError,
    vramBaselineBytes: baseline?.memoryUsedBytes ?? null,
    peakVramBytes: gpuSamples > 0 ? peakVram : null,
    peakGpuUtilizationPct: gpuSamples > 0 ? peakUtil : null,
    peakProcessTreeRamBytes: ramSamples > 0 ? peakRam : null,
    gpuSamples,
    ramSamples,
    method:
      `Wall time: process spawn to exit (model load included). VRAM/utilization: nvidia-smi device-wide samples every ${GPU_INTERVAL_MS} ms (includes other processes; baseline recorded before start). ` +
      (process.platform === 'win32'
        ? `RAM: summed working set of the process tree, sampled every ${RAM_INTERVAL_MS} ms (a lower bound on the true peak).`
        : 'RAM: not sampled on this platform.'),
  };
}

// lib/benchmarks/telemetry.ts
// Runs a generation process while sampling GPU, process-tree and system telemetry with one method
// for every runtime, so numbers from different implementations are measured the same way (Node only).

import os from 'node:os';
import { spawn, execFileSync } from 'node:child_process';
import type { TelemetrySummary } from './types';

export interface GpuSnapshot {
  memoryUsedBytes: number;
  utilizationPct: number;
}

export interface TimedLine {
  atMs: number; // Milliseconds after spawn when the line arrived
  line: string;
}

export interface MonitoredProcessResult {
  exitCode: number | null;
  signal: string | null;
  wallMs: number;
  stdout: string;
  stderr: string;
  stdoutLines: TimedLine[];
  spawnError: string | null;
  vramBaselineBytes: number | null;
  peakVramBytes: number | null;
  peakGpuUtilizationPct: number | null;
  peakProcessTreeRamBytes: number | null;
  gpuSamples: number;
  ramSamples: number;
  method: string;
  telemetry: TelemetrySummary;
}

const MIB = 1024 * 1024;
export const GPU_INTERVAL_MS = 200;
export const PROCESS_INTERVAL_MS = 500;
const CPU_INTERVAL_MS = 500;

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

/** Parses one `nvidia-smi --query-gpu=memory.used,utilization.gpu,utilization.memory,temperature.gpu,power.draw,clocks.sm` row. */
export function parseGpuSampleLine(line: string) {
  const parts = line.split(',').map((s) => Number(s.trim()));
  if (parts.length < 6 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) return null;
  const opt = (x: number) => (Number.isFinite(x) ? x : null);
  return { memoryUsedBytes: parts[0] * MIB, utilizationPct: parts[1], memoryUtilizationPct: opt(parts[2]), temperatureC: opt(parts[3]), powerW: opt(parts[4]), smClockMHz: opt(parts[5]) };
}

/** Parses a process-tree sample line: "<working set bytes>|<pid>,<pid>,..." */
export function parseTreeSampleLine(line: string): { workingSetBytes: number; pids: number[] } | null {
  const [ws, pidList] = line.trim().split('|');
  const bytes = Number(ws);
  if (!ws || !Number.isFinite(bytes)) return null;
  return { workingSetBytes: bytes, pids: (pidList ?? '').split(',').map(Number).filter((p) => Number.isInteger(p) && p > 0) };
}

// Working set of a process and all descendants, plus the tree's PIDs so GPU counters can be attributed.
// Python launchers and worker processes would otherwise hide memory from a single-PID measurement.
const WINDOWS_TREE_SCRIPT = (rootPid: number) => `
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
  [Console]::Out.WriteLine("$sum|" + (($ids.Keys | ForEach-Object { $_ }) -join ','))
  Start-Sleep -Milliseconds ${PROCESS_INTERVAL_MS}
}`;

// Per-process GPU memory from the Windows "GPU Process Memory" performance counters. One batch per
// sample, terminated by "END". Each Get-Counter call takes roughly a second, which sets the interval.
const WINDOWS_GPU_PROCESS_SCRIPT = `
while ($true) {
  $c = Get-Counter -Counter '\\GPU Process Memory(*)\\Dedicated Usage','\\GPU Process Memory(*)\\Shared Usage','\\GPU Adapter Memory(*)\\Shared Usage' -ErrorAction SilentlyContinue
  foreach ($s in $c.CounterSamples) {
    $kind = if ($s.Path -like '*dedicated usage') { 'D' } else { 'S' }
    if ($s.InstanceName -match '^pid_(\\d+)_(luid_[^_]+_[^_]+)') {
      [Console]::Out.WriteLine("$($Matches[1]) $($Matches[2]) $kind $([int64]$s.CookedValue)")
    } elseif ($s.InstanceName -match '^(luid_[^_]+_[^_]+)_phys') {
      [Console]::Out.WriteLine("A $($Matches[1]) $kind $([int64]$s.CookedValue)")
    }
  }
  [Console]::Out.WriteLine('END')
}`;

function cpuTimes() {
  return os.cpus().reduce(
    (acc, c) => {
      const total = c.times.user + c.times.nice + c.times.sys + c.times.idle + c.times.irq;
      return { busy: acc.busy + total - c.times.idle, total: acc.total + total };
    },
    { busy: 0, total: 0 }
  );
}

const mean = (xs: number[]) => (xs.length ? Number((xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1)) : null);
const max = (xs: number[]) => (xs.length ? Math.max(...xs) : null);
const min = (xs: number[]) => (xs.length ? Math.min(...xs) : null);

export async function runMonitoredProcess(
  command: string,
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv; gpuIndex?: number; timeoutMs?: number } = {}
): Promise<MonitoredProcessResult> {
  const gpuIndex = options.gpuIndex ?? 0;
  const baseline = readGpuSnapshot(gpuIndex);
  const systemRamBaseline = os.totalmem() - os.freemem();

  // Device-wide GPU samples.
  const gpu = { mem: [] as number[], util: [] as number[], memUtil: [] as number[], temp: [] as number[], power: [] as number[], clock: [] as number[] };
  const gpuSampler = baseline
    ? spawn('nvidia-smi', ['-i', String(gpuIndex), '--query-gpu=memory.used,utilization.gpu,utilization.memory,temperature.gpu,power.draw,clocks.sm', '--format=csv,noheader,nounits', '-lms', String(GPU_INTERVAL_MS)], { windowsHide: true })
    : null;
  let gpuBuffer = '';
  gpuSampler?.stdout.setEncoding('utf8').on('data', (chunk: string) => {
    gpuBuffer += chunk;
    const lines = gpuBuffer.split(/\r?\n/);
    gpuBuffer = lines.pop() ?? '';
    for (const line of lines) {
      const s = parseGpuSampleLine(line);
      if (!s) continue;
      gpu.mem.push(s.memoryUsedBytes);
      gpu.util.push(s.utilizationPct);
      if (s.memoryUtilizationPct != null) gpu.memUtil.push(s.memoryUtilizationPct);
      if (s.temperatureC != null) gpu.temp.push(s.temperatureC);
      if (s.powerW != null) gpu.power.push(s.powerW);
      if (s.smClockMHz != null) gpu.clock.push(s.smClockMHz);
    }
  });
  gpuSampler?.on('error', () => undefined);

  // System CPU and RAM samples.
  const cpu: number[] = [];
  const sysRam: number[] = [systemRamBaseline];
  let lastCpu = cpuTimes();
  const cpuTimer = setInterval(() => {
    const now = cpuTimes();
    const total = now.total - lastCpu.total;
    if (total > 0) cpu.push(Number(((100 * (now.busy - lastCpu.busy)) / total).toFixed(1)));
    lastCpu = now;
    sysRam.push(os.totalmem() - os.freemem());
  }, CPU_INTERVAL_MS);

  const started = process.hrtime.bigint();
  const elapsed = () => Number(process.hrtime.bigint() - started) / 1e6;
  const child = spawn(command, args, { cwd: options.cwd, env: options.env ?? process.env, windowsHide: true });
  let stdout = '';
  let stderr = '';
  let lineBuffer = '';
  const stdoutLines: TimedLine[] = [];
  child.stdout.setEncoding('utf8').on('data', (d: string) => {
    stdout += d;
    lineBuffer += d;
    const lines = lineBuffer.split(/\r?\n/);
    lineBuffer = lines.pop() ?? '';
    const at = elapsed();
    for (const line of lines) stdoutLines.push({ atMs: Number(at.toFixed(1)), line });
  });
  child.stderr.setEncoding('utf8').on('data', (d: string) => { stderr += d; });

  // Process tree: working set and PIDs.
  const treeRam: number[] = [];
  let treePids = new Set<number>(child.pid ? [child.pid] : []);
  const treeSampler = process.platform === 'win32' && child.pid
    ? spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', WINDOWS_TREE_SCRIPT(child.pid)], { windowsHide: true })
    : null;
  treeSampler?.stdout.setEncoding('utf8').on('data', (chunk: string) => {
    for (const line of chunk.split(/\r?\n/)) {
      const s = parseTreeSampleLine(line);
      if (!s) continue;
      treeRam.push(s.workingSetBytes);
      if (s.pids.length) treePids = new Set(s.pids);
    }
  });
  treeSampler?.on('error', () => undefined);

  // Process tree: dedicated and shared GPU memory.
  const procVram: number[] = [];
  const procShared: number[] = [];
  const adapterShared: number[] = [];
  let batch = new Map<number, { D: number; S: number; luid: string }>();
  let adapterBatch = new Map<string, number>();
  let procBuffer = '';
  const gpuProcSampler = process.platform === 'win32'
    ? spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', WINDOWS_GPU_PROCESS_SCRIPT], { windowsHide: true })
    : null;
  gpuProcSampler?.stdout.setEncoding('utf8').on('data', (chunk: string) => {
    procBuffer += chunk;
    const lines = procBuffer.split(/\r?\n/);
    procBuffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.trim() === 'END') {
        let d = 0;
        let s = 0;
        let seen = false;
        const luids = new Set<string>();
        for (const [pid, v] of batch) if (treePids.has(pid)) { d += v.D; s += v.S; seen = true; if (v.D > 0) luids.add(v.luid); }
        if (seen) { procVram.push(d); procShared.push(s); }
        // Adapter-wide shared memory for the adapter(s) the process tree is actually using.
        const adapterTotal = [...luids].reduce((sum, luid) => sum + (adapterBatch.get(luid) ?? 0), 0);
        if (luids.size) adapterShared.push(adapterTotal);
        batch = new Map();
        adapterBatch = new Map();
        continue;
      }
      const a = line.match(/^A (luid_\S+) S (\d+)$/);
      if (a) { adapterBatch.set(a[1], Number(a[2])); continue; }
      const m = line.match(/^(\d+) (luid_\S+) ([DS]) (\d+)$/);
      if (!m) continue;
      const pid = Number(m[1]);
      const entry = batch.get(pid) ?? { D: 0, S: 0, luid: m[2] };
      entry[m[3] as 'D' | 'S'] += Number(m[4]);
      batch.set(pid, entry);
    }
  });
  gpuProcSampler?.on('error', () => undefined);

  const timer = options.timeoutMs ? setTimeout(() => child.kill(), options.timeoutMs) : null;
  const { exitCode, signal, spawnError } = await new Promise<{ exitCode: number | null; signal: string | null; spawnError: string | null }>((resolve) => {
    child.on('error', (err) => resolve({ exitCode: null, signal: null, spawnError: err.message }));
    child.on('close', (code, sig) => resolve({ exitCode: code, signal: sig, spawnError: null }));
  });
  const wallMs = elapsed();
  if (lineBuffer) stdoutLines.push({ atMs: Number(wallMs.toFixed(1)), line: lineBuffer });
  if (timer) clearTimeout(timer);
  clearInterval(cpuTimer);
  gpuSampler?.kill();
  treeSampler?.kill();
  gpuProcSampler?.kill();

  const peakVram = gpu.mem.length ? Math.max(baseline?.memoryUsedBytes ?? 0, ...gpu.mem) : null;
  const peakUtil = gpu.util.length ? Math.max(baseline?.utilizationPct ?? 0, ...gpu.util) : null;
  const method =
    `Wall time: process spawn to exit (model load included). Device GPU: nvidia-smi every ${GPU_INTERVAL_MS} ms (memory used, utilization, memory utilization, temperature, power, SM clock; includes other processes; baseline recorded before start). ` +
    (process.platform === 'win32'
      ? `Process tree: working set every ${PROCESS_INTERVAL_MS} ms and Windows "GPU Process Memory" dedicated/shared counters about once per second (lower bounds on true peaks). `
      : 'Process-tree memory is not sampled on this platform. ') +
    `System: CPU utilization and used RAM every ${CPU_INTERVAL_MS} ms.`;

  const telemetry: TelemetrySummary = {
    method,
    gpuSampleIntervalMs: GPU_INTERVAL_MS,
    gpuSamples: gpu.mem.length,
    vramBaselineBytes: baseline?.memoryUsedBytes ?? null,
    vramPeakBytes: peakVram,
    gpuUtilizationPeakPct: peakUtil,
    gpuUtilizationMeanPct: mean(gpu.util),
    gpuMemoryUtilizationPeakPct: max(gpu.memUtil),
    gpuTemperaturePeakC: max(gpu.temp),
    gpuPowerPeakW: max(gpu.power),
    gpuPowerMeanW: mean(gpu.power),
    gpuSmClockMinMHz: min(gpu.clock),
    processSampleIntervalMs: treeSampler ? PROCESS_INTERVAL_MS : null,
    processSamples: treeRam.length,
    processRamPeakBytes: max(treeRam),
    processGpuSamples: procVram.length,
    processVramPeakBytes: max(procVram),
    processSharedGpuMemoryPeakBytes: max(procShared),
    adapterSharedGpuMemoryStartBytes: adapterShared.length ? adapterShared[0] : null,
    adapterSharedGpuMemoryPeakBytes: max(adapterShared),
    cpuUtilizationPeakPct: max(cpu),
    cpuUtilizationMeanPct: mean(cpu),
    systemRamBaselineBytes: systemRamBaseline,
    systemRamPeakBytes: max(sysRam),
  };

  return {
    exitCode,
    signal,
    wallMs,
    stdout,
    stderr,
    stdoutLines,
    spawnError,
    vramBaselineBytes: telemetry.vramBaselineBytes,
    peakVramBytes: gpu.mem.length ? peakVram : null,
    peakGpuUtilizationPct: gpu.util.length ? peakUtil : null,
    peakProcessTreeRamBytes: telemetry.processRamPeakBytes,
    gpuSamples: gpu.mem.length,
    ramSamples: treeRam.length,
    method,
    telemetry,
  };
}

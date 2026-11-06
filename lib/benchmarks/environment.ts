// lib/benchmarks/environment.ts
// Detects the hardware/software environment of the machine running a benchmark (Node only).
// Values come from the machine; anything that cannot be detected is reported as unknown, never assumed.

import os from 'node:os';
import { execFileSync } from 'node:child_process';
import type { BenchmarkHardwareProfile, BenchmarkSoftwareEnvironment, HardwareFormFactor } from './types';

export interface DetectedEnvironment {
  hardware: BenchmarkHardwareProfile;
  software: BenchmarkSoftwareEnvironment;
  gpuComputeCapability: string | null;
}

const MIB = 1024 * 1024;

// NVIDIA compute capability → architecture name.
export function gpuArchFromComputeCapability(cc: string | null): string {
  if (!cc) return 'Unknown';
  const major = Number(cc.split('.')[0]);
  const minor = Number(cc.split('.')[1] ?? 0);
  if (major === 12 || major === 10) return 'Blackwell';
  if (major === 9) return 'Hopper';
  if (major === 8 && minor === 9) return 'Ada Lovelace';
  if (major === 8) return 'Ampere';
  if (major === 7 && minor === 5) return 'Turing';
  if (major === 7) return 'Volta';
  if (major === 6) return 'Pascal';
  return 'Unknown';
}

/** "NVIDIA GeForce RTX 5080" → "local-rtx-5080" (matches historical record IDs). */
export function hardwareIdFromGpuName(gpuName: string, count = 1): string {
  const slug = gpuName
    .replace(/^NVIDIA\s+/i, '')
    .replace(/^GeForce\s+/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `local-${count > 1 ? `${count}x-` : ''}${slug}`;
}

/** Parses the CUDA version the driver supports from the nvidia-smi banner (old and new formats). */
export function parseDriverCudaVersion(banner: string): string | null {
  return banner.match(/CUDA (?:UMD )?Version:\s*([\d.]+)/)?.[1] ?? null;
}

// Win32_SystemEnclosure chassis types that identify portables.
const PORTABLE_CHASSIS = new Set([8, 9, 10, 11, 12, 14, 18, 21, 30, 31, 32]);

function detectFormFactor(gpuCount: number): HardwareFormFactor | null {
  if (gpuCount > 1) return 'multi_gpu';
  if (process.platform !== 'win32') return null;
  try {
    const out = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', '(Get-CimInstance Win32_SystemEnclosure).ChassisTypes -join ","'], { encoding: 'utf8', windowsHide: true, timeout: 15000 });
    const types = out.trim().split(',').map(Number).filter(Number.isFinite);
    if (!types.length) return null;
    return types.some((t) => PORTABLE_CHASSIS.has(t)) ? 'laptop' : 'desktop';
  } catch {
    return null;
  }
}

export function detectEnvironment(options: { gpuIndex?: number; formFactor?: HardwareFormFactor } = {}): DetectedEnvironment {
  const gpuIndex = options.gpuIndex ?? 0;
  let rows: string[];
  try {
    rows = execFileSync('nvidia-smi', ['--query-gpu=name,driver_version,memory.total,compute_cap', '--format=csv,noheader,nounits'], { encoding: 'utf8', windowsHide: true, timeout: 15000 })
      .trim()
      .split(/\r?\n/);
  } catch (err) {
    throw new Error(`GPU detection failed: nvidia-smi is unavailable (${err instanceof Error ? err.message : String(err)}). Refusing to record hardware that was not observed.`);
  }
  const selected = rows[gpuIndex];
  if (!selected) throw new Error(`GPU index ${gpuIndex} not found (nvidia-smi reported ${rows.length} GPU(s)).`);
  const [gpuName, driverVersion, totalMiB, computeCap] = selected.split(',').map((s) => s.trim());

  let cudaVersion: string | null = null;
  try {
    cudaVersion = parseDriverCudaVersion(execFileSync('nvidia-smi', [], { encoding: 'utf8', windowsHide: true, timeout: 15000 }));
  } catch {
    cudaVersion = null;
  }

  const formFactor = options.formFactor ?? detectFormFactor(1);
  if (!formFactor) throw new Error('Could not detect the chassis form factor; pass --form-factor explicitly.');

  return {
    gpuComputeCapability: computeCap || null,
    hardware: {
      id: hardwareIdFromGpuName(gpuName),
      gpuName,
      gpuArch: gpuArchFromComputeCapability(computeCap || null),
      gpuCount: 1, // One device is benchmarked per run
      vramBytes: Number(totalMiB) * MIB,
      systemRamBytes: os.totalmem(),
      cpuModel: os.cpus()[0]?.model.trim() || undefined,
      formFactor,
      isCloud: false,
    },
    software: {
      os: `${os.platform()} ${os.release()}`,
      driverVersion,
      cudaVersion, // Highest CUDA version the installed driver supports
      pythonVersion: null, // Set by the adapter only when the runtime is Python-based
    },
  };
}

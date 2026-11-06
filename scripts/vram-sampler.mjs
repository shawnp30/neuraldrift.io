// Samples device-wide GPU memory in use with `nvidia-smi` while a workflow runs.
// memory.used covers every process on the GPU plus PyTorch's cached allocations, so
// the recorded peak is what the card had in use, not the minimum a workflow needs.
import { spawn } from 'node:child_process';

export const VRAM_METHOD = 'nvidia-smi memory.used (device-wide), sampled every 100 ms';
const MIB = 1024 ** 2;

/**
 * Starts sampling. Resolves once the first sample (the baseline) has been read and the
 * reported GPU name matches `expectedName`; rejects otherwise.
 * `sampler` overrides the command for tests: { command, args }.
 */
export function startVramSampler({ gpuIndex = 0, expectedName, sampler } = {}) {
  const command = sampler?.command ?? 'nvidia-smi';
  const args = sampler?.args ?? ['--query-gpu=name,memory.used', '--format=csv,noheader,nounits', '-lms', '100', '-i', String(gpuIndex)];
  const child = spawn(command, args, { windowsHide: true });
  let baselineBytes = null;
  let peakBytes = null;
  let sampleCount = 0;
  let buffered = '';
  let stderr = '';

  const ready = new Promise((resolve, reject) => {
    child.on('error', (error) => reject(new Error(`VRAM sampler could not start: ${error.message}`)));
    child.stderr.on('data', (data) => { stderr += data; });
    child.on('exit', (code) => {
      if (baselineBytes === null) reject(new Error(`VRAM sampler exited (code ${code}) before its first sample. ${stderr.trim()}`.trim()));
    });
    child.stdout.on('data', (data) => {
      buffered += data;
      const lines = buffered.split(/\r?\n/);
      buffered = lines.pop();
      for (const line of lines) {
        const match = line.match(/^(.+),\s*(\d+)\s*$/);
        if (!match) continue;
        const [, name, mib] = match;
        if (expectedName && !name.includes(expectedName)) {
          child.kill();
          reject(new Error(`nvidia-smi GPU ${gpuIndex} is "${name.trim()}", not ${expectedName}. Set nvidiaSmiGpuIndex in the config.`));
          return;
        }
        const bytes = Number(mib) * MIB;
        sampleCount++;
        if (baselineBytes === null) { baselineBytes = bytes; resolve(); }
        peakBytes = Math.max(peakBytes ?? 0, bytes);
      }
    });
  });

  return {
    ready,
    /** Stops sampling and returns the observed baseline and peak. */
    stop() {
      child.kill();
      return { status: 'MEASURED', method: VRAM_METHOD, baselineBytes, peakBytes, sampleCount };
    },
  };
}

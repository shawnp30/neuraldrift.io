// lib/benchmarks/audio.ts
// Dependency-free WAV decoding and signal analysis for audio artifact validation.
// Reads the actual samples: a valid header alone never proves a usable artifact.

export interface AudioAnalysis {
  format: 'wav';
  sampleFormat: 'pcm' | 'float';
  bitsPerSample: number;
  sampleRateHz: number;
  channels: number;
  frames: number;
  durationSec: number;
  peakDbfs: number;          // -Infinity for digital silence
  rmsDbfs: number;           // -Infinity for digital silence
  clippedSampleRatio: number; // Share of samples at or beyond full scale
}

export class AudioDecodeError extends Error {}

const WAVE_FORMAT_PCM = 0x0001;
const WAVE_FORMAT_IEEE_FLOAT = 0x0003;
const WAVE_FORMAT_EXTENSIBLE = 0xfffe;

const toDbfs = (linear: number) => (linear > 0 ? 20 * Math.log10(linear) : -Infinity);

/**
 * Decodes a RIFF/WAVE buffer (PCM 8/16/24/32-bit or IEEE float 32/64-bit) and measures it.
 * Throws AudioDecodeError for anything that is not a decodable WAV file.
 */
export function analyzeWav(buffer: Uint8Array): AudioAnalysis {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const ascii = (offset: number) =>
    String.fromCharCode(buffer[offset], buffer[offset + 1], buffer[offset + 2], buffer[offset + 3]);

  if (buffer.byteLength < 12 || ascii(0) !== 'RIFF' || ascii(8) !== 'WAVE') {
    throw new AudioDecodeError('Not a RIFF/WAVE file.');
  }

  let fmt: { formatTag: number; channels: number; sampleRate: number; bitsPerSample: number; blockAlign: number } | null = null;
  let data: { offset: number; size: number } | null = null;
  let offset = 12;
  while (offset + 8 <= buffer.byteLength) {
    const id = ascii(offset);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;
    if (id === 'fmt ') {
      if (size < 16) throw new AudioDecodeError('fmt chunk is truncated.');
      let formatTag = view.getUint16(body, true);
      if (formatTag === WAVE_FORMAT_EXTENSIBLE && size >= 40) formatTag = view.getUint16(body + 24, true);
      fmt = {
        formatTag,
        channels: view.getUint16(body + 2, true),
        sampleRate: view.getUint32(body + 4, true),
        blockAlign: view.getUint16(body + 12, true),
        bitsPerSample: view.getUint16(body + 14, true),
      };
    } else if (id === 'data') {
      // Streaming writers may leave 0 or 0xFFFFFFFF; fall back to the bytes actually present.
      const available = buffer.byteLength - body;
      data = { offset: body, size: size === 0 || size > available ? available : size };
      break;
    }
    offset = body + size + (size % 2);
  }

  if (!fmt) throw new AudioDecodeError('Missing fmt chunk.');
  if (!data) throw new AudioDecodeError('Missing data chunk.');
  if (fmt.channels < 1 || fmt.sampleRate < 1 || fmt.blockAlign < 1) throw new AudioDecodeError('Invalid fmt chunk values.');

  const bytesPerSample = fmt.bitsPerSample / 8;
  let read: (at: number) => number;
  let sampleFormat: AudioAnalysis['sampleFormat'];
  if (fmt.formatTag === WAVE_FORMAT_PCM) {
    sampleFormat = 'pcm';
    if (fmt.bitsPerSample === 8) read = (at) => (view.getUint8(at) - 128) / 128;
    else if (fmt.bitsPerSample === 16) read = (at) => view.getInt16(at, true) / 32768;
    else if (fmt.bitsPerSample === 24) read = (at) => {
      const v = view.getUint8(at) | (view.getUint8(at + 1) << 8) | (view.getInt8(at + 2) << 16);
      return v / 8388608;
    };
    else if (fmt.bitsPerSample === 32) read = (at) => view.getInt32(at, true) / 2147483648;
    else throw new AudioDecodeError(`Unsupported PCM bit depth: ${fmt.bitsPerSample}.`);
  } else if (fmt.formatTag === WAVE_FORMAT_IEEE_FLOAT) {
    sampleFormat = 'float';
    if (fmt.bitsPerSample === 32) read = (at) => view.getFloat32(at, true);
    else if (fmt.bitsPerSample === 64) read = (at) => view.getFloat64(at, true);
    else throw new AudioDecodeError(`Unsupported float bit depth: ${fmt.bitsPerSample}.`);
  } else {
    throw new AudioDecodeError(`Unsupported WAV format tag: 0x${fmt.formatTag.toString(16)}.`);
  }

  const frames = Math.floor(data.size / fmt.blockAlign);
  if (frames === 0) throw new AudioDecodeError('WAV data chunk contains no audio frames.');

  let peak = 0;
  let sumSquares = 0;
  let clipped = 0;
  let nonFinite = 0;
  const samples = frames * fmt.channels;
  for (let frame = 0; frame < frames; frame++) {
    const frameOffset = data.offset + frame * fmt.blockAlign;
    for (let ch = 0; ch < fmt.channels; ch++) {
      const s = read(frameOffset + ch * bytesPerSample);
      if (!Number.isFinite(s)) { nonFinite++; continue; }
      const a = Math.abs(s);
      if (a > peak) peak = a;
      if (a >= 0.999) clipped++;
      sumSquares += s * s;
    }
  }
  if (nonFinite > 0) throw new AudioDecodeError(`WAV contains ${nonFinite} non-finite (NaN/Inf) samples.`);

  return {
    format: 'wav',
    sampleFormat,
    bitsPerSample: fmt.bitsPerSample,
    sampleRateHz: fmt.sampleRate,
    channels: fmt.channels,
    frames,
    durationSec: frames / fmt.sampleRate,
    peakDbfs: toDbfs(peak),
    rmsDbfs: toDbfs(Math.sqrt(sumSquares / samples)),
    clippedSampleRatio: clipped / samples,
  };
}

/** Builds a PCM16 or float32 WAV buffer. Used by tests to create known fixtures. */
export function encodeWav(channelData: Float32Array[], sampleRateHz: number, sampleFormat: 'pcm16' | 'float32' = 'pcm16'): Uint8Array {
  const channels = channelData.length;
  const frames = channelData[0]?.length ?? 0;
  const bytesPerSample = sampleFormat === 'pcm16' ? 2 : 4;
  const dataSize = frames * channels * bytesPerSample;
  const out = new Uint8Array(44 + dataSize);
  const view = new DataView(out.buffer);
  const writeAscii = (at: number, text: string) => { for (let i = 0; i < 4; i++) out[at + i] = text.charCodeAt(i); };
  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, sampleFormat === 'pcm16' ? WAVE_FORMAT_PCM : WAVE_FORMAT_IEEE_FLOAT, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRateHz, true);
  view.setUint32(28, sampleRateHz * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeAscii(36, 'data');
  view.setUint32(40, dataSize, true);
  let at = 44;
  for (let f = 0; f < frames; f++) {
    for (let ch = 0; ch < channels; ch++) {
      const s = channelData[ch][f];
      if (sampleFormat === 'pcm16') view.setInt16(at, Math.max(-32768, Math.min(32767, Math.round(s * 32767))), true);
      else view.setFloat32(at, s, true);
      at += bytesPerSample;
    }
  }
  return out;
}

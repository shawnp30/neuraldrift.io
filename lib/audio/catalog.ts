// lib/audio/catalog.ts
// Local Audio AI discovery: task taxonomy, upstream runtime claims (audio.cpp), and what NeuralDrift
// has actually executed. Upstream claims and NeuralDrift evidence are kept visibly separate.

import upstream from '@/data/audio-upstream-families.json';
import type { AudioTask, BenchmarkRecord, CommercialUseStatus } from '@/lib/benchmarks/types';
import { getAllBenchmarks } from '@/lib/benchmarks/registry';
import { getWorkloadById } from '@/lib/benchmarks/workloads';

export const AUDIO_TASKS: { id: AudioTask; label: string; summary: string }[] = [
  { id: 'tts', label: 'Text to Speech', summary: 'Generate speech from text with built-in or described voices.' },
  { id: 'voice_cloning', label: 'Voice Cloning', summary: 'Speak new text in the voice of a short reference recording.' },
  { id: 'asr', label: 'Speech Recognition (ASR)', summary: 'Transcribe speech to text, some with timestamps or streaming.' },
  { id: 'diarization', label: 'Diarization', summary: 'Label who spoke when in multi-speaker audio.' },
  { id: 'voice_conversion', label: 'Voice Conversion', summary: 'Re-voice existing speech or singing as a different speaker.' },
  { id: 'music', label: 'Music Generation', summary: 'Generate songs or instrumentals from text and lyrics.' },
  { id: 'sfx', label: 'SFX / Foley', summary: 'Generate sound effects and Foley from text or video.' },
  { id: 'source_separation', label: 'Source Separation', summary: 'Split a mix into stems such as vocals, drums and bass.' },
  { id: 'restoration', label: 'Restoration', summary: 'Recover bandwidth or repair degraded audio (super-resolution, restoration).' },
];

export interface UpstreamFamily {
  family: string;
  tags: string[];
  languages: string;
  variants: string[];
  runtime: string;
  tasks: AudioTask[];
  licenseInfo: {
    license: string;
    commercialUse: CommercialUseStatus;
    licenseSourceUrl: string | null;
    weightsUrl: string | null;
    notes?: string;
    checked: string;
  };
}

export const UPSTREAM_SOURCE = upstream.source;
export const UPSTREAM_FAMILIES = upstream.families as UpstreamFamily[];

export function upstreamFamiliesForTask(task: AudioTask): UpstreamFamily[] {
  return UPSTREAM_FAMILIES.filter((f) => f.tasks.includes(task)).sort((a, b) => a.family.localeCompare(b.family));
}

export const COMMERCIAL_USE_LABEL: Record<CommercialUseStatus, string> = {
  COMMERCIAL_OK: 'Commercial use permitted',
  RESTRICTED: 'Restricted / conditional',
  NON_COMMERCIAL: 'Non-commercial only',
  RESEARCH_ONLY: 'Research only',
  LICENSE_REVIEW_REQUIRED: 'License review required',
  UNKNOWN: 'Unknown',
};

/** Audio benchmark records, newest first. */
export function getAudioBenchmarks(): BenchmarkRecord[] {
  return getAllBenchmarks().filter((r) => r.category === 'creator_audio');
}

export function audioTaskOf(record: BenchmarkRecord): AudioTask | null {
  const workload = getWorkloadById(record.workloadId);
  return workload && workload.category === 'creator_audio' ? workload.audioTask : null;
}

export function testedRecordsForTask(task: AudioTask): BenchmarkRecord[] {
  return getAudioBenchmarks().filter((r) => audioTaskOf(r) === task);
}

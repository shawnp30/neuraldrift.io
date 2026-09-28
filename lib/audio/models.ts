// lib/audio/models.ts
// Audio models NeuralDrift has executed, with licenses read from the licensor's own sources.

import type { BenchmarkModelConfig, LicenseInfo } from '@/lib/benchmarks/types';

export const ACE_STEP_15_MODEL_LICENSE: LicenseInfo = {
  id: 'MIT',
  commercialUse: 'COMMERCIAL_OK',
  sourceUrl: 'https://huggingface.co/ACE-Step/Ace-Step1.5',
  verifiedAt: '2026-09-27',
  notes:
    'Model card (revision 19671f4) declares MIT and states generated music may be used commercially. The planner LMs are fine-tuned from Qwen3; the bundled Qwen3-Embedding-0.6B text encoder is Apache-2.0. Informational, not legal advice.',
};

// Shared identity for both implementations. Weight files differ by container (GGUF vs safetensors)
// and are recorded per run as hashed files, never folded into the model ID.
export const ACE_STEP_15_TURBO: Omit<BenchmarkModelConfig, 'files'> = {
  provider: 'ACE-Step',
  modelId: 'acestep-v15-turbo',
  displayName: 'ACE-Step 1.5 Turbo',
  parameterSize: 'Turbo DiT + 1.7B LM planner',
  architecture: 'ACE-Step 1.5 (DiT + 5Hz LM planner)',
  quantization: 'BF16',
  version: '1.5',
  license: ACE_STEP_15_MODEL_LICENSE,
};

export const AUDIO_MODELS: Record<string, Omit<BenchmarkModelConfig, 'files'>> = {
  'acestep-v15-turbo': ACE_STEP_15_TURBO,
};

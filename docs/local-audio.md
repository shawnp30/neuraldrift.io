# Local Audio AI — audio.cpp + ACE-Step 1.5 on RTX 5080

Phase record, 2026-09-27/28. Everything below was observed on the NeuralDrift testbench or read from the
primary sources linked here. Public view: `/lab/audio`.

## Sources (read 2026-09-27)

| Fact | Source |
|---|---|
| Official repository (non-fork, origin of the forks found) | https://github.com/0xShug0/audio.cpp |
| Release tested: `v0.8.2-audio8-perf-hotfix` (2026-09-25), commit `ac16661d` | https://github.com/0xShug0/audio.cpp/releases/tag/v0.8.2-audio8-perf-hotfix |
| Engine license: Apache-2.0, © 2026 ShugoAI LLC | https://github.com/0xShug0/audio.cpp/blob/main/LICENSE |
| Windows packages: CPU, Vulkan, CUDA 12.4 / 13.3; CUDA runtime in a separate `cudart` archive | README "Prebuilt Binaries" |
| CUDA 13.3 Windows build compiles `75;80;86;89;90;120` (Blackwell included); the 12.4 build does not include 120 | `.github/workflows/release.yml` |
| ACE-Step 1.5 support (`--family ace_step --task gen`; Turbo, Base, XL Turbo, XL SFT; routes text2music/complete/lego/extract/cover/repaint) | https://github.com/0xShug0/audio.cpp/blob/ac16661d/docs/models/ace_step.md |
| Quantization: per-model `weight_type` options; ACE-Step q8_0 graded unsafe for the planner LM; BF16 default package | README "Precision/Quantization Support", `docs/models/ace_step.md` |
| Server: `/health`, `/v1/models`, `/v1/audio/speech`, `/v1/audio/transcriptions`, `/v1/audio/alignments`, `/v1/tasks/run`; embedded WebUI (`--ui`) | README "Server", "WebUI" |
| Arena UI: side-by-side TTS, VC and ASR comparison (release 0.7) | README "News" |
| Output: `--out` WAV; `--metrics` prints wall time, RTF, sample rate, channels, peak RSS | README "CLI"; observed |
| Supported families by task, and per-family model licenses | README "Supported Models"; https://github.com/0xShug0/audio.cpp/blob/ac16661d/docs/model_licenses.md → `data/audio-upstream-families.json` |
| ACE-Step 1.5 model license: MIT; card states generated music may be used commercially | https://huggingface.co/ACE-Step/Ace-Step1.5 (revision `19671f4`) |
| ACE-Step 1.5 code license: MIT | https://github.com/ace-step/ACE-Step-1.5/blob/main/LICENSE |
| Bundled text encoder Qwen3-Embedding-0.6B: Apache-2.0 | https://huggingface.co/Qwen/Qwen3-Embedding-0.6B |
| GGUF repository lists the original ACE-Step license (MIT) | https://huggingface.co/audio-cpp/audio.cpp-gguf |

## Installation (isolated)

- Location: `D:\AI\audio.cpp\` (binaries in `v0.8.2-audio8-perf-hotfix-cuda13.3\`, model in `models\`, archives in `downloads\`).
- Provenance manifest: `D:\AI\audio.cpp\v0.8.2-audio8-perf-hotfix-cuda13.3\neuraldrift-install.json`.
- Verified downloads (SHA-256 matched the published digests exactly):
  - `...-bin-windows-x64-cuda13.3.zip` 272,191,107 B `298255ed…ddbb480` (GitHub asset digest)
  - `...-cudart-windows-x64-cuda13.3.zip` 575,457,454 B `f2c75df4…e5d024` (GitHub asset digest)
  - `ACE-Step1.5-GGUF/turbo/ace-step-1.5-turbo-bf16.gguf` 10,090,398,272 B `93974239…71d2be5f` (Hugging Face LFS oid)
- Disk: 1.1 GB extracted binaries + 9.4 GiB model + 809 MB archives (deletable) + 61 MB sidecar cache in `%TEMP%\audiocpp-gguf`.
- Nothing system-level was changed: no CUDA toolkit, driver, Python, ComfyUI, WanGP or ACE-Step modification. The CUDA runtime DLLs ship inside the audio.cpp folder.
- To free VRAM for measurement, the user approved stopping Unsloth Studio (llama-server with Qwen3.8-27B), WanGP (`D:\AI\WanGP\wgp.py`) and ComfyUI (port 8188). They were stopped, not modified, and need restarting.

## Existing ACE-Step installation (baseline, read-only)

- Path `C:\Users\shawn\ACE-Step-1.5`, git `6d467e4` (origin `ace-step/ACE-Step-1.5`), `ace-step` 1.5.0.
- Environment: `.venv` (uv, CPython 3.12.11), torch 2.7.1+cu128, transformers 4.57.6, diffusers 0.37.1; no flash_attn, no Triton, nano-vllm present.
- Checkpoints used: `acestep-v15-turbo`, `acestep-5Hz-lm-1.7B`, `Qwen3-Embedding-0.6B`, `vae`. All four match the official `ACE-Step/Ace-Step1.5` Hugging Face LFS hashes exactly.
- REST service: port 8001 was not listening at inspection time (the API is `acestep-api`, default 8001). The benchmark drives the Python API directly through `scripts/acestep_reference_runner.py` and writes only to NeuralDrift's artifact folder. `git status` of the checkout was identical before and after.

## Environment detected at run time

NVIDIA GeForce RTX 5080 (compute capability 12.0, Blackwell), 16,303 MiB; driver 616.92 (CUDA UMD 13.4);
AMD Ryzen 9 9950X3D 16-Core Processor; 66,185,273,344 B system RAM visible to the OS (64 GB installed, per the hardware target); Windows `win32 10.0.26200`; form factor `desktop` (detected from the chassis type).
audio.cpp reported `backends: cpu,cuda` and ggml found the RTX 5080 with 16,275 MiB.

## ND-AUDIO-MUSIC-001 v1.0.0

Prompt "Instrumental lo-fi hip hop beat with warm Rhodes piano chords, mellow sub bass, soft vinyl crackle and relaxed
boom-bap drums"; lyrics `[Instrumental]`; en; 30 s; seed 42; 8 steps; guidance 1.0; bpm 85; C minor; 4/4; shift 3.0;
ODE sampler; planner thinking on, temperature 0.85, CFG 2.0, top-k 0, top-p 0.9. Validation: WAV decodes, 25–35 s,
48 kHz, 2 channels, RMS ≥ −45 dBFS.

Protocol: one warm-up per implementation (kept locally under `evidence-artifacts/`, not registered), then three measured
runs, each a fresh process with model loading included.

| Runtime | Run | Outcome | Wall (s) | RTF | Peak VRAM dev. (GiB) | Baseline (GiB) | Peak RAM (GiB) | GPU | Artifact SHA-256 |
|---|---|---|---:|---:|---:|---:|---:|---:|---|
| audio.cpp 0.8.2-audio8-perf-hotfix | 01-56-13 | PASS | 13.51 | 0.450 | 15.37 | 2.87 | 4.55 | 98% | `1d4531e7…` |
| audio.cpp | 01-56-28 | PASS | 30.89 | 1.030 | 15.35 | 1.57 | 3.82 | 100% | `1d4531e7…` |
| audio.cpp | 01-56-59 | PASS | 13.51 | 0.451 | 15.32 | 3.68 | 3.82 | 100% | `1d4531e7…` |
| ACE-Step Python 1.5.0 | 01-59-31 | PASS | 50.28 | 1.676 | 15.52 | 1.88 | 11.62 | 98% | `a6f463ba…` |
| ACE-Step Python | 02-00-24 | PASS | 46.66 | 1.555 | 15.46 | 2.60 | 9.34 | 100% | `4773d4aa…` |
| ACE-Step Python | 02-01-13 | PASS | 32.89 | 1.096 | 15.39 | 2.20 | 11.50 | 96% | `e77e5dbd…` |

Fingerprints: audio.cpp `422deb2c8f8d200bdf7249d3ab0fd7cbca23af76b2e66a80ce33a42d67d50987`; Python
`49fd9a4172fef9579fbb2811c942730c8214e610f370b1ba77be68dec3460829` (identical within each implementation).
Full records: `data/benchmark-records.json`; raw evidence: `public/benchmark-evidence/<run id>/`.

Python phase split (runner-reported): load 18.9 / 18.3 / 18.1 s, generate 25.1 / 22.0 / 8.6 s, ~6 s interpreter start-up.
audio.cpp self-reported wall 9.43 / 26.72 / 9.39 s (process wall adds ~4 s start-up and GGUF sidecar handling).

Differences and observations are listed in `lib/audio/comparison.ts` (`ACE_STEP_AB`) and shown on `/lab/audio`. No winner
score and no audio-quality claim is made: no listening methodology was applied.

## Artifact storage

WAVs stay out of Git (`evidence-artifacts/` is ignored) and are identified in each record by SHA-256 and size with
`storage: "local_only"`. The Lab renders a player only for `storage: "public"` artifacts whose file exists under
`public/` (checked at render time and by `test:benchmarks`). `@vercel/blob` is installed but was not used: publishing
generated audio externally, or incurring storage cost, needs explicit approval. A reasonable next step, if approved, is to
publish short previews per registered run and set `publicUrl`.

## Known limitations

- VRAM is sampled device-wide with nvidia-smi (200 ms), so it includes other processes; audio.cpp and PyTorch both grow
  into available VRAM, so peaks near capacity are not minimum requirements.
- RAM is a 500 ms sample of the process tree's working set, a lower bound on the true peak.
- One fixed prompt/seed, instrumental only; no vocals, no longer durations, no quality evaluation.
- The Python planner ran on the PyTorch backend (nano-vllm unavailable on Windows without Triton); results reflect Windows.
- One audio.cpp run was 2.3× slower than the other two with no identified cause; it is kept.
- The audio.cpp server, WebUI and Arena were not exercised.

## Local 3D readiness

See the final phase report. In short: `outputMetrics` is a tagged union (`kind: 'audio'`), artifacts are generic
`{path, format, sha256, bytes, storage, publicUrl}`, validators dispatch by type and fail closed, the fingerprint already
accepts workflow hash / model-file hashes / flags / precision / attention backend, the runner dispatches by workload
category, and the Lab renders metrics through a per-kind view registry.

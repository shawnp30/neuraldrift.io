# Phase 7 continuation record

Project: `D:\neuraldrift.io-main\neuraldrift.io-main`. Local only; no push, deployment, or other worktree changes.

## State found before continuation

The directory has no Git metadata. Source/evidence snapshots were saved under `tmp/phase7-before` with `.snapshot` extensions before editing. These are review copies, not executable source files.

1. Existing work: 50 workflow downloads and detail routes, 37 saved successful executions and artifacts, compatibility API/dashboard/inspector, RTX 5080 dossier, compatibility unit tests, route validator, and a completed `.next` build. The compatibility engine still hardcoded RTX 5080/16GB and selected a single record per workflow.
2. No separate authoritative hardware-profile file or second observed hardware profile existed. GPU reference specifications in `gpuData.ts` were not discovery evidence.
3. No second GPU discovery evidence was present. Live `nvidia-smi` found one NVIDIA GeForce RTX 5080, 16,303 MiB, driver 616.56. Local ComfyUI endpoints 8188, 8191 and 8192 refused connections. No user SSH host configuration was found. No secondary address was supplied.
4. No workflows had saved secondary-GPU executions.
5. All 37 existing executions already had workflow SHA-256 values. All 37 matched the current download bytes. Two had model hashes; the other 35 did not. Existing hashes were preserved.
6. No STANDARD/OPTIMIZED classification or append-only failure history existed. Historical successes are now exposed as UNCLASSIFIED; their undocumented settings classification is not invented.
7. Existing precedence was single-GPU-specific and did not enforce current workflow hashes.
8. Compatibility tests existed, but had no multi-GPU, stale-evidence, exact-failure, or comparison-eligibility coverage and lacked a configured TypeScript test runner.
9. The exact last successful Phase 7 command cannot be reconstructed from the available logs. The pre-continuation `.next/trace` records a completed build ending around 2026-09-08 14:13:50 UTC; `tsconfig.tsbuildinfo` was newer (14:20:45 UTC), which establishes file activity, not a passing command. The supplied originating thread's saved session ends much earlier, at 02:22:38 UTC, with a successful thread-status wait followed by a usage-limit error. It does not contain the later Phase 7 implementation prompt. This continuation uses the explicit requirements in the current request, not an assumed completed prompt.

## Implemented during continuation

- Observed hardware profiles with a retained ComfyUI system snapshot; live discovery findings are separate in `tmp/phase7-hardware.json`.
- Multiple execution records per workflow, without rewriting the 37 original records or their artifacts. New records append to `data/workflow-executions.json`.
- STANDARD and OPTIMIZED settings profiles, SUCCESS and FAILURE outcomes, and INDETERMINATE for transport/timeouts without terminal evidence. A failure is an outcome, not an execution-settings profile.
- Exact workflow and submitted-prompt hashes, immutable raw history/graph/record/artifact files, optional locally measured model hashes, and current/stale/unknown evidence handling.
- A generated hash manifest for client/build views. `predev` and `prebuild` refresh only current workflow hashes, never execution hashes. The dynamic compatibility API additionally hashes the current file bytes on every request. Rebuild after changing records or workflow assets to refresh the bundled UI.
- Deterministic exact GPU precedence: current evidence only; latest record per physical profile and mode; STANDARD success, then OPTIMIZED success, then a classified failure/indeterminate attempt, then legacy evidence. Date ties use execution ID. Classified failures cannot be hidden by legacy successes. All conflicting attempts remain visible. More VRAM and cross-platform targets never become direct tests.
- Comparison eligibility requires different GPU models and matching current workflow hash, profile, submitted prompt, settings, fully hashed models, inputs, node versions, software, precision, launch settings and timing protocol. Historical records lack the required manifest and cannot be compared. No measured cross-GPU pair is currently available.
- API record history, selected evidence ID, profile metadata and comparison results; UI history tables and evidence counts; removal of invented memory/OS/audio-duration/semantic-verification defaults from the legacy adapter.
- Regression tests against the real TypeScript engine and isolated mock-server integration tests of the execution recorder. Synthetic records live only in a temporary fixture catalog, never in production data.

## Reusable execution tooling

Run commands from the project root with the installed dependencies. The test loader uses the existing TypeScript compiler and Node 24 module hooks.

```powershell
node scripts/discover-hardware.mjs http://known-comfy-host:8188
npm run evidence:hardware -- unique-testbench-id gpu-reference-slug http://known-comfy-host:8188
npm run evidence:run -- path/to/execution-config.json
npm run evidence:hashes
npm test
```

Hardware registration obtains fresh `/system_stats`, validates model/form factor/memory against the selected reference GPU, and refuses to overwrite an existing profile. Add a missing GPU reference specification only after verifying the actual model and memory variant. Registration alone creates no execution evidence.

Example STANDARD config (local endpoint must actually be running):

```json
{
  "workflowId": "04",
  "hardwareProfileId": "local-rtx-5080",
  "endpoint": "http://127.0.0.1:8192",
  "executionProfile": "STANDARD",
  "timeoutSeconds": 600,
  "modelFiles": {
    "v1-5-pruned-emaonly-fp16.safetensors": "D:/AI/ComfyUI/models/checkpoints/v1-5-pruned-emaonly-fp16.safetensors"
  }
}
```

STANDARD submits the unchanged catalog graph converted using the live node schema. OPTIMIZED additionally requires `promptFile` containing the explicit changed API prompt and `optimizationNotes`; the original baseline and changed prompt are both retained. Frontend subgraphs remain a recorded preflight blocker rather than being silently flattened or replaced. Use a dedicated, idle ComfyUI runtime exposing one CUDA device; the recorder refuses ambiguous attribution or an already busy queue. It does not launch runtimes, download models, clear someone else's queue, or interrupt an unknown running request.

Model paths must refer to the actual installed files on the execution host. Remote runs do not hash similarly named local files. Missing hashes remain null. Historical model hashes are not retroactively assigned from current files. For controlled comparisons, complete the verified manifest fields using measurements on the execution host; the runner deliberately leaves comparison eligibility unset when precision, node versions, or cache protocol are not proven.

Every attempt saves `public/workflow-executions/<id>/workflow.json`, `raw.json`, `record.json`, and downloaded artifacts before updating the execution index under an exclusive lock. If indexing is interrupted, the immutable record directory remains available for recovery. Review raw history and prompt ID before retrying a timeout: it is an unknown outcome, not an OOM or confirmed execution failure.

## Hardware access blocker and next phase

Only the RTX 5080 has been observed. The RTX 3080 laptop's address, running ComfyUI service, and authenticated access are unknown. The known local ComfyUI ports return ECONNREFUSED. WMI discovery was denied by the sandbox, but direct NVIDIA CLI discovery succeeded. The optional secondary endpoint question was asked while infrastructure work continued.

Secondary attempted workflows: **0**. New production STANDARD successes: **0**. OPTIMIZED successes: **0**. Recorded execution failures: **0**. Preserved unclassified historical successes: **37**. Workflow manifest: **50 hashes**; execution evidence: **37 current / 0 stale / 0 unknown hashes**; **13 workflows have no execution**. Cross-GPU comparison pairs: **0**.

Recommended next phase: connect and freshly register the second GPU, then run a controlled representative set (SD 1.5, SDXL, Flux, ControlNet, video, upscale, audio where dependencies exist). Run STANDARD first, preserve exact failures, and use explicit OPTIMIZED follow-ups. Collect complete model/input/node/precision/cache evidence on both hosts before publishing timing comparisons.

## Validation records

See `tmp/phase7-validation.log`, `tmp/phase7-route-validation.json`, and `tmp/phase7-hardware.json`. Required type-check, lint, build, existing compatibility tests, new multi-GPU tests and isolated recorder tests were run. Route validation covers all requested endpoints (the parameterless compatibility API correctly returns 400), all 50 detail pages, all 50 JSON downloads with exact SHA-256 checks, and all 37 saved artifact/record pairs. The existing Phase 4 integrity audit also checks all 37 artifacts and all 50 provenance records.

The build needed local child-process permission after the sandbox returned `spawn EPERM`; the permitted retry passed. No permission to push or deploy was requested or used. The cross-thread messaging tool is not available in this session, so the final result could not be sent to originating thread `01a07eb4-bde1-7c13-bbd8-3970aa6c5799`.

Final validation: type-check (also after build), lint, production build, compatibility tests, multi-GPU tests and recorder integration tests all passed. The final production server passed 185 route/content checks, with 50/50 detail routes, 50/50 hash-identical downloads, 37/37 artifact/record pairs and expected API/404 responses. Browser inspection confirmed the final counts, GPU selection behavior and history table, with no observed browser errors. Original workflow-tests.json remains byte-identical. See `tmp/phase7-validation-summary.json` and `tmp/phase7-change-inventory.json`. Existing Browserslist data-age and optional Sharp advisories are non-blocking; dependencies were not changed.

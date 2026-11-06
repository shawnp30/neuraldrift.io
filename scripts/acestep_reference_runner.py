"""NeuralDrift ACE-Step 1.5 reference runner.

Runs text2music generations through the upstream ACE-Step Python API inside an existing
ACE-Step installation, without modifying it. Reads a JSON request, writes audio into the
requested output directory, and prints one final line: ND_RESULT_JSON {...}.

With "iterations" in the request, the models are loaded once and generation is repeated
(warm session). Each iteration start is announced as "ND_ITERATION_START <id>" so the caller
can timestamp start-up and model loading independently.

Usage: <ace-step venv python> acestep_reference_runner.py --ace-root <dir> --request <request.json>
"""

import argparse
import dataclasses
import importlib.metadata
import json
import os
import sys
import time
import traceback


def emit(payload):
    print("ND_RESULT_JSON " + json.dumps(payload), flush=True)


# Workload settings with a different name in GenerationParams.
RENAMED = {
    "route": "task_type",
    "language": "vocal_language",
    "durationSec": "duration",
    "inferenceSteps": "inference_steps",
    "guidanceScale": "guidance_scale",
}


def build_params(GenerationParams, prompt, settings):
    """Maps every workload setting onto a GenerationParams field. Unknown settings fail closed."""
    fields = {f.name for f in dataclasses.fields(GenerationParams)}
    kwargs = {"caption": prompt}
    unknown = []
    for key, value in settings.items():
        if value is None:
            continue
        name = RENAMED.get(key, key)
        if name not in fields:
            unknown.append(key)
            continue
        kwargs[name] = str(value) if name == "timesignature" else value
    if unknown:
        raise ValueError("ACE-Step GenerationParams has no field for: " + ", ".join(sorted(unknown)))
    return GenerationParams(**kwargs)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ace-root", required=True)
    parser.add_argument("--request", required=True)
    args = parser.parse_args()

    with open(args.request, "r", encoding="utf-8") as f:
        req = json.load(f)

    sys.path.insert(0, args.ace_root)
    os.chdir(args.ace_root)
    result = {"stage": "preflight", "success": False}
    try:
        import torch
        from acestep.handler import AceStepHandler
        from acestep.llm_inference import LLMHandler
        from acestep.inference import GenerationParams, GenerationConfig, generate_music

        result.update({
            "python": sys.version.split()[0],
            "torch": torch.__version__,
            "torchCuda": torch.version.cuda,
            "cudaAvailable": torch.cuda.is_available(),
            "device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
            "aceStepVersion": importlib.metadata.version("ace-step"),
            "transformers": importlib.metadata.version("transformers"),
        })
        settings = dict(req["settings"])
        settings.update(req.get("inputOptions") or {})
        params = build_params(GenerationParams, req["prompt"], settings)

        result["stage"] = "model_load"
        t0 = time.perf_counter()
        dit = AceStepHandler()
        dit_status, dit_ok = dit.initialize_service(
            project_root=args.ace_root,
            config_path=req["ditModel"],
            device="cuda",
            use_flash_attention=req.get("useFlashAttention", False),
            compile_model=False,
            offload_to_cpu=False,
            offload_dit_to_cpu=False,
        )
        if not dit_ok:
            raise RuntimeError(f"DiT initialization failed: {dit_status}")
        llm = LLMHandler()
        llm_status, llm_ok = llm.initialize(
            checkpoint_dir=os.path.join(args.ace_root, "checkpoints"),
            lm_model_path=req["lmModel"],
            backend=req["lmBackend"],
            device="cuda",
            offload_to_cpu=False,
        )
        result["ditStatus"] = str(dit_status)[:800]
        result["lmStatus"] = str(llm_status)[:800]
        if not llm_ok:
            raise RuntimeError(f"LM initialization failed: {llm_status}")
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        result["loadMs"] = (time.perf_counter() - t0) * 1000
        model_config = getattr(getattr(dit, "model", None), "config", None)
        result["attention"] = getattr(model_config, "_attn_implementation", None)
        result["ditDtype"] = str(getattr(dit, "dtype", None))
        result["lmBackend"] = getattr(llm, "llm_backend", None) or req["lmBackend"]

        result["stage"] = "execution"
        iterations = req.get("iterations") or [{"id": "single", "warmup": False}]
        config = GenerationConfig(batch_size=1, use_random_seed=False, seeds=[params.seed], audio_format="wav")
        if torch.cuda.is_available():
            torch.cuda.reset_peak_memory_stats()
        result["iterations"] = []
        for it in iterations:
            out_dir = os.path.join(req["outputDir"], it["id"]) if len(iterations) > 1 else req["outputDir"]
            os.makedirs(out_dir, exist_ok=True)
            print("ND_ITERATION_START " + it["id"], flush=True)
            t1 = time.perf_counter()
            gen = generate_music(dit, llm, dataclasses.replace(params), config, save_dir=out_dir)
            if torch.cuda.is_available():
                torch.cuda.synchronize()
            elapsed = (time.perf_counter() - t1) * 1000
            if not gen.success or not gen.audios:
                raise RuntimeError(f"generate_music failed on {it['id']}: {gen.error or gen.status_message}")
            audio = gen.audios[0]
            audio_params = audio.get("params") or {}
            codes = audio_params.get("audio_codes") or ""
            codes_path = None
            if codes:
                codes_path = os.path.join(out_dir, "audio_codes.txt")
                with open(codes_path, "w", encoding="utf-8") as f:
                    f.write(str(codes))
            time_costs = (gen.extra_outputs or {}).get("time_costs") or {}
            result["iterations"].append({
                "id": it["id"],
                "warmup": bool(it.get("warmup")),
                "generateMs": elapsed,
                "outputPath": audio.get("path"),
                "usedSeed": audio_params.get("seed"),
                "audioCodesPath": codes_path,
                "timeCosts": {k: float(v) for k, v in time_costs.items() if isinstance(v, (int, float))},
                "lmMetadata": (gen.extra_outputs or {}).get("lm_metadata"),
            })
        if torch.cuda.is_available():
            result["torchPeakAllocatedBytes"] = torch.cuda.max_memory_allocated()
            result["torchPeakReservedBytes"] = torch.cuda.max_memory_reserved()
        first = result["iterations"][0]
        result["generateMs"] = first["generateMs"]
        result["outputPath"] = first["outputPath"]
        result["usedSeed"] = first["usedSeed"]
        result["success"] = True
    except Exception as exc:  # Reported as structured failure evidence by the adapter
        result["errorType"] = type(exc).__name__
        result["error"] = str(exc)[:2000]
        result["traceback"] = traceback.format_exc()[-4000:]
    emit(result)


if __name__ == "__main__":
    main()

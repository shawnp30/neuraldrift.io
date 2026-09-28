"""NeuralDrift ACE-Step 1.5 reference runner.

Runs one text2music generation through the upstream ACE-Step Python API inside an existing
ACE-Step installation, without modifying it. Reads a JSON request, writes the audio into the
requested output directory, and prints one line: ND_RESULT_JSON {...}.

Usage: <ace-step venv python> acestep_reference_runner.py --ace-root <dir> --request <request.json>
"""

import argparse
import importlib.metadata
import json
import os
import sys
import time
import traceback


def emit(payload):
    print("ND_RESULT_JSON " + json.dumps(payload), flush=True)


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
        s = req["settings"]
        params = GenerationParams(
            task_type=s["route"],
            caption=req["prompt"],
            lyrics=s.get("lyrics", ""),
            vocal_language=s.get("language", "unknown"),
            bpm=s.get("bpm"),
            keyscale=s.get("keyscale", ""),
            timesignature=str(s.get("timesignature", "")),
            duration=s["durationSec"],
            inference_steps=s["inferenceSteps"],
            seed=s["seed"],
            guidance_scale=s["guidanceScale"],
            shift=s["shift"],
            infer_method=s["infer_method"],
            thinking=s["thinking"],
            lm_temperature=s["lm_temperature"],
            lm_cfg_scale=s["lm_cfg_scale"],
            lm_top_k=s["lm_top_k"],
            lm_top_p=s["lm_top_p"],
        )
        config = GenerationConfig(batch_size=1, use_random_seed=False, seeds=[s["seed"]], audio_format="wav")
        if torch.cuda.is_available():
            torch.cuda.reset_peak_memory_stats()
        t1 = time.perf_counter()
        gen = generate_music(dit, llm, params, config, save_dir=req["outputDir"])
        if torch.cuda.is_available():
            torch.cuda.synchronize()
            result["torchPeakAllocatedBytes"] = torch.cuda.max_memory_allocated()
            result["torchPeakReservedBytes"] = torch.cuda.max_memory_reserved()
        result["generateMs"] = (time.perf_counter() - t1) * 1000
        if not gen.success or not gen.audios:
            raise RuntimeError(f"generate_music failed: {gen.error or gen.status_message}")
        audio = gen.audios[0]
        result["outputPath"] = audio.get("path")
        result["usedSeed"] = (audio.get("params") or {}).get("seed")
        result["success"] = True
    except Exception as exc:  # Reported as structured failure evidence by the adapter
        result["errorType"] = type(exc).__name__
        result["error"] = str(exc)[:2000]
        result["traceback"] = traceback.format_exc()[-4000:]
    emit(result)


if __name__ == "__main__":
    main()

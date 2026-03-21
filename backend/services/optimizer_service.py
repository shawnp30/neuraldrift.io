"""
NeuralHub Optimizer Engine
Selects the best performance profile and applies hardware-aware adjustments.
Every change is documented with a reason — no silent modifications.
"""

from typing import Optional


def classify_hardware(hardware: dict) -> dict:
    """Classify hardware into a normalized capability tier."""
    vram = hardware.get("vram_gb", 0)
    ram = hardware.get("ram_gb", 0)

    if vram >= 24:
        vram_tier = "ultra"
    elif vram >= 16:
        vram_tier = "high"
    elif vram >= 12:
        vram_tier = "mid"
    elif vram >= 8:
        vram_tier = "entry"
    else:
        vram_tier = "low"

    ram_tier = "high" if ram >= 64 else ("mid" if ram >= 32 else "low")

    # Determine GPU tier from name if provided
    gpu_name = hardware.get("gpu_name", "").lower()
    gpu_tier_overrides = {
        "5090": "ultra", "4090": "ultra", "3090": "ultra",
        "5080": "high",  "4080": "high",  "3080": "high",
        "5070": "mid",   "4070": "mid",   "3070": "mid",
        "5060": "entry", "4060": "entry", "3060": "entry",
        "1660": "entry", "1650": "low",
    }
    gpu_tier = "mid"
    for key, tier in gpu_tier_overrides.items():
        if key in gpu_name:
            gpu_tier = tier
            break
    # Fall back to VRAM tier if GPU name not recognized
    if gpu_tier == "mid" and not any(k in gpu_name for k in gpu_tier_overrides):
        gpu_tier = vram_tier

    return {
        "vram_gb": vram,
        "vram_tier": vram_tier,
        "ram_gb": ram,
        "ram_tier": ram_tier,
        "gpu_tier": gpu_tier,
        "gpu_name": hardware.get("gpu_name", "Unknown GPU"),
    }


def select_profile(workflow: dict, hw: dict, priority: str) -> str:
    """Select the best base profile given hardware and user priority."""
    req = workflow["hardware_requirements"]
    vram = hw["vram_gb"]
    rec_vram = req["recommended_vram_gb"]
    min_vram = req["min_vram_gb"]

    if vram < min_vram:
        return "safe"

    if priority == "quality":
        # Quality always tries for best possible — balanced even at min threshold
        if vram >= rec_vram:
            return "max_quality"
        else:
            return "balanced"
    elif priority == "speed":
        if vram >= rec_vram:
            return "balanced"
        elif vram >= min_vram + 2:
            return "balanced"
        else:
            return "safe"
    elif priority == "reliability":
        # Reliability always picks safe unless well above recommended
        if vram >= rec_vram + 6:
            return "balanced"
        else:
            return "safe"
    else:  # balanced (default)
        if vram >= rec_vram:
            return "balanced"
        elif vram > min_vram:
            return "balanced"
        else:
            return "safe"


def apply_rules(workflow: dict, settings: dict, hw: dict) -> tuple[dict, list]:
    """
    Apply hardware-aware optimizer rules to the selected profile settings.
    Returns (modified_settings, list_of_changes).
    """
    changes = []
    rules = workflow.get("optimizer_rules", [])
    req = workflow["hardware_requirements"]
    vram = hw["vram_gb"]
    rec_vram = req["recommended_vram_gb"]
    min_vram = req["min_vram_gb"]

    for rule in rules:

        # VAE rules
        if rule == "enable_tiled_vae_under_16gb":
            if vram < 16 and settings.get("vae_mode") != "tiled":
                changes.append({
                    "field": "vae_mode",
                    "from": settings.get("vae_mode", "standard"),
                    "to": "tiled",
                    "reason": f"Tiled VAE reduces peak VRAM by ~2GB during decode (your GPU: {vram}GB)"
                })
                settings["vae_mode"] = "tiled"

        # Frame rules (video only)
        if rule == "reduce_frames_on_12gb" and settings.get("frames"):
            if vram <= 12 and settings["frames"] > 49:
                old = settings["frames"]
                settings["frames"] = 49
                changes.append({
                    "field": "frames",
                    "from": old,
                    "to": 49,
                    "reason": f"Capped at 49 frames for {vram}GB VRAM — reduces memory pressure during decode"
                })

        if rule == "cap_frames_under_8gb" and settings.get("frames"):
            if vram <= 8 and settings["frames"] > 24:
                old = settings["frames"]
                settings["frames"] = 24
                changes.append({
                    "field": "frames",
                    "from": old,
                    "to": 24,
                    "reason": f"Reduced to 24 frames for {vram}GB VRAM — minimum safe video length"
                })

        # Resolution rules
        if rule == "downshift_resolution_if_vram_below_recommended":
            if vram < rec_vram and settings.get("resolution"):
                res = settings["resolution"]
                res_map = {
                    "1024x1024": "768x768",
                    "768x1024": "512x768",
                    "1024x576": "832x480",
                    "832x480": "640x384",
                }
                if res in res_map:
                    new_res = res_map[res]
                    changes.append({
                        "field": "resolution",
                        "from": res,
                        "to": new_res,
                        "reason": f"Downshifted resolution — your {vram}GB VRAM is below {rec_vram}GB recommended"
                    })
                    settings["resolution"] = new_res

        if rule == "downshift_resolution_under_12gb":
            if vram < 12 and settings.get("resolution"):
                res = settings["resolution"]
                if res in ["1024x1024", "1024x576"]:
                    new_res = "768x768" if "1024x1024" in res else "832x480"
                    changes.append({
                        "field": "resolution",
                        "from": res,
                        "to": new_res,
                        "reason": f"Reduced resolution for {vram}GB VRAM stability"
                    })
                    settings["resolution"] = new_res

        if rule == "downshift_resolution_under_6gb":
            if vram < 6 and settings.get("resolution"):
                changes.append({
                    "field": "resolution",
                    "from": settings["resolution"],
                    "to": "512x512",
                    "reason": f"Minimum safe resolution for {vram}GB VRAM"
                })
                settings["resolution"] = "512x512"

        # Batch size rules
        if rule == "force_batch_1_near_threshold":
            if vram < rec_vram and settings.get("batch_size", 1) > 1:
                old = settings["batch_size"]
                settings["batch_size"] = 1
                changes.append({
                    "field": "batch_size",
                    "from": old,
                    "to": 1,
                    "reason": f"Reduced batch to 1 — {vram}GB VRAM needs headroom for single image decode"
                })

        if rule == "reduce_batch_size_under_8gb":
            if vram < 8 and settings.get("batch_size", 1) > 1:
                old = settings["batch_size"]
                settings["batch_size"] = 1
                changes.append({
                    "field": "batch_size",
                    "from": old,
                    "to": 1,
                    "reason": f"Batch size forced to 1 for {vram}GB VRAM"
                })

        # Precision rules
        if rule == "force_fp8_under_16gb":
            if vram < 16 and settings.get("precision") == "fp16":
                changes.append({
                    "field": "precision",
                    "from": "fp16",
                    "to": "fp8",
                    "reason": f"FP8 saves ~4GB VRAM vs FP16 — recommended for {vram}GB cards"
                })
                settings["precision"] = "fp8"

        # Training rules
        if rule == "enable_gradient_checkpointing_always":
            if not settings.get("gradient_checkpointing"):
                settings["gradient_checkpointing"] = True
                changes.append({
                    "field": "gradient_checkpointing",
                    "from": False,
                    "to": True,
                    "reason": "Always enabled for training — reduces VRAM by ~30% with minor speed cost"
                })

        if rule == "force_batch_1_under_16gb":
            if vram < 16 and settings.get("batch_size", 1) > 1:
                old = settings["batch_size"]
                settings["batch_size"] = 1
                changes.append({
                    "field": "batch_size",
                    "from": old,
                    "to": 1,
                    "reason": f"Training batch size forced to 1 for {vram}GB VRAM"
                })

        if rule == "lower_learning_rate_under_14gb":
            if vram < 14 and "learning_rate" in settings:
                lr = settings["learning_rate"]
                if lr == "1e-4":
                    settings["learning_rate"] = "5e-5"
                    changes.append({
                        "field": "learning_rate",
                        "from": lr,
                        "to": "5e-5",
                        "reason": "Lower LR for stability on smaller VRAM — reduces risk of NaN loss"
                    })

    return settings, changes


def optimize_workflow(workflow: dict, hardware: dict, priority: str = "balanced") -> dict:
    """
    Main optimizer entry point.

    Args:
        workflow: workflow definition
        hardware: user hardware profile
        priority: "quality" | "speed" | "reliability" | "balanced"

    Returns:
        Full optimization result with selected profile, settings, and change log
    """
    hw = classify_hardware(hardware)
    req = workflow["hardware_requirements"]

    # Check if it can run at all
    can_run = hw["vram_gb"] >= req["min_vram_gb"]

    # Select base profile
    selected_profile = select_profile(workflow, hw, priority)

    # Get base settings for that profile
    profiles = workflow.get("performance_profiles", {})
    if selected_profile not in profiles:
        selected_profile = list(profiles.keys())[0]

    settings = dict(profiles[selected_profile])

    # Apply optimizer rules
    settings, changes = apply_rules(workflow, settings, hw)

    # Build fix suggestions
    fix_suggestions = []
    if hw["vram_gb"] < req["recommended_vram_gb"]:
        fix_suggestions.append(f"Close all other GPU apps before running — you need every MB")
    if hw["vram_gb"] <= req["min_vram_gb"]:
        fix_suggestions.append("Use --lowvram flag when launching ComfyUI")
    if hw["ram_gb"] < req["min_ram_gb"]:
        fix_suggestions.append("Increase Windows pagefile / virtual memory to compensate for low RAM")
    if settings.get("frames") and settings["frames"] <= 49:
        fix_suggestions.append("If generation still fails, reduce frames to 25 as a last resort")

    # Expected behavior
    vram_headroom = hw["vram_gb"] - req["min_vram_gb"]
    if vram_headroom >= 6:
        risk_level = "low"
        expected_behavior = "Should run smoothly with these settings"
    elif vram_headroom >= 2:
        risk_level = "medium"
        expected_behavior = "Should run — watch for VRAM spikes during decode"
    elif vram_headroom >= 0:
        risk_level = "high"
        expected_behavior = "Will run but tight — close all other apps first"
    else:
        risk_level = "critical"
        expected_behavior = "May crash — hardware below minimum requirements"

    return {
        "workflow_id": workflow["id"],
        "hardware_profile": {
            "gpu": hw["gpu_name"],
            "vram_gb": hw["vram_gb"],
            "tier": hw["gpu_tier"],
        },
        "selected_profile": selected_profile,
        "priority": priority,
        "can_run": can_run,
        "recommended_settings": settings,
        "applied_adjustments": changes,
        "fix_suggestions": fix_suggestions,
        "expected_behavior": {
            "should_run": can_run,
            "risk_level": risk_level,
            "description": expected_behavior,
        },
        "launch_flags": workflow.get("launch_flags", {}).get(
            "recommended" if vram_headroom >= 2 else "low_vram",
            "--gpu-only"
        ),
    }

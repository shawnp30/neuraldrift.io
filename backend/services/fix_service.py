"""
neuraldrift.io Fix-My-PC Engine
Diagnoses why a workflow won't run and produces exact, actionable fixes.
Never says "not supported" — always gives a path forward.
"""

from .optimizer_service import classify_hardware, optimize_workflow


FIX_STATUS = {
    "no_changes_needed":      "Works perfectly on your hardware",
    "settings_fix_possible":  "Works after settings adjustments",
    "workflow_downgrade":     "A lighter version of this workflow will run",
    "hardware_limitation":    "Hardware upgrade needed for full quality",
    "cannot_run":             "Below minimum requirements — significant changes needed",
}


def diagnose(workflow: dict, hardware: dict) -> dict:
    """
    Diagnose the gap between workflow requirements and user hardware.
    Returns structured diagnosis with severity and specific issues.
    """
    hw = classify_hardware(hardware)
    req = workflow["hardware_requirements"]
    issues = []

    vram_gap = req["min_vram_gb"] - hw["vram_gb"]
    rec_vram_gap = req["recommended_vram_gb"] - hw["vram_gb"]
    ram_gap = req["min_ram_gb"] - hw["ram_gb"]

    if vram_gap > 0:
        issues.append({
            "field": "vram",
            "severity": "critical",
            "message": f"VRAM is {vram_gap}GB short of minimum ({hw['vram_gb']}GB vs {req['min_vram_gb']}GB min)",
            "impact": "Will likely cause OOM crash during generation"
        })
    elif rec_vram_gap > 0:
        issues.append({
            "field": "vram",
            "severity": "warning",
            "message": f"VRAM below recommended ({hw['vram_gb']}GB vs {req['recommended_vram_gb']}GB rec)",
            "impact": "Reduced quality or slower generation — fixable with settings"
        })

    if ram_gap > 0:
        issues.append({
            "field": "ram",
            "severity": "warning",
            "message": f"RAM below minimum ({hw['ram_gb']}GB vs {req['min_ram_gb']}GB min)",
            "impact": "Model loading and caching will be slow"
        })

    total_model_gb = sum(
        m.get("size_gb", 0)
        for m in workflow["dependencies"]["models"]
        if m.get("required")
    )
    storage = hardware.get("storage_free_gb", 999)
    if storage < total_model_gb:
        issues.append({
            "field": "storage",
            "severity": "critical",
            "message": f"Not enough free storage ({storage:.0f}GB free vs {total_model_gb:.0f}GB needed)",
            "impact": "Cannot download required models"
        })

    return {
        "can_run": vram_gap <= 0 and ram_gap <= 0,
        "issues": issues,
        "critical_count": sum(1 for i in issues if i["severity"] == "critical"),
        "warning_count": sum(1 for i in issues if i["severity"] == "warning"),
        "vram_gap": vram_gap,
        "rec_vram_gap": rec_vram_gap,
    }


def build_fix_actions(workflow: dict, hardware: dict, diagnosis: dict) -> list:
    """Build a list of concrete fix actions, ordered by impact."""
    actions = []
    hw = classify_hardware(hardware)
    req = workflow["hardware_requirements"]

    # Settings fixes (always try these first)
    if diagnosis["vram_gap"] <= 0:  # Can technically run

        if hw["vram_gb"] < req["recommended_vram_gb"]:
            actions.append({
                "type": "setting_change",
                "priority": 1,
                "label": "Enable Tiled VAE",
                "detail": "Reduces peak VRAM by ~2GB during image decode — set vae_mode: tiled",
                "impact": "High"
            })

        if workflow.get("task") in ["text_to_video", "img_to_video"]:
            actions.append({
                "type": "setting_change",
                "priority": 2,
                "label": "Reduce frame count",
                "detail": f"Lower frames from {workflow['performance_profiles'].get('max_quality', {}).get('frames', 97)} to 49 or less",
                "impact": "High"
            })

        if hw["vram_gb"] < req["recommended_vram_gb"]:
            actions.append({
                "type": "setting_change",
                "priority": 3,
                "label": "Use Safe profile instead of Max Quality",
                "detail": "Safe profile uses lower resolution and fewer frames — much more stable",
                "impact": "High"
            })

        actions.append({
            "type": "launch_flag",
            "priority": 4,
            "label": "Add --lowvram launch flag",
            "detail": "Tells ComfyUI to aggressively offload tensors to system RAM — slower but more stable",
            "impact": "Medium"
        })

        actions.append({
            "type": "system_change",
            "priority": 5,
            "label": "Close all other GPU apps",
            "detail": "Free up every MB: close browsers, Discord, games, other AI tools",
            "impact": "Medium"
        })

    # Below minimum — need model variant or hardware
    elif diagnosis["vram_gap"] <= 4:
        actions.append({
            "type": "model_variant",
            "priority": 1,
            "label": "Use GGUF quantized model variant",
            "detail": "GGUF Q4/Q5 variants use ~40% less VRAM than standard models",
            "impact": "High"
        })
        actions.append({
            "type": "setting_change",
            "priority": 2,
            "label": "Maximum aggressive settings reduction",
            "detail": "Safe profile + tiled VAE + lowest resolution + batch 1",
            "impact": "High"
        })
        actions.append({
            "type": "alternative_workflow",
            "priority": 3,
            "label": "Try a lighter workflow",
            "detail": "This workflow requires more VRAM than available — see alternatives below",
            "impact": "High"
        })

    else:
        # Significantly below minimum
        actions.append({
            "type": "hardware_upgrade",
            "priority": 1,
            "label": f"Upgrade to {req['min_vram_gb']}GB+ VRAM GPU",
            "detail": f"Your {hw['vram_gb']}GB card is {diagnosis['vram_gap']}GB short of the minimum",
            "impact": "Required"
        })
        actions.append({
            "type": "alternative_workflow",
            "priority": 2,
            "label": "Use a workflow designed for your hardware",
            "detail": "Filter workflows by your VRAM on the Workflows page",
            "impact": "High"
        })

    return sorted(actions, key=lambda x: x["priority"])


def get_upgrade_path(workflow: dict, hardware: dict) -> dict:
    """Suggest the minimum hardware upgrade to run this workflow well."""
    hw = classify_hardware(hardware)
    req = workflow["hardware_requirements"]

    if hw["vram_gb"] >= req["recommended_vram_gb"]:
        return {"needed": False}

    return {
        "needed": True,
        "current_vram_gb": hw["vram_gb"],
        "minimum_vram_gb": req["min_vram_gb"],
        "recommended_vram_gb": req["recommended_vram_gb"],
        "suggested_gpus": _suggest_gpus(req["recommended_vram_gb"]),
        "computeatlas_url": "https://computeatlas.ai/ai-hardware-estimator",
    }


def _suggest_gpus(target_vram: int) -> list:
    gpu_map = {
        8:  ["RTX 3060 8GB", "RTX 4060", "RTX 3070"],
        10: ["RTX 3080 10GB"],
        12: ["RTX 3060 12GB", "RTX 4070", "RTX 3080 Ti"],
        16: ["RTX 4080", "RTX 3080 16GB", "RTX 4080 Super", "RTX 5080"],
        24: ["RTX 4090", "RTX 3090", "RTX 3090 Ti"],
        32: ["RTX 5090"],
    }
    # Find the closest tier at or above target
    for vram_tier in sorted(gpu_map.keys()):
        if vram_tier >= target_vram:
            return gpu_map[vram_tier]
    return gpu_map[32]


def fix_my_pc(workflow: dict, hardware: dict) -> dict:
    """
    Main Fix-My-PC entry point.

    Returns:
        Full fix report with status, actions, optimized settings, upgrade path
    """
    diagnosis = diagnose(workflow, hardware)
    actions = build_fix_actions(workflow, hardware, diagnosis)
    upgrade_path = get_upgrade_path(workflow, hardware)

    # Determine status
    if not diagnosis["issues"]:
        status = "no_changes_needed"
        summary = "Your hardware runs this workflow without any changes needed."
    elif diagnosis["can_run"] and diagnosis["critical_count"] == 0:
        status = "settings_fix_possible"
        summary = f"This workflow runs on your PC with {len(actions)} setting adjustments."
    elif diagnosis["can_run"]:
        status = "settings_fix_possible"
        summary = "This workflow can run with significant settings changes — expect reduced quality."
    elif diagnosis["vram_gap"] <= 4:
        status = "workflow_downgrade"
        summary = "A GGUF/quantized variant of this workflow may work on your hardware."
    else:
        status = "hardware_limitation"
        summary = f"Your GPU needs {diagnosis['vram_gap']}GB more VRAM to run this workflow."

    # Get optimized settings even for borderline cases
    optimized = None
    if diagnosis["can_run"] or diagnosis["vram_gap"] <= 0:
        try:
            optimized = optimize_workflow(workflow, hardware, priority="reliability")
        except Exception:
            pass

    return {
        "status": status,
        "status_label": FIX_STATUS.get(status, status),
        "summary": summary,
        "can_run": diagnosis["can_run"],
        "diagnosis": {
            "issues": diagnosis["issues"],
            "critical_count": diagnosis["critical_count"],
            "warning_count": diagnosis["warning_count"],
        },
        "actions": actions,
        "optimized_settings": optimized.get("recommended_settings") if optimized else None,
        "upgrade_path": upgrade_path,
        "workflow_id": workflow["id"],
    }

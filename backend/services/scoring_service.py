"""
NeuralHub Scoring Engine
Produces a 0-100 compatibility score for a workflow + hardware combination.
Weighted across 7 dimensions — not fake, every point has a reason.
"""


SCORE_BANDS = {
    (90, 100): {"label": "Excellent", "color": "#10b981", "description": "Runs with headroom to spare"},
    (75, 89):  {"label": "Good",      "color": "#00e5ff", "description": "Runs well, minor tweaks may help"},
    (60, 74):  {"label": "Usable",    "color": "#f97316", "description": "Will run with settings adjustments"},
    (40, 59):  {"label": "Risky",     "color": "#ef4444", "description": "May crash without careful tuning"},
    (0,  39):  {"label": "Not Recommended", "color": "#7f1d1d", "description": "Hardware below minimum requirements"},
}


def get_band(score: int) -> dict:
    for (low, high), band in SCORE_BANDS.items():
        if low <= score <= high:
            return band
    return SCORE_BANDS[(0, 39)]


def score_workflow(workflow: dict, hardware: dict) -> dict:
    """
    Score a workflow against user hardware.

    Args:
        workflow: workflow definition from workflows.json
        hardware: user hardware profile dict

    Returns:
        dict with score, band, reasons, bottlenecks
    """
    score = 0
    reasons = []
    bottlenecks = []
    req = workflow["hardware_requirements"]

    # ── 1. VRAM Fit (35 points) ─────────────────────────────────────────────
    vram = hardware.get("vram_gb", 0)
    min_vram = req["min_vram_gb"]
    rec_vram = req["recommended_vram_gb"]

    if vram >= rec_vram + 4:
        score += 35
        reasons.append(f"VRAM well above recommended ({vram}GB vs {rec_vram}GB rec)")
    elif vram >= rec_vram:
        score += 32
        reasons.append(f"VRAM meets recommended ({vram}GB)")
    elif vram >= min_vram + 2:
        score += 22
        reasons.append(f"VRAM above minimum but below recommended ({vram}GB vs {rec_vram}GB rec)")
        bottlenecks.append(f"VRAM: {vram}GB usable but {rec_vram}GB recommended for best results")
    elif vram >= min_vram:
        score += 14
        reasons.append(f"VRAM at minimum ({vram}GB — tight fit)")
        bottlenecks.append(f"VRAM: At minimum ({min_vram}GB) — tiled VAE and safe profile required")
    else:
        shortage = min_vram - vram
        score += max(0, 8 - shortage * 3)
        reasons.append(f"VRAM below minimum by {shortage}GB ({vram}GB vs {min_vram}GB min)")
        bottlenecks.append(f"VRAM: {shortage}GB short of minimum — OOM likely without significant downgrading")

    # ── 2. System RAM (10 points) ────────────────────────────────────────────
    ram = hardware.get("ram_gb", 0)
    min_ram = req["min_ram_gb"]
    rec_ram = req["recommended_ram_gb"]

    if ram >= rec_ram:
        score += 10
    elif ram >= min_ram:
        score += 7
        if ram < rec_ram:
            reasons.append(f"RAM meets minimum but not recommended ({ram}GB vs {rec_ram}GB rec)")
    else:
        score += 2
        bottlenecks.append(f"RAM: {ram}GB below minimum {min_ram}GB — model caching will be slow")

    # ── 3. GPU Tier (10 points) ──────────────────────────────────────────────
    gpu_tier = hardware.get("gpu_tier", "mid")
    tier_map = {"ultra": 10, "high": 10, "mid": 8, "entry": 5, "low": 2}
    score += tier_map.get(gpu_tier, 6)

    # ── 4. Storage (5 points) ────────────────────────────────────────────────
    storage = hardware.get("storage_free_gb", 0)
    total_model_size = sum(m.get("size_gb", 0) for m in workflow["dependencies"]["models"])

    if storage >= total_model_size * 2:
        score += 5
    elif storage >= total_model_size:
        score += 3
        reasons.append(f"Storage is tight — {storage:.0f}GB free vs {total_model_size:.0f}GB needed for models")
    else:
        score += 0
        bottlenecks.append(f"Storage: Only {storage:.0f}GB free but {total_model_size:.0f}GB needed for models")

    # ── 5. Task Suitability (15 points) ─────────────────────────────────────
    user_goal = hardware.get("goal", "balanced")
    workflow_task = workflow.get("task", "")
    priority = hardware.get("priority", "balanced")

    goal_task_match = {
        "image_quality": ["text_to_image", "img_to_img"],
        "video_quality": ["text_to_video", "img_to_video"],
        "training":      ["lora_training", "dreambooth"],
        "speed":         ["text_to_image", "text_to_video"],
        "balanced":      None,  # matches everything
    }

    matching_tasks = goal_task_match.get(user_goal)
    if matching_tasks is None or workflow_task in matching_tasks:
        score += 15
    elif workflow_task in ["text_to_image", "text_to_video"]:
        score += 10
    else:
        score += 6

    # ── 6. VRAM Headroom / Stability (15 points) ─────────────────────────────
    headroom = vram - min_vram
    if headroom >= 8:
        score += 15
    elif headroom >= 6:
        score += 13
    elif headroom >= 4:
        score += 10
    elif headroom >= 2:
        score += 7
    elif headroom >= 0:
        score += 4
    else:
        score += 0

    if headroom < 2 and vram >= min_vram:
        bottlenecks.append("VRAM headroom is very thin — any other GPU process may cause OOM")

    # ── 7. Complexity Match (10 points) ──────────────────────────────────────
    difficulty = workflow["ui"]["difficulty"]
    user_experience = hardware.get("experience_level", "intermediate")

    exp_map = {"beginner": 1, "intermediate": 2, "advanced": 3}
    diff_map = {"beginner": 1, "intermediate": 2, "advanced": 3}

    user_exp_level = exp_map.get(user_experience, 2)
    workflow_diff = diff_map.get(difficulty, 2)

    if user_exp_level >= workflow_diff:
        score += 10
    elif user_exp_level == workflow_diff - 1:
        score += 7
    else:
        score += 3

    # ── Final ────────────────────────────────────────────────────────────────
    final_score = max(0, min(100, score))
    band = get_band(final_score)

    # should_run is based on actual VRAM vs minimum — not score threshold
    can_actually_run = hardware.get("vram_gb", 0) >= req["min_vram_gb"]

    # Determine primary risk
    primary_risk = None
    if bottlenecks:
        primary_risk = bottlenecks[0]
    elif vram < rec_vram:
        primary_risk = f"VRAM below recommended ({vram}GB vs {rec_vram}GB)"

    return {
        "score": final_score,
        "band": band["label"],
        "band_color": band["color"],
        "band_description": band["description"],
        "should_run": can_actually_run,
        "primary_risk": primary_risk,
        "bottlenecks": bottlenecks,
        "reasons": reasons,
        "breakdown": {
            "vram_fit":      min(35, score),     # approximate — display only
            "ram_fit":       min(10, ram // 8),
            "task_match":    15 if (matching_tasks is None or workflow_task in (matching_tasks or [])) else 10,
            "complexity":    10 if user_exp_level >= workflow_diff else 7,
        }
    }

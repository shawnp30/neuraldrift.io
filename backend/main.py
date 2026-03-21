"""
NeuralHub.ai Backend — Phase 1 API
Flask server powering the workflow intelligence system.

Routes:
  GET  /api/workflows              — list all workflows
  GET  /api/workflows/<id>         — get single workflow
  GET  /api/workflows/search       — search/filter workflows
  POST /api/score                  — score workflow vs hardware
  POST /api/optimize               — optimize workflow for hardware
  POST /api/fix-my-pc              — diagnose and fix compatibility
  POST /api/hardware/profile       — normalize hardware input

Run:
  pip install flask flask-cors
  python main.py
"""

import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from services.scoring_service import score_workflow
from services.optimizer_service import optimize_workflow, classify_hardware
from services.fix_service import fix_my_pc

app = Flask(__name__)
CORS(app)  # Allow Next.js frontend on different port

# ── Load workflow data ──────────────────────────────────────────────────────

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "workflows.json")

def load_workflows() -> list:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def find_workflow(workflow_id: str) -> dict | None:
    workflows = load_workflows()
    return next((w for w in workflows if w["id"] == workflow_id or w["slug"] == workflow_id), None)


# ── Helpers ─────────────────────────────────────────────────────────────────

def error(msg: str, code: int = 400):
    return jsonify({"error": msg}), code

def require_json():
    data = request.get_json(silent=True)
    if not data:
        return None, error("Request body must be JSON", 400)
    return data, None


# ── Workflow Catalog Routes ──────────────────────────────────────────────────

@app.get("/api/workflows")
def list_workflows_route():
    """List all workflows with optional filters."""
    workflows = load_workflows()

    # Optional filters
    category = request.args.get("category")
    task = request.args.get("task")
    difficulty = request.args.get("difficulty")
    min_vram = request.args.get("min_vram", type=int)
    max_vram = request.args.get("max_vram", type=int)
    engine = request.args.get("engine")

    if category:
        workflows = [w for w in workflows if w.get("category") == category]
    if task:
        workflows = [w for w in workflows if w.get("task") == task]
    if difficulty:
        workflows = [w for w in workflows if w.get("ui", {}).get("difficulty") == difficulty]
    if min_vram is not None:
        workflows = [w for w in workflows if w["hardware_requirements"]["min_vram_gb"] >= min_vram]
    if max_vram is not None:
        workflows = [w for w in workflows if w["hardware_requirements"]["min_vram_gb"] <= max_vram]
    if engine:
        workflows = [w for w in workflows if w.get("engine") == engine]

    # Return card-level data only (not full profiles)
    cards = []
    for w in workflows:
        cards.append({
            "id": w["id"],
            "slug": w["slug"],
            "title": w["title"],
            "description": w["description"],
            "category": w["category"],
            "task": w["task"],
            "engine": w["engine"],
            "tags": w["tags"],
            "difficulty": w["ui"]["difficulty"],
            "min_vram_gb": w["hardware_requirements"]["min_vram_gb"],
            "recommended_vram_gb": w["hardware_requirements"]["recommended_vram_gb"],
            "thumbnail": w["ui"].get("thumbnail"),
            "status": w["status"],
        })

    return jsonify({"workflows": cards, "count": len(cards)})


@app.get("/api/workflows/search")
def search_workflows():
    """Search workflows by query string."""
    query = request.args.get("q", "").lower()
    if not query:
        return list_workflows_route()

    workflows = load_workflows()
    results = []
    for w in workflows:
        searchable = " ".join([
            w.get("title", ""),
            w.get("description", ""),
            w.get("category", ""),
            w.get("task", ""),
            " ".join(w.get("tags", [])),
        ]).lower()

        if query in searchable:
            results.append({
                "id": w["id"],
                "title": w["title"],
                "category": w["category"],
                "difficulty": w["ui"]["difficulty"],
                "min_vram_gb": w["hardware_requirements"]["min_vram_gb"],
            })

    return jsonify({"results": results, "count": len(results), "query": query})


@app.get("/api/workflows/<workflow_id>")
def get_workflow_route(workflow_id: str):
    """Get full workflow definition by ID or slug."""
    workflow = find_workflow(workflow_id)
    if not workflow:
        return error(f"Workflow '{workflow_id}' not found", 404)
    return jsonify(workflow)


# ── Hardware Profile Route ───────────────────────────────────────────────────

@app.post("/api/hardware/profile")
def hardware_profile():
    """
    Normalize raw hardware input into a classified profile.

    Body: { gpu_name, vram_gb, ram_gb, storage_free_gb?, os? }
    """
    data, err = require_json()
    if err:
        return err

    if "vram_gb" not in data:
        return error("vram_gb is required")

    profile = classify_hardware(data)
    return jsonify({"profile": profile})


# ── Scoring Route ────────────────────────────────────────────────────────────

@app.post("/api/score")
def score_route():
    """
    Score a workflow against hardware.

    Body: {
      workflow_id: str,
      hardware: { vram_gb, ram_gb, gpu_name?, gpu_tier?, goal?, experience_level?, storage_free_gb? }
    }
    """
    data, err = require_json()
    if err:
        return err

    workflow_id = data.get("workflow_id")
    hardware = data.get("hardware", {})

    if not workflow_id:
        return error("workflow_id is required")
    if not hardware.get("vram_gb"):
        return error("hardware.vram_gb is required")

    workflow = find_workflow(workflow_id)
    if not workflow:
        return error(f"Workflow '{workflow_id}' not found", 404)

    result = score_workflow(workflow, hardware)
    return jsonify({
        "workflow_id": workflow_id,
        "workflow_title": workflow["title"],
        **result
    })


# ── Optimizer Route ──────────────────────────────────────────────────────────

@app.post("/api/optimize")
def optimize_route():
    """
    Optimize a workflow for specific hardware.

    Body: {
      workflow_id: str,
      hardware: { vram_gb, ram_gb, gpu_name?, ... },
      priority?: "quality" | "speed" | "reliability" | "balanced"
    }
    """
    data, err = require_json()
    if err:
        return err

    workflow_id = data.get("workflow_id")
    hardware = data.get("hardware", {})
    priority = data.get("priority", "balanced")

    if not workflow_id:
        return error("workflow_id is required")
    if not hardware.get("vram_gb"):
        return error("hardware.vram_gb is required")
    if priority not in ("quality", "speed", "reliability", "balanced"):
        return error("priority must be: quality | speed | reliability | balanced")

    workflow = find_workflow(workflow_id)
    if not workflow:
        return error(f"Workflow '{workflow_id}' not found", 404)

    result = optimize_workflow(workflow, hardware, priority)
    return jsonify(result)


# ── Fix-My-PC Route ──────────────────────────────────────────────────────────

@app.post("/api/fix-my-pc")
def fix_my_pc_route():
    """
    Diagnose and fix compatibility between workflow and hardware.
    Never returns "not supported" — always returns a path forward.

    Body: {
      workflow_id: str,
      hardware: { vram_gb, ram_gb, gpu_name?, storage_free_gb? }
    }
    """
    data, err = require_json()
    if err:
        return err

    workflow_id = data.get("workflow_id")
    hardware = data.get("hardware", {})

    if not workflow_id:
        return error("workflow_id is required")
    if not hardware.get("vram_gb"):
        return error("hardware.vram_gb is required")

    workflow = find_workflow(workflow_id)
    if not workflow:
        return error(f"Workflow '{workflow_id}' not found", 404)

    result = fix_my_pc(workflow, hardware)
    return jsonify(result)


# ── Batch Score Route (convenience) ─────────────────────────────────────────

@app.post("/api/score/batch")
def score_batch_route():
    """
    Score all workflows against hardware at once.
    Useful for populating the workflow catalog with compatibility scores.

    Body: { hardware: { vram_gb, ram_gb, ... } }
    """
    data, err = require_json()
    if err:
        return err

    hardware = data.get("hardware", {})
    if not hardware.get("vram_gb"):
        return error("hardware.vram_gb is required")

    workflows = load_workflows()
    results = []
    for workflow in workflows:
        score_result = score_workflow(workflow, hardware)
        results.append({
            "workflow_id": workflow["id"],
            "title": workflow["title"],
            "score": score_result["score"],
            "band": score_result["band"],
            "band_color": score_result["band_color"],
            "should_run": score_result["should_run"],
            "primary_risk": score_result.get("primary_risk"),
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return jsonify({
        "hardware": classify_hardware(hardware),
        "scores": results,
        "count": len(results)
    })


# ── Health check ─────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    workflows = load_workflows()
    return jsonify({
        "status": "ok",
        "version": "1.0.0",
        "workflow_count": len(workflows),
    })


# ── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0")

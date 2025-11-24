import json
import os
import time
from typing import Dict, Any, List

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_FILE = os.path.join(DATA_DIR, "db.json")

def _load_db() -> Dict[str, Any]:
    if not os.path.exists(DB_FILE):
        return {"projects": {}}
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {"projects": {}}

def _save_db(data: Dict[str, Any]):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

def save_scene(project_id: str, scene_data: Dict[str, Any]) -> str:
    """Saves a new scene and returns its ID."""
    db = _load_db()
    
    if project_id not in db["projects"]:
        db["projects"][project_id] = {"scenes": {}}
        
    # Generate ID
    scene_id = f"scene_{int(time.time())}"
    scene_data["id"] = scene_id
    scene_data["createdAt"] = time.time()
    
    db["projects"][project_id]["scenes"][scene_id] = scene_data
    _save_db(db)
    
    return scene_id

def update_scene(project_id: str, scene_id: str, updates: Dict[str, Any]):
    """Updates an existing scene."""
    db = _load_db()
    if project_id in db["projects"] and scene_id in db["projects"][project_id]["scenes"]:
        db["projects"][project_id]["scenes"][scene_id].update(updates)
        _save_db(db)
    else:
        print(f"Warning: Scene {scene_id} in project {project_id} not found.")

def get_scene(project_id: str, scene_id: str) -> Dict[str, Any]:
    """Retrieves a scene."""
    db = _load_db()
    return db.get("projects", {}).get(project_id, {}).get("scenes", {}).get(scene_id)

def get_project_bible(project_id: str) -> Dict[str, Any]:
    """Mock production bible."""
    # In a real app, this would be loaded from DB.
    return {
        "genre": "Sci-Fi",
        "tone": "Dark, Cinematic",
        "characters": ["Neo", "Trinity"]
    }

def get_latest_scene(project_id: str) -> Dict[str, Any]:
    """Gets the most recently created scene."""
    db = _load_db()
    scenes = db.get("projects", {}).get(project_id, {}).get("scenes", {})
    if not scenes:
        return None
        
    # Sort by createdAt
    sorted_scenes = sorted(scenes.values(), key=lambda x: x.get("createdAt", 0), reverse=True)
    return sorted_scenes[0]

def get_project(project_id: str) -> Dict[str, Any]:
    """Retrieves all scenes for a project."""
    db = _load_db()
    return db.get("projects", {}).get(project_id, {})

def list_projects() -> List[str]:
    """Returns a list of all project IDs."""
    db = _load_db()
    return list(db.get("projects", {}).keys())

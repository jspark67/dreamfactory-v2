from pydantic import BaseModel, Field
from utils.local_db import save_scene, get_project_bible

# 1. Output Data Structure Definition
class SceneScript(BaseModel):
    sequence_number: int = Field(..., description="Scene number")
    script: str = Field(..., description="Full script including dialogue and stage directions")
    visual_prompt: str = Field(..., description="Specific English prompt for image generation")
    rationale: str = Field(..., description="Reasoning and intention behind this direction")
    characters_involved: list[str] = Field(..., description="List of character names in this scene")

# 2. Script Saving Tool
def save_scene_script(project_id: str, scene_data: dict) -> str:
    """
    Saves the written scene data to Local DB.
    """
    print(f"✍️ Writer: Saving scene {scene_data.get('sequence_number')}...")
    
    # Add status
    scene_data["status"] = "draft"
    
    scene_id = save_scene(project_id, scene_data)
    
    return f"Scene {scene_data['sequence_number']} saved successfully with ID {scene_id}."

# 3. Context Retrieval Tool
def get_production_bible_tool(project_id: str) -> dict:
    """
    Retrieves the project's world setting.
    """
    return get_project_bible(project_id)

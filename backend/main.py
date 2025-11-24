from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
# Load environment variables from .env file
load_dotenv()

import logging
logging.basicConfig(level=logging.INFO)

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents import orchestrator
from tools.delegation_tools import delegate_to_writer, delegate_to_artist, delegate_to_director

try:
    from api.routes import router as api_router
    has_api_router = True
except ImportError:
    has_api_router = False

app = FastAPI()

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files (UI & Media)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

if has_api_router:
    app.include_router(api_router, prefix="/api")

class PipelineRequest(BaseModel):
    project_id: str
    topic: str

@app.post("/api/generate/full-scene")
async def generate_full_scene(request: PipelineRequest, background_tasks: BackgroundTasks):
    """
    Triggers the full Writer -> Artist -> Director pipeline using ADK.
    """
    background_tasks.add_task(
        orchestrator.run_adk_pipeline, 
        request.project_id, 
        request.topic
    )

    return {
        "status": "started",
        "message": "The AI production team has started working (ADK).",
        "project_id": request.project_id
    }

@app.get("/api/project/{project_id}")
async def get_project_status(project_id: str):
    """
    Returns the current status of the project (scenes, images, videos).
    """
    from utils.local_db import get_project
    project_data = get_project(project_id)
    if not project_data:
        return {"error": "Project not found", "scenes": {}}
    return project_data

@app.get("/api/scene/{scene_id}")
async def get_scene_details(scene_id: str, project_id: str):
    """
    Returns the details of a specific scene.
    """
    from utils.local_db import get_scene
    scene_data = get_scene(project_id, scene_id)
    if not scene_data:
        return {"error": "Scene not found"}
    return scene_data

class UpdateSceneRequest(BaseModel):
    project_id: str
    script: str = None
    visual_prompt: str = None
    motion_prompt: str = None
    videoUrl: str = None

@app.post("/api/scene/{scene_id}/update")
async def update_scene_details(scene_id: str, request: UpdateSceneRequest):
    """
    Updates the script and visual prompt of a scene.
    """
    from utils.local_db import update_scene
    
    updates = {}
    if request.script is not None:
        updates["script"] = request.script
    if request.visual_prompt is not None:
        updates["visual_prompt"] = request.visual_prompt
    if request.motion_prompt is not None:
        updates["motion_prompt"] = request.motion_prompt
    if request.videoUrl is not None:
        updates["videoUrl"] = request.videoUrl
        
    if not updates:
        return {"message": "No updates provided"}
        
    update_scene(request.project_id, scene_id, updates)
    return {"message": "Scene updated successfully", "updates": updates}

@app.get("/api/projects")
async def list_all_projects():
    """
    Returns a list of all project IDs.
    """
    from utils.local_db import list_projects
    project_ids = list_projects()
    return {"projects": project_ids}

# --- Step-by-Step Endpoints ---

class StepRequest(BaseModel):
    project_id: str
    input_text: str = ""  # optional, default empty
    prompt: str = ""      # optional video prompt
    scene_id: str = None
    image_url: str = None

@app.post("/api/step/writer")
async def step_writer(request: StepRequest):
    try:
        result = await delegate_to_writer(request.input_text, request.project_id)
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}

class SelectImageRequest(BaseModel):
    project_id: str
    image_path: str # The local temp path returned by the agent

@app.post("/api/scene/{scene_id}/image/select")
async def select_scene_image(scene_id: str, request: SelectImageRequest):
    """
    Finalizes the scene image selection.
    Moves the selected temp image to the project folder and updates the DB.
    """
    from utils.local_db import update_scene
    from utils.local_file_store import save_media
    import shutil
    
    try:
        # Verify temp file exists
        if not os.path.exists(request.image_path):
            return {"error": f"Image file not found: {request.image_path}"}
            
        # Save to project folder (move/copy)
        # We use save_media which copies the file
        filename = f"{scene_id}.png"
        public_url = save_media(request.image_path, filename, request.project_id)
        
        # Update DB
        update_scene(request.project_id, scene_id, {
            "status": "image_selected",
            "imageUrl": public_url
        })
        
        return {"message": "Image selected successfully", "imageUrl": public_url}
        
    except Exception as e:
        return {"error": str(e)}

class GenerateMotionPromptRequest(BaseModel):
    project_id: str
    scene_id: str

@app.post("/api/scene/{scene_id}/motion-prompt")
async def generate_motion_prompt_endpoint(scene_id: str, request: GenerateMotionPromptRequest):
    """
    Generates a motion prompt based on the scene's script and image.
    """
    from utils.local_db import get_scene, update_scene
    from google import genai
    import os
    
    # Get scene data
    scene = get_scene(request.project_id, scene_id)
    if not scene:
        return {"error": "Scene not found"}
    
    script = scene.get("script", "")
    visual_prompt = scene.get("visual_prompt", "")
    
    # Use Gemini to generate motion prompt
    try:
        client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        
        prompt_text = f"""Based on the following scene script and visual description, generate a concise motion prompt (2-3 sentences) that describes camera movements and key actions for video generation.

Script:
{script}

Visual Description:
{visual_prompt}

Generate a motion prompt that focuses on:
- Camera movements (pan, zoom, tilt, etc.)
- Key character actions
- Important visual transitions

Motion Prompt:"""
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt_text
        )
        
        motion_prompt = response.text.strip()
        
        # Save to scene
        update_scene(request.project_id, scene_id, {
            "motion_prompt": motion_prompt
        })
        
        return {"motion_prompt": motion_prompt}
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/step/artist")
async def step_artist(request: StepRequest):
    try:
        if not request.scene_id:
            return {"error": "scene_id required"}
        
        # Auto-fetch visual_prompt from DB if not provided
        visual_prompt = request.input_text
        if not visual_prompt or visual_prompt.strip() == "":
            # Extract project_id from scene data
            from utils.local_db import get_scene, _load_db
            db = _load_db()
            
            # Find the scene in any project
            scene_data = None
            project_id = request.project_id
            
            for pid, project in db.get("projects", {}).items():
                if request.scene_id in project.get("scenes", {}):
                    scene_data = project["scenes"][request.scene_id]
                    project_id = pid
                    break
            
            if scene_data and "visual_prompt" in scene_data:
                visual_prompt = scene_data["visual_prompt"]
            else:
                return {"error": f"Scene {request.scene_id} not found or has no visual_prompt"}
        
        result = await delegate_to_artist(request.scene_id, visual_prompt, request.project_id)
        return {
            "result": result,
            "visual_prompt_used": visual_prompt
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/step/director")
async def step_director(request: StepRequest):
    try:
        if not request.scene_id or not request.image_url:
            return {"error": "scene_id and image_url required"}
        # Use the explicit prompt field; fallback to input_text if prompt empty
        used_prompt = request.prompt or request.input_text
        result = await delegate_to_director(request.scene_id, request.image_url, used_prompt, request.project_id)
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
async def root():
    return {"message": "DreamFactory v2.1 Backend is running. Go to /static/index.html for testing."}

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from backend.agents.writer import WriterAgent
from backend.agents.artist import ArtistAgent
from backend.agents.director import DirectorAgent
from backend.utils.firestore_helpers import update_scene, get_project_bible, upload_to_storage
import uuid
import os

router = APIRouter()

class GenerateRequest(BaseModel):
    project_id: str
    scene_id: str = None
    agent_type: str # "writer", "artist", "director"
    input_context: dict

def run_writer_task(project_id: str, input_context: dict):
    agent = WriterAgent()
    try:
        # Fetch bible/context if needed
        # bible = get_project_bible(project_id)
        
        result = agent.generate_script(
            topic=input_context.get("topic"),
            genre=input_context.get("genre"),
            tone=input_context.get("tone")
        )
        
        # Save scenes to Firestore
        # This logic would iterate over result.scenes and create documents
        print(f"Writer task completed for project {project_id}")
        
    except Exception as e:
        print(f"Writer task failed: {e}")

def run_artist_task(project_id: str, scene_id: str, input_context: dict):
    agent = ArtistAgent()
    try:
        update_scene(project_id, scene_id, {"status": "generating_image"})
        
        image_bytes = agent.generate_image(
            prompt=input_context.get("visual_prompt")
        )
        
        # Save to file and upload
        temp_filename = f"temp_{scene_id}.png"
        with open(temp_filename, "wb") as f:
            f.write(image_bytes)
            
        public_url = upload_to_storage(temp_filename, f"projects/{project_id}/scenes/{scene_id}.png")
        os.remove(temp_filename)
        
        update_scene(project_id, scene_id, {
            "imageUrl": public_url,
            "status": "draft" # Ready for director
        })
        print(f"Artist task completed for scene {scene_id}")
        
    except Exception as e:
        print(f"Artist task failed: {e}")
        update_scene(project_id, scene_id, {"status": "error"})

def run_director_task(project_id: str, scene_id: str, input_context: dict):
    agent = DirectorAgent()
    try:
        update_scene(project_id, scene_id, {"status": "generating_video"})
        
        agent.generate_video(
            project_id=project_id,
            scene_id=scene_id,
            image_url=input_context.get("imageUrl"),
            prompt=input_context.get("visual_prompt") # Or specific video prompt
        )
        
    except Exception as e:
        print(f"Director task failed: {e}")

@router.post("/generate")
async def generate(request: GenerateRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    
    if request.agent_type == "writer":
        background_tasks.add_task(run_writer_task, request.project_id, request.input_context)
    elif request.agent_type == "artist":
        background_tasks.add_task(run_artist_task, request.project_id, request.scene_id, request.input_context)
    elif request.agent_type == "director":
        background_tasks.add_task(run_director_task, request.project_id, request.scene_id, request.input_context)
    else:
        raise HTTPException(status_code=400, detail="Invalid agent type")
        
    return {"status": "processing", "task_id": task_id}

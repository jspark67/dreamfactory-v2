import asyncio
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from agents.writer_agent import writer_agent
from agents.artist_agent import artist_agent
from agents.director_agent import director_agent
from utils.local_db import get_latest_scene

APP_NAME = "agents"

async def delegate_to_writer(topic: str, project_id: str) -> str:
    print(f"👨‍💼 Supervisor: Delegating to Writer for '{topic}'...")
    session_service = InMemorySessionService()
    runner = Runner(agent=writer_agent, app_name=APP_NAME, session_service=session_service)
    
    # Create session first
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id="system",
        session_id=project_id
    )
    
    prompt = f"Topic: {topic}. Project ID: {project_id}. Write the next scene."
    content = types.Content(role='user', parts=[types.Part(text=prompt)])
    
    final_response = ""
    async for event in runner.run_async(user_id="system", session_id=project_id, new_message=content):
        if event.is_final_response():
            final_response = event.content.parts[0].text
    
    # Get the latest scene to extract scene_id
    latest_scene = get_latest_scene(project_id)
    if latest_scene:
        scene_id = latest_scene.get('id', 'unknown')
        return f"{final_response}\nScene saved with ID {scene_id}."
    
    return final_response

async def delegate_to_artist(scene_id: str, visual_prompt: str, project_id: str) -> str:
    print(f"👨‍💼 Supervisor: Delegating to Artist for Scene {scene_id}...")
    session_service = InMemorySessionService()
    runner = Runner(agent=artist_agent, app_name=APP_NAME, session_service=session_service)
    
    # Create session first
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id="system",
        session_id=scene_id
    )
    
    prompt = f"Scene ID: {scene_id}. Visual Prompt: {visual_prompt}. Project ID: {project_id}. Generate the image."
    content = types.Content(role='user', parts=[types.Part(text=prompt)])
    
    final_response = ""
    async for event in runner.run_async(user_id="system", session_id=scene_id, new_message=content):
        if event.is_final_response():
            final_response = event.content.parts[0].text
            
    return final_response

async def delegate_to_director(scene_id: str, image_url: str, prompt: str, project_id: str, token: str = None) -> str:
    print(f"👨‍💼 Supervisor: Delegating to Director for Scene {scene_id}...")
    
    # Import DirectorAgent class directly to pass token
    from agents.director import DirectorAgent
    
    # Create director agent with optional token
    director_instance = DirectorAgent(api_key=token)
    
    # Use the DirectorAgent's generate_video method directly instead of ADK
    try:
        result = director_instance.generate_video(
            project_id=project_id,
            scene_id=scene_id,
            image_url=image_url,
            prompt=prompt
        )
        return f"Video generated successfully. Video URL: {result.get('video_url', 'N/A')}"
    except Exception as e:
        return f"Error generating video: {str(e)}"

def get_latest_scene_info(project_id: str) -> dict:
    """
    Helper tool to get the latest scene info from Local DB.
    """
    latest = get_latest_scene(project_id)
    if latest:
        return latest
    return {"error": "No scene found"}

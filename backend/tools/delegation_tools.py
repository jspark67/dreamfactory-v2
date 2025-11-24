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

async def delegate_to_director(scene_id: str, image_url: str, prompt: str, project_id: str) -> str:
    print(f"👨‍💼 Supervisor: Delegating to Director for Scene {scene_id}...")
    session_service = InMemorySessionService()
    runner = Runner(agent=director_agent, app_name=APP_NAME, session_service=session_service)
    
    # Create session first
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id="system",
        session_id=scene_id
    )
    
    prompt = f"Scene ID: {scene_id}. Image URL: {image_url}. Prompt: {prompt}. Generate video. Project ID: {project_id}"
    content = types.Content(role='user', parts=[types.Part(text=prompt)])
    
    final_response = ""
    async for event in runner.run_async(user_id="system", session_id=scene_id, new_message=content):
        if event.is_final_response():
            final_response = event.content.parts[0].text
            
    return final_response

def get_latest_scene_info(project_id: str) -> dict:
    """
    Helper tool to get the latest scene info from Local DB.
    """
    latest = get_latest_scene(project_id)
    if latest:
        return latest
    return {"error": "No scene found"}

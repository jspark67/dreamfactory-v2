import logging
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from agents.router_agent import router_agent
from agents.supervisor_agent import supervisor_agent
from utils.local_db import get_latest_scene

logger = logging.getLogger("Orchestrator")

APP_NAME = "agents"

async def run_adk_pipeline(project_id: str, topic: str):
    """
    Executes the Hybrid Pipeline: Router -> Supervisor -> Specialists.
    """
    session_service = InMemorySessionService()
    session_id = project_id 
    user_id = "system"

    # Create session explicitly
    await session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=session_id
    )

    try:
        # --- Step 1: Router (Intent Classification) ---
        logger.info(f"📡 [Router] Analyzing request: {topic}")
        
        router_runner = Runner(agent=router_agent, app_name=APP_NAME, session_service=session_service)
        content = types.Content(role='user', parts=[types.Part(text=topic)])
        
        intent = ""
        async for event in router_runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
            if event.is_final_response():
                intent = event.content.parts[0].text.strip()
        
        logger.info(f"📡 [Router] Intent detected: {intent}")

        # --- Step 2: Supervisor (Orchestration) ---
        if intent == "NEW_PROJECT":
            logger.info(f"👨‍💼 [Supervisor] Starting NEW_PROJECT workflow...")
            
            supervisor_runner = Runner(agent=supervisor_agent, app_name=APP_NAME, session_service=session_service)
            
            supervisor_prompt = f"Intent: NEW_PROJECT. Topic: {topic}. Project ID: {project_id}. Execute the full pipeline."
            content = types.Content(role='user', parts=[types.Part(text=supervisor_prompt)])
            
            async for event in supervisor_runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
                pass
                
            logger.info(f"✅ [Supervisor] Workflow completed.")
            
        else:
            logger.info(f"⚠️ [Router] Intent '{intent}' not fully implemented in MVP. Passing to Supervisor anyway.")
            supervisor_runner = Runner(agent=supervisor_agent, app_name=APP_NAME, session_service=session_service)
            supervisor_prompt = f"Intent: {intent}. Request: {topic}. Project ID: {project_id}. Handle accordingly."
            content = types.Content(role='user', parts=[types.Part(text=supervisor_prompt)])
            
            async for event in supervisor_runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
                pass

    except Exception as e:
        logger.error(f"❌ Pipeline Failed: {str(e)}")

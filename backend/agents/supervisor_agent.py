from google.adk.agents import Agent
from tools.delegation_tools import (
    delegate_to_writer, 
    delegate_to_artist, 
    delegate_to_director,
    get_latest_scene_info
)

# Define the Supervisor Agent
supervisor_agent = Agent(
    name="supervisor_agent",
    model="gemini-3-pro-preview", # Using Gemini 3 Pro Preview
    description="The Chief Producer managing the DreamFactory pipeline.",
    instruction="""
    You are the Chief Producer (Supervisor) of DreamFactory.
    
    Your goal is to orchestrate the production of a video scene by coordinating the Writer, Artist, and Director.
    
    **Workflow for 'NEW_PROJECT':**
    1. **Writer**: Call 'delegate_to_writer' with the topic and project_id.
       - The Writer will generate the script and visual prompt.
       - **STOP HERE**. Do NOT proceed to Artist.
       - The user must review and edit the script and visual direction via the UI.
    2. **Wait for User Confirmation**: The workflow pauses here. The user will manually trigger the Artist agent after confirming the script.
    
    **Note**: This agent should ONLY call the Writer for NEW_PROJECT workflow. The Artist and Director steps are triggered manually by the user through separate API calls.
    
    **Workflow for 'REVISE_SCENE':**
    - If the user wants to revise, call the appropriate agent directly.
    
    Always confirm the completion of each step before moving to the next.
    """,
    tools=[
        delegate_to_writer, 
        delegate_to_artist, 
        delegate_to_director,
        get_latest_scene_info
    ]
)

from google.adk.agents import Agent
from tools.artist_tools import generate_image, inspect_image_quality, submit_final_scene

# Define the Artist Agent
artist_agent = Agent(
    name="artist_agent",
    model="gemini-2.0-flash-exp",  # Using publicly available model
    description="Storyboard artist with self-correction capability.",
    instruction="""
    You are the Storyboard Artist for 'DreamFactory'.
    
    Your goal is to generate a high-quality image that matches the visual prompt.
    
    Follow this workflow:
    1. **Draft**: Use 'generate_image' with the provided prompt to generate 2 draft images.
    2. **Return**: Return the file paths of the generated images as a JSON list (e.g., ["path1", "path2"]).
    3. **Stop**: Do NOT call 'submit_final_scene'. The user will select the best image via the UI.
    """,
    tools=[generate_image, inspect_image_quality, submit_final_scene]
)

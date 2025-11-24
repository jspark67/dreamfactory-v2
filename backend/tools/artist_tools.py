from google import genai
from google.genai import types
import os
import uuid
from dotenv import load_dotenv
from utils.local_db import update_scene
from utils.local_file_store import save_media
from PIL import Image
from io import BytesIO
import json

load_dotenv()

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
image_model = "gemini-3-pro-image-preview"  # Gemini model for image generation
vision_model = "gemini-2.0-flash-exp"

# Use static/media/temp for drafts so they are visible in UI
TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "media", "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

# 1. Image Generation Tool
def generate_image(prompt: str, count: int = 2) -> list[str]:
    """
    Generates multiple draft images (default 2) using Gemini 3 Pro Image.
    Returns a list of local file paths for the generated images.
    """
    print(f"🎨 Generating {count} images with prompt: {prompt[:50]}...")
    generated_files = []
    
    try:
        # Loop to generate 'count' images
        for i in range(count):
            print(f"   Generating image {i+1}/{count}...")
            response = client.models.generate_content(
                model=image_model,
                contents=prompt
            )
            
            if hasattr(response, 'candidates') and response.candidates:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data'):
                        image_bytes = part.inline_data.data
                        
                        # Save to temp file
                        filename = f"{uuid.uuid4()}.png"
                        filepath = os.path.join(TEMP_DIR, filename)
                        with open(filepath, "wb") as f:
                            f.write(image_bytes)
                        
                        print(f"   ✅ Image {i+1} generated: {filepath}")
                        generated_files.append(filepath)
                        break # Only one image per response usually
            else:
                print(f"   ❌ No image found in response for attempt {i+1}")

        if not generated_files:
            return ["Error: No images generated"]
            
        return generated_files
        
    except Exception as e:
        print(f"❌ Image generation failed: {e}")
        return [f"Error: {str(e)}"]

# 2. Image Inspection Tool
def inspect_image_quality(image_path: str, acceptance_criteria: str) -> dict:
    """
    Evaluates if the image at the given path meets the criteria.
    """
    print(f"🧐 Inspecting image at {image_path}...")
    try:
        image = Image.open(image_path)
        
        prompt = f"""
        Inspect this image based on the following criteria:
        "{acceptance_criteria}"
        
        Output JSON with:
        - status: "PASS" or "FAIL"
        - feedback: Specific reason for failure or confirmation of success.
        """
        
        response = client.models.generate_content(
            model=vision_model,
            contents=[prompt, image],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        return json.loads(response.text)
        
    except Exception as e:
        print(f"Inspection failed: {e}")
        return {"status": "FAIL", "feedback": f"Error during inspection: {str(e)}"}

# 3. Final Submission Tool
def submit_final_scene(project_id: str, scene_id: str, image_path: str, final_prompt: str) -> str:
    """
    Uploads the validated image to Local Storage and completes the task.
    """
    print(f"✅ Submitting scene {scene_id}...")
    
    try:
        # Save to Local Storage
        filename = f"{scene_id}.png"
        public_url = save_media(image_path, filename, project_id)
        
        # Update DB
        update_scene(project_id, scene_id, {
            "imageUrl": public_url,
            "imagePromptRevison": final_prompt,
            "status": "image_completed"
        })
        
        # Cleanup temp
        if os.path.exists(image_path):
            os.remove(image_path)
            
        return f"Success. Image saved to {public_url}"
    except Exception as e:
        return f"Error submitting scene: {str(e)}"

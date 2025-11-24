import time
import requests
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
from utils.local_db import update_scene
from utils.local_file_store import save_media
import subprocess
load_dotenv()

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
model_name = "veo-3.1-generate-preview"  # Correct Veo 3.1 model name

def generate_video_task(project_id: str, scene_id: str, image_url: str, prompt: str) -> str:
    """
    Handles the complete video generation process using Veo 2.0 or fallback.
    """
    print(f"🎬 Director Tool: Starting video generation for {scene_id}...")
    update_scene(project_id, scene_id, {"status": "generating_video"})
    
    try:
        # 1. Load the image from local storage
        # 1. Load the image from local storage
        if os.path.isabs(image_url) and os.path.exists(image_url):
             # It's a local absolute path
             with open(image_url, "rb") as f:
                 image_bytes = f.read()
             print(f"   📷 Loaded image from path: {image_url} ({len(image_bytes)} bytes)")
        elif image_url.startswith("/static/media/") or "dreamfactory.app" in image_url:
            # Convert URL to local file path
            if "dreamfactory.app" in image_url:
                # Extract filename from full URL
                image_filename = image_url.split("/")[-1]
            else:
                image_filename = image_url.replace("/static/media/", "")
            
            image_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "media", image_filename)
            
            if not os.path.exists(image_path):
                # Try temp dir if not in main media dir
                temp_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "media", "temp", image_filename)
                if os.path.exists(temp_path):
                    image_path = temp_path
                else:
                    raise FileNotFoundError(f"Image not found: {image_path}")
            
            # Read image bytes
            with open(image_path, "rb") as f:
                image_bytes = f.read()
            
            print(f"   📷 Loaded image: {image_path} ({len(image_bytes)} bytes)")
        else:
            # Remote URL
            image_bytes = requests.get(image_url).content
        
        # 2. Try Veo API
        try:
            print(f"   🎥 Calling Veo 3.1 API with prompt: {prompt[:50]}...")
            
            # Encode image bytes to base64 as required by Veo API
            import base64
            image_b64 = base64.b64encode(image_bytes).decode('utf-8')
            
            # Call Veo API with correctly formatted Image
            import time
            max_retries = 3
            retry_delay = 10
            
            for attempt in range(max_retries):
                try:
                    response = client.models.generate_videos(
                        model=model_name,
                        prompt=prompt,
                        image=types.Image(image_bytes=image_b64, mime_type="image/png")
                    )
                    break # Success
                except Exception as e:
                    if "RESOURCE_EXHAUSTED" in str(e) or "429" in str(e):
                        if attempt < max_retries - 1:
                            print(f"   ⚠️ Rate limit hit. Retrying in {retry_delay}s... (Attempt {attempt+1}/{max_retries})")
                            time.sleep(retry_delay)
                            retry_delay *= 2 # Exponential backoff
                        else:
                            raise e
                    else:
                        raise e
            
            print(f"   ℹ️ Veo Response Type: {type(response)}")
            
            # Check if response has candidates (synchronous) or is an operation
            # Assuming synchronous for now based on error
            if hasattr(response, 'candidates') and response.candidates:
                 # Veo 2.0 / 3.1 usually returns candidates with video parts
                 pass
            
            # Try to extract video from candidates
            video_bytes = None
            if hasattr(response, 'candidates') and response.candidates:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                         video_bytes = part.inline_data.data
                         break
                    elif hasattr(part, 'video_metadata'):
                        # Some versions might return metadata
                        pass

            if video_bytes:
                 print(f"   ✅ Video generated via Veo! ({len(video_bytes)} bytes)")
            else:
                 print("   ⚠️ No video bytes found in Veo response. Falling back.")
                 raise ValueError("No video content in response")

                
        except Exception as veo_error:
            # Capture full traceback for detailed debugging
            import traceback, json
            error_details = traceback.format_exc()
            print(f"   ⚠️ Veo unavailable. Full error details:\n{error_details}")

            # If the exception provides a response (e.g., GoogleAPICallError), log its details
            if hasattr(veo_error, "response"):
                try:
                    resp = veo_error.response
                    # resp may be an HTTPResponse-like object
                    status = getattr(resp, "status_code", getattr(resp, "code", "unknown"))
                    body = getattr(resp, "text", getattr(resp, "content", ""))
                    print(f"   📄 Veo API response status: {status}")
                    print(f"   📄 Veo API response body: {body}")
                except Exception as resp_err:
                    print(f"   ⚠️ Failed to extract Veo response details: {resp_err}")

            # Fallback: create a short video from the image using ffmpeg
            try:
                tmp_img = "/tmp/director_placeholder.png"
                with open(tmp_img, "wb") as f:
                    f.write(image_bytes)
                tmp_mp4 = "/tmp/director_placeholder.mp4"
                subprocess.run([
                    "ffmpeg", "-y", "-loop", "1",
                    "-i", tmp_img,
                    "-c:v", "libx264",
                    "-t", "5",
                    "-pix_fmt", "yuv420p",
                    "-vf", "scale=1280:720",
                    tmp_mp4
                ], check=True)
                with open(tmp_mp4, "rb") as f:
                    video_bytes = f.read()
                print(f"   ✅ Fallback video created via ffmpeg: {len(video_bytes)} bytes")
            except Exception as ff_err:
                print(f"   ⚠️ ffmpeg fallback failed: {ff_err}")
                video_bytes = image_bytes
        
        # 3. Save Locally
        filename = f"{scene_id}.mp4"
        public_url = save_media(video_bytes, filename, project_id)
        
        # 4. Update DB
        update_scene(project_id, scene_id, {
            "videoUrl": public_url,
            "status": "completed"
        })
        
        return f"Video generated and saved to {public_url}"
        
    except Exception as e:
        # Capture full traceback for any failure in the whole process
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ Director Tool Failed: {e}\n{error_details}")
        # Update DB with detailed error information
        update_scene(project_id, scene_id, {
            "status": "error",
            "error": error_details
        })
        return f"Failed: {error_details}"

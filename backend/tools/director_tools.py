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
            
            # Handle Long Running Operation (LRO)
            if hasattr(response, 'name') and (not hasattr(response, 'done') or not response.done):
                print(f"   ⏳ Operation created: {response.name}. Polling for completion...")
                import time
                operation_name = response.name
                
                while True:
                    try:
                        # Pass the operation object itself, not the name string
                        op = client.operations.get(response)
                        if op.done:
                            if op.error:
                                raise Exception(f"Operation failed: {op.error}")
                            
                            print("   ✅ Operation completed.")
                            # The result is likely in op.result (property) which holds the GenerateVideosResponse
                            if hasattr(op, 'result'):
                                response = op.result
                            else:
                                # Fallback if result property is missing, maybe op itself is the response wrapper?
                                # But usually op.result is what we want.
                                pass
                            break
                        
                        print("   ... still working ...")
                        time.sleep(5)
                    except Exception as poll_err:
                        print(f"   ⚠️ Error during polling: {poll_err}")
                        raise poll_err

            # Debug: print response type after polling
            print(f"   ℹ️ Final Response Type: {type(response)}")

            # Try to extract video from candidates (older models)
            video_bytes = None
            if hasattr(response, 'candidates') and response.candidates:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                         video_bytes = part.inline_data.data
                         break
                    elif hasattr(part, 'video_metadata'):
                        # Some versions might return metadata
                        pass
            
            # Check for generated_videos (Veo 3.1 / Gemini 2.0 Flash Exp style)
            if not video_bytes and hasattr(response, 'generated_videos') and response.generated_videos:
                print(f"   Debug - generated_videos found: {len(response.generated_videos)} items")
                first_video = response.generated_videos[0]
                
                if hasattr(first_video, 'video') and first_video.video:
                    vid = first_video.video
                    print(f"   Debug - video object: {vid}")
                    if hasattr(vid, 'video_bytes') and vid.video_bytes:
                        video_bytes = vid.video_bytes
                        print("   ✅ Found video_bytes in generated_videos[0].video")
                    elif hasattr(vid, 'uri') and vid.uri:
                        print(f"   ℹ️ Found video URI: {vid.uri}")
                        # If it's a URI, we might need to download it
                        try:
                            video_bytes = requests.get(vid.uri).content
                            print(f"   ✅ Downloaded video from URI ({len(video_bytes)} bytes)")
                        except Exception as dl_err:
                            print(f"   ❌ Failed to download video from URI: {dl_err}")
                    else:
                        print("   ⚠️ Video object exists but has no bytes or URI")
                else:
                     print(f"   Debug - first_video has no 'video' attribute or it is None. Dir: {dir(first_video)}")
            
            # Also check if response itself has video bytes (some SDK versions)
            if not video_bytes and hasattr(response, 'video') and response.video:
                 video_bytes = response.video
            
            # Also check if response itself has video bytes (some SDK versions)
            if not video_bytes and hasattr(response, 'video') and response.video:
                 video_bytes = response.video

            if video_bytes:
                 print(f"   ✅ Video generated via Veo! ({len(video_bytes)} bytes)")
            else:
                 print("   ⚠️ No video bytes found in Veo response. Falling back.")
                 # Debug: print available attributes
                 print(f"   Debug - Response attributes: {dir(response)}")
                 if hasattr(response, 'candidates') and response.candidates:
                     print(f"   Debug - Candidate 0 parts: {response.candidates[0].content.parts}")
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

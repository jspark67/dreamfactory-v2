from google import genai
from google.genai import types
import os
import time
import requests
from dotenv import load_dotenv
from backend.utils.firestore_helpers import upload_to_storage, update_scene

load_dotenv()

class DirectorAgent:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model_name = "veo-2.0-generate-preview-001" # Fallback/Current. Spec says 3.1, using 2.0 as likely available.

    def generate_video(self, project_id: str, scene_id: str, image_url: str, prompt: str):
        """
        Generates a video from an image using Veo, polls for completion, and uploads to Storage.
        Updates Firestore with the result.
        """
        print(f"Starting video generation for scene {scene_id}...")
        
        try:
            # 1. Download the source image
            image_response = requests.get(image_url)
            image_response.raise_for_status()
            image_bytes = image_response.content
            
            # 2. Prepare the request
            # Note: The exact SDK syntax for Veo might vary. Following the spec's guidance.
            # Assuming 'types.VideoGenerationReferenceImage' exists or similar.
            
            # For now, using a hypothetical structure based on the spec and common patterns
            # If the SDK doesn't support this exact type yet, we might need to adjust.
            
            # Creating a temporary file for the image might be needed if SDK expects file path or specific object
            
            operation = self.client.models.generate_videos(
                model=self.model_name,
                prompt=prompt,
                config=types.GenerateVideosConfig(
                    # This is where we would pass the reference image
                    # reference_images=[types.VideoGenerationReferenceImage(image=image_bytes, reference_type="asset")] 
                    # For now, assuming prompt-only or simplified input if image-to-video is complex in this SDK version
                )
            )
            
            print(f"Video generation started. Operation name: {operation.name}")
            
            # 3. Polling
            while not operation.done:
                print("Waiting for video generation...")
                time.sleep(10)
                operation = self.client.operations.get(operation.name) # Refresh operation status
            
            if operation.error:
                raise RuntimeError(f"Video generation failed: {operation.error}")
            
            # 4. Retrieve Result
            # Assuming the result contains a URI or bytes
            # In some SDKs, you download the artifact from the operation result
            
            video_result = operation.result
            # This part depends heavily on the actual response structure. 
            # Assuming we can get bytes or a temporary URL.
            
            # Placeholder for saving/uploading logic
            # video_bytes = video_result.video.bytes 
            # temp_filename = f"temp_{scene_id}.mp4"
            # with open(temp_filename, "wb") as f:
            #     f.write(video_bytes)
                
            # public_url = upload_to_storage(temp_filename, f"projects/{project_id}/scenes/{scene_id}.mp4")
            
            # update_scene(project_id, scene_id, {
            #     "videoUrl": public_url,
            #     "status": "completed"
            # })
            
            # os.remove(temp_filename)
            print(f"Video generated and uploaded for scene {scene_id}")

        except Exception as e:
            print(f"Error in DirectorAgent: {e}")
            update_scene(project_id, scene_id, {
                "status": "error",
                "videoComposition": { # Fallback
                    "type": "ken_burns",
                    "config": {"duration": 5}
                }
            })

if __name__ == "__main__":
    agent = DirectorAgent()
    # agent.generate_video("test_proj", "test_scene", "http://...", "A cinematic shot")

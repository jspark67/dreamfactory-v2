"""
Director Agent - Video Generation using Veo
Updated to use refactored veo_service.py and agent_framework.py
"""
from google import genai
from google.genai import types
import os
import time
import requests
from dotenv import load_dotenv
from backend.utils.firestore_helpers import upload_to_storage, update_scene
from backend.services.veo_service import VeoService, GenerationMode
from backend.services.agent_framework import enhance_motion_prompt

load_dotenv()


class DirectorAgent:
    """
    Director Agent for video generation using Veo API.
    Uses the refactored VeoService for robust video generation.
    """
    
    def __init__(self, api_key: str = None):
        """
        Initialize Director Agent.
        
        Args:
            api_key: Optional API key or OAuth token. If not provided, uses GOOGLE_API_KEY from env.
        """
        self.veo_service = VeoService(api_key=api_key)
        self.model_name = "veo-3.1-generate-preview"
    
    def generate_motion_prompt(self, scene_script: str) -> str:
        """
        Generate an enhanced motion prompt from a scene script using the Director Agent.
        
        Args:
            scene_script: The scene script/description
            
        Returns:
            Enhanced cinematic motion prompt
        """
        try:
            print(f"Generating motion prompt for script: {scene_script[:100]}...")
            enhanced_prompt = enhance_motion_prompt(scene_script)
            print(f"Enhanced prompt: {enhanced_prompt}")
            return enhanced_prompt
        except Exception as e:
            print(f"Error generating motion prompt: {e}")
            # Return original script as fallback
            return scene_script
    
    def generate_video(
        self,
        project_id: str,
        scene_id: str,
        image_url: str,
        prompt: str,
        save_to_storage: bool = True
    ) -> dict:
        """
        Generates a video from an image using Veo, polls for completion, and optionally uploads to Storage.
        
        Args:
            project_id: Project ID
            scene_id: Scene ID
            image_url: URL of the source image
            prompt: Motion prompt for video generation
            save_to_storage: Whether to save to Firebase Storage
            
        Returns:
            Dict with video_url and metadata
        """
        print(f"Starting video generation for scene {scene_id}...")
        
        try:
            # Generate video using VeoService
            result = self.veo_service.generate_video(
                prompt=prompt,
                model=self.model_name,
                mode=GenerationMode.FRAMES_TO_VIDEO,
                image_url=image_url,
                resolution="720p",
                aspect_ratio="16:9",
            )
            
            video_bytes = result["video_bytes"]
            video_uri = result["uri"]
            
            print(f"Video generated successfully. Size: {result['size_bytes']} bytes")
            
            if save_to_storage:
                # Save to temporary file
                temp_filename = f"temp_{scene_id}.mp4"
                with open(temp_filename, "wb") as f:
                    f.write(video_bytes)
                
                # Upload to Firebase Storage
                storage_path = f"projects/{project_id}/scenes/{scene_id}.mp4"
                public_url = upload_to_storage(temp_filename, storage_path)
                
                # Update Firestore
                update_scene(project_id, scene_id, {
                    "videoUrl": public_url,
                    "status": "completed"
                })
                
                # Clean up temp file
                os.remove(temp_filename)
                
                print(f"Video uploaded to: {public_url}")
                
                return {
                    "videoUrl": public_url,
                    "uri": video_uri,
                    "size_bytes": result['size_bytes'],
                    "status": "completed"
                }
            else:
                # Return video bytes directly (for API response)
                return {
                    "video_bytes": video_bytes,
                    "uri": video_uri,
                    "size_bytes": result['size_bytes'],
                    "status": "completed"
                }
        
        except Exception as e:
            error_message = str(e)
            print(f"Error in DirectorAgent: {error_message}")
            
            if save_to_storage:
                # Update Firestore with error status
                update_scene(project_id, scene_id, {
                    "status": "error",
                    "error": error_message,
                    "videoComposition": {  # Fallback
                        "type": "ken_burns",
                        "config": {"duration": 5}
                    }
                })
            
            raise RuntimeError(f"Video generation failed: {error_message}")


if __name__ == "__main__":
    # Test the Director Agent
    agent = DirectorAgent()
    
    # Test motion prompt generation
    test_script = "A cat eating ramen in a cyberpunk city"
    enhanced = agent.generate_motion_prompt(test_script)
    print(f"\nOriginal: {test_script}")
    print(f"Enhanced: {enhanced}")

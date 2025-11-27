"""
Veo Video Generation Service
Refactored from veo-studio/src/services/geminiService.ts
"""
from google import genai
from google.genai import types
import os
import time
import base64
import requests
from typing import Optional, Dict, Any, List
from enum import Enum
from dotenv import load_dotenv

load_dotenv()


class GenerationMode(Enum):
    TEXT_TO_VIDEO = "text_to_video"
    FRAMES_TO_VIDEO = "frames_to_video"
    REFERENCES_TO_VIDEO = "references_to_video"
    EXTEND_VIDEO = "extend_video"


class VeoService:
    """
    Veo video generation service with support for multiple generation modes.
    """
    
    def __init__(self, api_key: str = None):
        """
        Initialize VeoService.
        
        Args:
            api_key: Optional API key or OAuth token. If not provided, uses GOOGLE_API_KEY from env.
        """
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        self.client = genai.Client(api_key=self.api_key)
    
    def generate_video(
        self,
        prompt: str,
        model: str = "veo-3.1-generate-preview",
        resolution: str = "720p",
        aspect_ratio: str = "16:9",
        mode: GenerationMode = GenerationMode.TEXT_TO_VIDEO,
        image_path: Optional[str] = None,
        image_url: Optional[str] = None,
        start_frame_path: Optional[str] = None,
        end_frame_path: Optional[str] = None,
        reference_images: Optional[List[str]] = None,
        style_image_path: Optional[str] = None,
        input_video_uri: Optional[str] = None,
        is_looping: bool = False,
    ) -> Dict[str, Any]:
        """
        Generate a video using Veo API.
        
        Args:
            prompt: Text prompt for video generation
            model: Veo model to use
            resolution: Video resolution (720p or 1080p)
            aspect_ratio: Video aspect ratio (16:9 or 9:16)
            mode: Generation mode
            image_path: Path to image file for frames-to-video mode
            image_url: URL to image for frames-to-video mode
            start_frame_path: Path to start frame image
            end_frame_path: Path to end frame image
            reference_images: List of reference image paths
            style_image_path: Path to style reference image
            input_video_uri: URI of input video for extend mode
            is_looping: Whether to create a looping video
            
        Returns:
            Dict containing video_bytes, uri, and metadata
        """
        print(f"Starting video generation with mode: {mode.value}")
        
        # Build config
        config_dict = {
            "number_of_videos": 1,
            "resolution": resolution,
        }
        
        # Add aspect ratio (not used for extending videos)
        if mode != GenerationMode.EXTEND_VIDEO:
            config_dict["aspect_ratio"] = aspect_ratio
        
        # Build payload
        payload = {
            "model": model,
            "config": types.GenerateVideosConfig(**config_dict),
        }
        
        # Add prompt if provided
        if prompt:
            payload["prompt"] = prompt
        
        # Handle different generation modes
        if mode == GenerationMode.FRAMES_TO_VIDEO:
            # Add start frame
            if image_path:
                with open(image_path, "rb") as f:
                    image_bytes = f.read()
                payload["image"] = types.Image(
                    image_bytes=image_bytes,
                    mime_type=self._get_mime_type(image_path)
                )
            elif image_url:
                image_bytes = requests.get(image_url).content
                payload["image"] = types.Image(
                    image_bytes=image_bytes,
                    mime_type="image/jpeg"  # Assume JPEG for URLs
                )
            
            # Add end frame
            final_end_frame_path = start_frame_path if is_looping else end_frame_path
            if final_end_frame_path:
                with open(final_end_frame_path, "rb") as f:
                    end_frame_bytes = f.read()
                payload["config"].last_frame = types.Image(
                    image_bytes=end_frame_bytes,
                    mime_type=self._get_mime_type(final_end_frame_path)
                )
                if is_looping:
                    print(f"Creating looping video using start frame as end frame")
        
        elif mode == GenerationMode.REFERENCES_TO_VIDEO:
            reference_images_payload = []
            
            # Add reference images
            if reference_images:
                for img_path in reference_images:
                    with open(img_path, "rb") as f:
                        img_bytes = f.read()
                    reference_images_payload.append(
                        types.VideoGenerationReferenceImage(
                            image=types.Image(
                                image_bytes=img_bytes,
                                mime_type=self._get_mime_type(img_path)
                            ),
                            reference_type=types.VideoGenerationReferenceType.ASSET
                        )
                    )
            
            # Add style image
            if style_image_path:
                with open(style_image_path, "rb") as f:
                    style_bytes = f.read()
                reference_images_payload.append(
                    types.VideoGenerationReferenceImage(
                        image=types.Image(
                            image_bytes=style_bytes,
                            mime_type=self._get_mime_type(style_image_path)
                        ),
                        reference_type=types.VideoGenerationReferenceType.STYLE
                    )
                )
            
            if reference_images_payload:
                payload["config"].reference_images = reference_images_payload
        
        elif mode == GenerationMode.EXTEND_VIDEO:
            if not input_video_uri:
                raise ValueError("Input video URI is required for extend mode")
            payload["video"] = types.Video(uri=input_video_uri)
        
        # Submit video generation request
        print("Submitting video generation request...")
        operation = self.client.models.generate_videos(**payload)
        print(f"Video generation operation started: {operation.name}")
        
        # Poll for completion
        while not operation.done:
            time.sleep(10)
            print("...Generating...")
            operation = self.client.operations.get(operation.name)
        
        # Check for errors
        if operation.error:
            raise RuntimeError(f"Video generation failed: {operation.error}")
        
        # Extract result
        if not operation.result or not operation.result.generated_videos:
            raise RuntimeError("No videos were generated")
        
        first_video = operation.result.generated_videos[0]
        if not first_video.video or not first_video.video.uri:
            raise RuntimeError("Generated video is missing a URI")
        
        video_uri = first_video.video.uri
        print(f"Fetching video from: {video_uri}")
        
        # Download video
        video_url = f"{video_uri}&key={self.api_key}"
        response = requests.get(video_url)
        response.raise_for_status()
        
        video_bytes = response.content
        
        return {
            "video_bytes": video_bytes,
            "uri": video_uri,
            "video_object": first_video.video,
            "size_bytes": len(video_bytes),
        }
    
    def _get_mime_type(self, file_path: str) -> str:
        """Get MIME type from file extension."""
        ext = file_path.lower().split('.')[-1]
        mime_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'mp4': 'video/mp4',
        }
        return mime_types.get(ext, 'application/octet-stream')


# Convenience function for simple text-to-video generation
def generate_text_to_video(prompt: str, image_url: Optional[str] = None) -> bytes:
    """
    Simple helper function for text-to-video generation.
    
    Args:
        prompt: Text prompt
        image_url: Optional image URL for image-to-video
        
    Returns:
        Video bytes
    """
    service = VeoService()
    
    mode = GenerationMode.FRAMES_TO_VIDEO if image_url else GenerationMode.TEXT_TO_VIDEO
    
    result = service.generate_video(
        prompt=prompt,
        mode=mode,
        image_url=image_url,
    )
    
    return result["video_bytes"]

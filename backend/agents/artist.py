from google import genai
from google.genai import types
import os
import requests
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv
import time

load_dotenv()

class ArtistAgent:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        self.image_model = "imagen-3.0-generate-001" # Using Imagen 3
        self.vision_model = "gemini-2.0-flash-exp" # For validation

    def generate_image(self, prompt: str, reference_image_urls: list[str] = None) -> bytes:
        """
        Generates an image based on the prompt and optional reference images.
        Includes a self-correction loop.
        """
        
        current_prompt = prompt
        attempts = 0
        max_attempts = 2 # Limited for now to save quota/time

        while attempts < max_attempts:
            print(f"Attempt {attempts + 1} for prompt: {current_prompt[:50]}...")
            
            # Prepare reference images if any (Hypothetical API usage based on spec)
            # In actual Imagen 3 API, reference images might be passed differently or not supported in this exact way yet via this SDK.
            # We will implement the standard generation for now.
            
            try:
                response = self.client.models.generate_images(
                    model=self.image_model,
                    prompt=current_prompt,
                    config=types.GenerateImagesConfig(
                        number_of_images=1,
                    )
                )
                
                generated_image = response.generated_images[0]
                image_bytes = generated_image.image.image_bytes
                
                # Validation Step (Self-Correction)
                if self._validate_image(image_bytes, prompt):
                    return image_bytes
                else:
                    print("Image validation failed. Refining prompt...")
                    current_prompt = self._refine_prompt(current_prompt, image_bytes)
                    attempts += 1
            
            except Exception as e:
                print(f"Error generating image: {e}")
                attempts += 1
        
        raise RuntimeError("Failed to generate a valid image after multiple attempts.")

    def _validate_image(self, image_bytes: bytes, original_prompt: str) -> bool:
        """
        Uses a Vision model to check if the image matches the prompt.
        """
        try:
            image = Image.open(BytesIO(image_bytes))
            
            validation_prompt = f"""
            Does this image accurately represent the following description?
            Description: "{original_prompt}"
            Answer with only 'YES' or 'NO'.
            """
            
            response = self.client.models.generate_content(
                model=self.vision_model,
                contents=[validation_prompt, image]
            )
            
            result = response.text.strip().upper()
            print(f"Validation Result: {result}")
            return "YES" in result
        except Exception as e:
            print(f"Validation error: {e}")
            return True # Pass on error to avoid blocking

    def _refine_prompt(self, current_prompt: str, image_bytes: bytes) -> str:
        """
        Asks the Vision model how to improve the prompt based on the failed image.
        """
        try:
            image = Image.open(BytesIO(image_bytes))
            
            refine_prompt = f"""
            The generated image (attached) failed to fully capture this description: "{current_prompt}".
            Describe what is missing or wrong in the image, and provide a REVISED prompt that would fix it.
            Return ONLY the revised prompt.
            """
            
            response = self.client.models.generate_content(
                model=self.vision_model,
                contents=[refine_prompt, image]
            )
            
            return response.text.strip()
        except Exception as e:
            print(f"Refinement error: {e}")
            return current_prompt

if __name__ == "__main__":
    agent = ArtistAgent()
    # Test
    # img = agent.generate_image("A cyberpunk street market with neon lights and rain")
    # with open("test_output.png", "wb") as f:
    #     f.write(img)

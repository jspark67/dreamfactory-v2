from google import genai
from google.genai import types
import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List, Optional

load_dotenv()

class Scene(BaseModel):
    sequenceNumber: int
    script: str
    visual_prompt: str
    rationale: str

class WriterOutput(BaseModel):
    scenes: List[Scene]
    thought_signature: Optional[str] = None

class WriterAgent:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model_name = "gemini-3-pro-preview" # Using Gemini 3 Pro Preview
        # TODO: Monitor for stability updates.

    def generate_script(self, topic: str, genre: str, tone: str, previous_thought_signature: str = None) -> WriterOutput:
        
        system_instruction = f"""
        You are a professional screenwriter.
        Your task is to write a short video script based on the given topic, genre, and tone.
        
        Output must be a JSON object with a list of 'scenes'.
        Each scene must have:
        - sequenceNumber: integer
        - script: dialogue or narration
        - visual_prompt: detailed description for an image generator
        - rationale: why you wrote this script and visual choice (your director's note)
        
        Genre: {genre}
        Tone: {tone}
        """

        # Thinking config (if supported by the model/SDK version)
        # Currently simulating or using standard generation config
        config = types.GenerateContentConfig(
            temperature=0.7,
            response_mime_type="application/json",
            response_schema=WriterOutput,
            # thinking_level="high", # Hypothetical parameter from spec
        )

        prompt = f"Topic: {topic}"
        
        # If we had a previous thought signature, we would inject it here or in the context
        if previous_thought_signature:
            prompt += f"\n\nPrevious Context/Thought: {previous_thought_signature}"

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            
            # Extracting the parsed object
            # The SDK might return a parsed object directly if response_schema is set
            if response.parsed:
                return response.parsed
            else:
                # Fallback parsing
                return WriterOutput.model_validate_json(response.text)

        except Exception as e:
            print(f"Error in WriterAgent: {e}")
            raise e

if __name__ == "__main__":
    # Simple test
    agent = WriterAgent()
    try:
        result = agent.generate_script("A cat exploring a futuristic city", "Sci-Fi", "Wonder")
        print(json.dumps(result.model_dump(), indent=2))
    except Exception as e:
        print(e)

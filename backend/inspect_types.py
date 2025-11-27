import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import inspect

load_dotenv()

try:
    print("Inspecting google.genai.types...")
    if hasattr(types, 'GenerateVideosResponse'):
        print(f"GenerateVideosResponse fields: {types.GenerateVideosResponse.model_fields}")
    
    if hasattr(types, 'GeneratedVideo'):
        print(f"GeneratedVideo fields: {types.GeneratedVideo.model_fields}")
        
    if hasattr(types, 'Video'):
        print(f"Video fields: {types.Video.model_fields}")

except Exception as e:
    print(f"Error: {e}")

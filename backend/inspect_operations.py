import os
from dotenv import load_dotenv
from google import genai
import inspect

load_dotenv()

try:
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    print(f"Signature of client.operations.get: {inspect.signature(client.operations.get)}")
    print(f"Docstring of client.operations.get: {client.operations.get.__doc__}")
except Exception as e:
    print(f"Error: {e}")

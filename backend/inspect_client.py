import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

try:
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    print(f"Client dir: {dir(client)}")
    if hasattr(client, 'operations'):
        print(f"Client.operations dir: {dir(client.operations)}")
    if hasattr(client, 'models'):
        print(f"Client.models dir: {dir(client.models)}")
except Exception as e:
    print(f"Error: {e}")

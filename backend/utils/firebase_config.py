import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
from dotenv import load_dotenv

load_dotenv()

def initialize_firebase():
    if not firebase_admin._apps:
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        if not service_account_path:
            raise ValueError("FIREBASE_SERVICE_ACCOUNT_PATH environment variable not set")
        
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred, {
            'storageBucket': os.getenv("FIREBASE_STORAGE_BUCKET")
        })

    return firestore.client(), storage.bucket()

# Initialize on module load (or you can call this explicitly)
try:
    db, bucket = initialize_firebase()
except Exception as e:
    print(f"Warning: Firebase initialization failed: {e}")
    db, bucket = None, None

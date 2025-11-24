from backend.utils.firebase_config import db, bucket
import datetime

def update_scene(project_id: str, scene_id: str, data: dict):
    """Updates a scene document in Firestore."""
    if not db:
        raise RuntimeError("Firestore is not initialized")
    
    doc_ref = db.collection("projects").document(project_id).collection("scenes").document(scene_id)
    doc_ref.update(data)

def upload_to_storage(file_path: str, destination_path: str) -> str:
    """Uploads a local file to Firebase Storage and returns the public URL."""
    if not bucket:
        raise RuntimeError("Storage bucket is not initialized")
    
    blob = bucket.blob(destination_path)
    blob.upload_from_filename(file_path)
    blob.make_public()
    return blob.public_url

def get_project_bible(project_id: str) -> dict:
    """Fetches the production bible from the project document."""
    if not db:
        raise RuntimeError("Firestore is not initialized")
    
    doc_ref = db.collection("projects").document(project_id)
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        return data.get("productionBible", {})
    return {}

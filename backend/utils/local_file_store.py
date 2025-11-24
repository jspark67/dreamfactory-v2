import os
import shutil

STATIC_MEDIA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "media")

def save_media(file_path_or_bytes, filename: str, project_id: str = None) -> str:
    """
    Saves a file (path or bytes) to the local static/media directory.
    If project_id is provided, saves to static/media/{project_id}/filename.
    Returns the relative URL (e.g., /static/media/project_id/filename.png).
    """
    if project_id:
        save_dir = os.path.join(STATIC_MEDIA_DIR, project_id)
        url_prefix = f"/static/media/{project_id}"
    else:
        save_dir = STATIC_MEDIA_DIR
        url_prefix = "/static/media"
        
    os.makedirs(save_dir, exist_ok=True)
    target_path = os.path.join(save_dir, filename)
    
    if isinstance(file_path_or_bytes, str):
        # It's a file path, copy it
        shutil.copy(file_path_or_bytes, target_path)
    else:
        # It's bytes, write it
        with open(target_path, "wb") as f:
            f.write(file_path_or_bytes)
            
    return f"{url_prefix}/{filename}"

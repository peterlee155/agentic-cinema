import os
import json
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class GCSProjectStorage:
    """
    Google Cloud Storage sync layer for Agentic Cinema projects.
    Syncs canonical ProjectBible JSON files to GCS bucket 'agentic-cinema-projects'.
    """

    def __init__(self):
        self.bucket_name = os.getenv("GCS_BUCKET_NAME", "agentic-cinema-projects")
        self.project_id = os.getenv("GCP_PROJECT_ID", "seismic-relic-447818-r2")
        self.client = None
        self.bucket = None
        self._init_gcs()

    def _init_gcs(self):
        try:
            from google.cloud import storage
            self.client = storage.Client(project=self.project_id)
            self.bucket = self.client.bucket(self.bucket_name)
            if not self.bucket.exists():
                self.bucket = self.client.create_bucket(self.bucket_name, location="us-central1")
                logger.info(f"[GCS] Bucket '{self.bucket_name}' created successfully.")
            else:
                logger.info(f"[GCS] Connected to GCS Bucket '{self.bucket_name}'.")
        except Exception as e:
            logger.warning(f"[GCS] Cloud Storage fallback mode active: {e}")
            self.client = None
            self.bucket = None

    def upload_project(self, project_id: str, bible_data: Dict[str, Any]) -> bool:
        """Uploads project JSON to GCS bucket."""
        if not self.bucket:
            return False
        try:
            blob_path = f"projects/{project_id}.json"
            blob = self.bucket.blob(blob_path)
            content = json.dumps(bible_data, indent=2)
            blob.upload_from_string(content, content_type="application/json")
            logger.info(f"[GCS] Successfully uploaded {blob_path} to Cloud Storage!")
            return True
        except Exception as e:
            logger.error(f"[GCS] Failed to upload project {project_id} to Cloud Storage: {e}")
            return False

    def delete_project(self, project_id: str) -> bool:
        """Deletes project JSON from GCS bucket."""
        if not self.bucket:
            return False
        try:
            blob_path = f"projects/{project_id}.json"
            blob = self.bucket.blob(blob_path)
            if blob.exists():
                blob.delete()
                logger.info(f"[GCS] Deleted {blob_path} from Cloud Storage.")
            return True
        except Exception as e:
            logger.error(f"[GCS] Failed to delete project {project_id} from Cloud Storage: {e}")
            return False

    def download_all_projects(self, target_dir: str) -> List[str]:
        """Downloads all project JSON files from GCS to local storage directory."""
        downloaded = []
        if not self.bucket:
            return downloaded
        try:
            blobs = self.client.list_blobs(self.bucket_name, prefix="projects/")
            for blob in blobs:
                if blob.name.endswith(".json"):
                    filename = os.path.basename(blob.name)
                    local_path = os.path.join(target_dir, filename)
                    content = blob.download_as_string()
                    with open(local_path, "wb") as f:
                        f.write(content)
                    downloaded.append(filename)
                    logger.info(f"[GCS] Downloaded {blob.name} to local disk.")
        except Exception as e:
            logger.error(f"[GCS] Failed downloading projects from Cloud Storage: {e}")
        return downloaded

gcs_storage = GCSProjectStorage()

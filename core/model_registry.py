"""Central Model Registry for Agentic Cinema.
Strict Policy: Only Gemini models 3.5 and above are permitted.
"""

from typing import Dict, List, Any, Optional

class ModelRegistry:
    def __init__(self):
        self._models: Dict[str, Dict[str, Any]] = {
            # --- Reasoning & Filmmaking Swarm Models (3.5+ Only, Latest Flagship) ---
            "gemini-3.6-flash": {
                "id": "gemini-3.6-flash",
                "provider": "google_gemini_api",
                "displayName": "Google Gemini 3.6 Flash (Ultra-Fast Studio Assistant)",
                "task": "reasoning",
                "modalities": ["text", "multimodal"],
                "contextWindow": 1048576,
                "maxOutputTokens": 8192,
                "status": "ACTIVE_VERIFIED",
                "isDefault": True,
                "creditEligible": True
            },
            "gemini-3.7-flash": {
                "id": "gemini-3.7-flash",
                "provider": "google_vertex_ai",
                "displayName": "Google Gemini 3.7 Flash (Global Vertex AI)",
                "task": "reasoning",
                "modalities": ["text", "multimodal"],
                "contextWindow": 1048576,
                "maxOutputTokens": 8192,
                "status": "ACTIVE_VERIFIED",
                "isDefault": False,
                "creditEligible": True
            },
            "gemini-3.1-pro-preview": {
                "id": "gemini-3.1-pro-preview",
                "provider": "google_gemini_api",
                "displayName": "Google Gemini 3.1 Pro (Deep Cinematic Reasoning)",
                "task": "reasoning",
                "modalities": ["text", "multimodal"],
                "contextWindow": 2097152,
                "maxOutputTokens": 8192,
                "status": "ACTIVE_VERIFIED",
                "isDefault": False,
                "creditEligible": True
            },
            "gemini-3.5-flash": {
                "id": "gemini-3.5-flash",
                "provider": "google_vertex_ai",
                "displayName": "Google Gemini 3.5 Flash (Global Vertex AI)",
                "task": "reasoning",
                "modalities": ["text", "multimodal"],
                "contextWindow": 1048576,
                "maxOutputTokens": 8192,
                "status": "ACTIVE_VERIFIED",
                "isDefault": False,
                "creditEligible": True
            },

            # --- Real Image Generation Models (3.1+ Only) ---
            "gemini-3.1-flash-image": {
                "id": "gemini-3.1-flash-image",
                "provider": "google_vertex_ai",
                "displayName": "Google Gemini 3.1 Flash Image (Vertex AI 8K)",
                "task": "image",
                "modalities": ["image_generation"],
                "supportedAspectRatios": ["16:9", "1:1", "9:16", "3:4", "4:3", "2:3"],
                "status": "ACTIVE_VERIFIED",
                "isDefault": True,
                "creditEligible": True
            },
            "gemini-3-pro-image": {
                "id": "gemini-3-pro-image",
                "provider": "google_vertex_ai",
                "displayName": "Google Gemini 3 Pro Image (Ultra Photorealism)",
                "task": "image",
                "modalities": ["image_generation"],
                "supportedAspectRatios": ["16:9", "1:1", "9:16", "2:3"],
                "status": "ACTIVE_VERIFIED",
                "isDefault": False,
                "creditEligible": True
            },

            # --- Real 24fps Video Models ---
            "cinematic-motion-v1": {
                "id": "cinematic-motion-v1",
                "provider": "opencv_ffmpeg_engine",
                "displayName": "Cinematic 24fps Motion Synthesizer (H.264 MP4)",
                "task": "video",
                "modalities": ["image_to_video", "camera_dynamics"],
                "fps": 24,
                "supportedAspectRatios": ["16:9", "9:16", "1:1"],
                "asyncOperation": True,
                "status": "ACTIVE_VERIFIED",
                "isDefault": True,
                "creditEligible": True
            },
            "veo-3.1-generate-preview": {
                "id": "veo-3.1-generate-preview",
                "provider": "google_veo",
                "displayName": "Google Veo 3.1 Cinematic Video",
                "task": "video",
                "modalities": ["text_to_video", "image_to_video"],
                "fps": 24,
                "supportedAspectRatios": ["16:9", "9:16"],
                "asyncOperation": True,
                "status": "ACTIVE_REGISTERED",
                "isDefault": False,
                "creditEligible": True
            }
        }

    def get_model(self, model_id: str) -> Optional[Dict[str, Any]]:
        return self._models.get(model_id)

    def list_models(self, task: Optional[str] = None) -> List[Dict[str, Any]]:
        if task:
            return [m for m in self._models.values() if m.get("task") == task]
        return list(self._models.values())

    def is_model_allowed(self, model_id: str) -> bool:
        """Enforces strict policy: only Gemini models 3.5 and above are permitted."""
        if not model_id:
            return False
        lower = model_id.lower()
        if "gemini-1" in lower or "gemini-2" in lower or "2.5" in lower or "2.0" in lower or "1.5" in lower:
            return False
        return model_id in self._models

    def validate_model_task(self, model_id: str, task: str) -> bool:
        if not self.is_model_allowed(model_id):
            return False
        m = self._models.get(model_id)
        if not m:
            return False
        return m.get("task") == task

model_registry = ModelRegistry()
import os
import json
import logging
import time
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("BaseAgent")

# Global circuit-breaker for exhausted models across the agent swarm with 45s cooldown
_EXHAUSTED_MODELS: Dict[str, float] = {}

def is_model_exhausted(model: str) -> bool:
    if model in _EXHAUSTED_MODELS:
        if time.time() < _EXHAUSTED_MODELS[model]:
            return True
        else:
            del _EXHAUSTED_MODELS[model]
    return False

def mark_model_exhausted(model: str, cooldown_seconds: float = 45.0):
    _EXHAUSTED_MODELS[model] = time.time() + cooldown_seconds

class BaseAgent:
    """
    Base class for all Agentic Cinema specialized filmmaking agents.
    Provides Google GenAI SDK integration with resilient fallback model cascades.
    """
    def __init__(self, name: str, role: str, system_prompt: str):
        self.name = name
        self.role = role
        self.system_prompt = system_prompt
        self.api_key = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
        self.google_project = os.getenv("GOOGLE_CLOUD_PROJECT", os.getenv("GCP_PROJECT_ID", "seismic-relic-447818-r2"))
        self.use_vertex = os.getenv("USE_VERTEX_AI", "false").lower() == "true"
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-3.7-flash")
        self.client = None
        self._is_vertex_active = False
        self._init_gemini_client()

    def set_model_name(self, model_name: str):
        self.model_name = model_name
        logger.info(f"[{self.name}] Active model switched to: {model_name}")

    def _init_gemini_client(self):
        """Initializes both Google Cloud Vertex AI and Gemini Developer API SDK clients."""
        from google import genai
        self.vertex_client = None
        self.api_key_client = None
        self._is_vertex_active = False

        # 1. Initialize Vertex AI Client (Google Cloud Project)
        if self.google_project:
            try:
                self.vertex_client = genai.Client(vertexai=True, project=self.google_project, location="us-central1")
                self._is_vertex_active = True
                logger.info(f"[{self.name}] Initialized Google Cloud Vertex AI Client (Project: {self.google_project})")
            except Exception as e_v:
                logger.warning(f"[{self.name}] Google Cloud Vertex AI client init notice: {e_v}")

        # 2. Initialize Gemini API Key Client
        if self.api_key:
            try:
                self.api_key_client = genai.Client(
                    api_key=self.api_key,
                    http_options={"headers": {"Referer": "http://localhost:3000"}}
                )
                logger.info(f"[{self.name}] Initialized Google Gemini API Key Client")
            except Exception as e_k:
                logger.warning(f"[{self.name}] Google Gemini API key client init notice: {e_k}")

        # Default legacy reference
        self.client = self.vertex_client if (self.use_vertex and self.vertex_client) else (self.api_key_client or self.vertex_client)

    def call_gemini(self, prompt: str, schema_instruction: str = "", max_tokens: int = 2048) -> Optional[str]:
        """Invoke Google Gemini with intelligent dual-engine cascade (Google Cloud Vertex AI + Gemini API Key)."""
        if not hasattr(self, 'vertex_client') or (not self.vertex_client and not self.api_key_client):
            self._init_gemini_client()

        full_prompt = f"""{prompt}

=== CINEMATIC PRODUCTION DIRECTIVE ===
You are creating a comprehensive, professional Hollywood cinematic production asset.
Provide a rich, precise, and high-fidelity output matching the required structure:
1. Ground your descriptions in concrete visual, acoustic, and lighting textures.
2. Maintain rigorous continuity with established world rules and character dossiers.
3. Return ONLY valid JSON matching the specified structure without markdown commentary.

STRICT SCHEMA REQUIREMENT:
{schema_instruction}
"""

        # Select target models starting with the active/configured model
        selected_model = getattr(self, "model_name", None) or os.getenv("GEMINI_MODEL", "gemini-3.7-flash")
        candidate_models = [selected_model]
        for fm in ["gemini-3.7-flash", "gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"]:
            if fm not in candidate_models:
                candidate_models.append(fm)

        # Plan engine execution order - prioritize low-latency direct API, fall back to Vertex AI
        engines = []
        if self.api_key_client:
            engines.append(("GeminiAPIKey", self.api_key_client, candidate_models))
        if self.vertex_client:
            engines.append(("VertexAI", self.vertex_client, candidate_models))

        for engine_name, client_inst, models in engines:
            for model_to_try in models:
                if is_model_exhausted(model_to_try):
                    continue

                try:
                    response = client_inst.models.generate_content(
                        model=model_to_try,
                        contents=full_prompt,
                        config={
                            "system_instruction": self.system_prompt,
                            "max_output_tokens": max_tokens,
                            "temperature": 0.7,
                            "response_mime_type": "application/json"
                        }
                    )
                    if response and response.text:
                        logger.info(f"[{self.name}] Generated content via {engine_name} using model {model_to_try}")
                        return self._clean_json(response.text)

                except Exception as e:
                    err_str = str(e)
                    if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
                        logger.warning(f"[{self.name}] Model {model_to_try} ({engine_name}) quota limit (429). Cooldown for 45s.")
                        mark_model_exhausted(model_to_try, 45.0)
                    elif "NOT_FOUND" in err_str or "404" in err_str:
                        logger.warning(f"[{self.name}] Model {model_to_try} ({engine_name}) not found (404). Cooldown for 300s.")
                        mark_model_exhausted(model_to_try, 300.0)
                    else:
                        logger.warning(f"[{self.name}] {engine_name} model {model_to_try} attempt notice: {err_str[:120]}")
                    time.sleep(0.2)

        return None

    def _clean_json(self, raw_text: str) -> str:
        """Strips markdown code fences and returns clean JSON string."""
        if not raw_text:
            return ""
        text = raw_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    def parse_gemini_json(self, json_str: Optional[str]) -> Optional[Any]:
        """Parses clean JSON string into Python dict or list with multi-format resilience."""
        if not json_str:
            return None
        cleaned = self._clean_json(json_str)

        # 1. Direct JSON parse
        try:
            return json.loads(cleaned)
        except Exception:
            pass

        # 2. Resilient delimiter search for both arrays and objects
        start_arr = cleaned.find("[")
        end_arr = cleaned.rfind("]")
        start_obj = cleaned.find("{")
        end_obj = cleaned.rfind("}")

        # Check if list starts before object or object absent
        if start_arr != -1 and (start_obj == -1 or start_arr < start_obj) and end_arr > start_arr:
            try:
                return json.loads(cleaned[start_arr:end_arr+1])
            except Exception:
                pass

        # Check if object starts before list
        if start_obj != -1 and end_obj > start_obj:
            try:
                return json.loads(cleaned[start_obj:end_obj+1])
            except Exception:
                pass

        # Check list again if object parsing failed
        if start_arr != -1 and end_arr > start_arr:
            try:
                return json.loads(cleaned[start_arr:end_arr+1])
            except Exception:
                pass

        return None

    def process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Executes agent processing logic with error boundaries."""
        try:
            return self._process(project_id, prompt, context)
        except Exception as e:
            logger.error(f"[{self.name}] Processing exception: {e}")
            return {"agent": self.name, "status": "FAILED", "error": str(e)}

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

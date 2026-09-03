import os
import json
import logging
import time
from typing import Dict, Any, List, Optional

logger = logging.getLogger("BaseAgent")

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
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.client = None
        self._is_vertex_active = False
        self._init_gemini_client()

    def _init_gemini_client(self):
        """Initializes the official Google GenAI Client SDK."""
        try:
            from google import genai
            if self.use_vertex and self.google_project:
                self.client = genai.Client(vertexai=True, project=self.google_project, location="us-central1")
                self._is_vertex_active = True
                logger.info(f"[{self.name}] Initialized Google Cloud Vertex AI on project {self.google_project}")
            elif self.api_key:
                self.client = genai.Client(api_key=self.api_key)
                self._is_vertex_active = False
                logger.info(f"[{self.name}] Initialized google-genai SDK with model {self.model_name}")
        except Exception as e1:
            try:
                if self.api_key:
                    import google.generativeai as genai_legacy
                    genai_legacy.configure(api_key=self.api_key)
                    self.legacy_model = genai_legacy.GenerativeModel(
                        model_name=self.model_name,
                        system_instruction=self.system_prompt
                    )
                    logger.info(f"[{self.name}] Initialized legacy google.generativeai SDK with model {self.model_name}")
            except Exception as e2:
                logger.warning(f"[{self.name}] Could not initialize Google GenAI SDK: {e1} / {e2}")

    def call_gemini(self, prompt: str, schema_instruction: str = "") -> Optional[str]:
        """Invoke Google Gemini with resilient model cascade and automatic client switching."""
        if not self.client and not getattr(self, 'legacy_model', None):
            self._init_gemini_client()

        full_prompt = f"""{prompt}

=== MAXIMUM LENGTH & DEPTH DIRECTIVE ===
You are creating a comprehensive, full-length Hollywood cinematic production package.
Produce the LONGEST, most exhaustive, and richly detailed outcome possible:
1. Do NOT summarize, abbreviate, or compress your response.
2. Write deep, multi-paragraph descriptions with visceral, tactile sensory detail.
3. Provide extensive character dialogue with dramatic tension, realistic cadence, subtext, and pauses.
4. Deliver thorough technical camera movements, lens packages, lighting diagrams, sound layers, and editing transitions.
5. Fully utilize the maximum token output capacity.

STRICT SCHEMA REQUIREMENT:
{schema_instruction}
Return ONLY valid JSON matching the specified structure without markdown formatting or conversational commentary.
"""

        # Ultra-resilient cascade of candidate models
        candidate_models = ["gemini-2.5-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.7-flash", "gemini-1.5-flash"]
        if self.model_name in candidate_models:
            candidate_models.remove(self.model_name)
        candidate_models.insert(0, self.model_name)

        for attempt_idx, model_to_try in enumerate(candidate_models):
            try:
                if self.client:
                    response = self.client.models.generate_content(
                        model=model_to_try,
                        contents=full_prompt,
                        config={
                            "system_instruction": self.system_prompt,
                            "max_output_tokens": 8192,
                            "temperature": 0.75
                        }
                    )
                    if response and response.text:
                        logger.info(f"[{self.name}] Successfully generated content using {model_to_try}")
                        return self._clean_json(response.text)

                elif hasattr(self, 'legacy_model') and self.legacy_model:
                    response = self.legacy_model.generate_content(full_prompt)
                    if response and response.text:
                        return self._clean_json(response.text)

            except Exception as e:
                err_str = str(e)
                logger.warning(f"[{self.name}] Model {model_to_try} attempt {attempt_idx+1}/{len(candidate_models)} failed: {err_str[:120]}. Trying next fallback model...")
                time.sleep(1)

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

    def parse_gemini_json(self, json_str: Optional[str]) -> Optional[Dict[str, Any]]:
        """Parses clean JSON string into Python dict or list."""
        if not json_str:
            return None
        try:
            return json.loads(json_str)
        except Exception:
            try:
                start = json_str.find("{")
                end = json_str.rfind("}")
                if start != -1 and end != -1:
                    return json.loads(json_str[start:end+1])
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

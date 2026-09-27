import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("KeyframeAgent")

class KeyframeAgent(BaseAgent):
    """
    Keyframe / Image Prompt Agent: Photo Describer
    Generates detailed single freeze-frame visual descriptions for AI image generation.
    """
    def __init__(self):
        super().__init__(
            name="Keyframe / Image Prompt Agent",
            role="Photo Describer & Visual Prompt Specialist",
            system_prompt="You are the Photo Describer. For each big scene, describe exactly what a single freeze-frame photo of it would look like — camera angle, lighting, colors, what's in the shot — so an AI image tool can draw it accurately."
        )

    def _normalize_gemini_output(self, raw: Any, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        if isinstance(raw, list) and len(raw) > 0:
            return raw
        if isinstance(raw, dict) and "keyframe_prompts" in raw:
            return raw["keyframe_prompts"]
        return self._process("", prompt, context)

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        chars = context.get("characters", [])
        brief = context.get("brief", {})
        title = brief.get("title") or context.get("title") or "UNTITLED FILM"
        p_name = chars[0]["name"] if (chars and isinstance(chars, list) and isinstance(chars[0], dict) and "name" in chars[0]) else (brief.get("protagonist", {}).get("name") if isinstance(brief.get("protagonist"), dict) else f"Hero of {title}")
        scenes = context.get("scenes", []) or context.get("screenplay", [])

        schema = """{
  "keyframe_prompts": [
    {
      "scene_number": 1,
      "title": "string",
      "camera_angle": "string",
      "lighting": "string",
      "color_palette": "string",
      "composition": "string",
      "ai_image_prompt": "string"
    }
  ]
}"""

        gemini_prompt = f"Design cinematic visual concept keyframes for '{title}' featuring protagonist {p_name}.\nScenes: {str(scenes)[:1500]}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if isinstance(parsed, dict):
            for k in ["keyframe_prompts", "keyframes", "frames", "data"]:
                if k in parsed and isinstance(parsed[k], list) and len(parsed[k]) > 0:
                    return parsed[k]
        elif isinstance(parsed, list) and len(parsed) > 0 and "camera_angle" in parsed[0]:
            return parsed

        if scenes and isinstance(scenes, list):
            dynamic_kf = []
            for idx, sc in enumerate(scenes[:4]):
                s_num = sc.get("scene_number", idx + 1)
                s_slug = sc.get("slug") or f"Scene {s_num}"
                s_summary = sc.get("summary") or sc.get("visual_prompt") or f"{p_name} in {s_slug}"
                dynamic_kf.append({
                    "scene_number": s_num,
                    "title": f"Scene {s_num} Keyframe: {s_slug}",
                    "camera_angle": "Cinematic wide angle, 35mm anamorphic widescreen composition",
                    "lighting": "Motivated atmospheric directional lighting with deep chiaroscuro contrast",
                    "color_palette": "Deep obsidian slate, ambient cinematic teal (#0284C7), warm highlight amber (#F59E0B)",
                    "composition": f"{p_name} in {s_slug} amid dramatic visual atmosphere",
                    "ai_image_prompt": f"Cinematic 35mm film still of {p_name} in {s_slug}, {s_summary[:120]}, 8k resolution, photorealistic, anamorphic lens flare --ar 16:9"
                })
            return dynamic_kf

        return [
            {
                "scene_number": 1,
                "title": f"Scene 1 Keyframe: {title} Opening Vista",
                "camera_angle": "Low-angle medium close-up on 35mm prime lens",
                "lighting": "High-contrast cinematic lighting with motivated dramatic backlight",
                "color_palette": "Obsidian charcoal, ambient slate blue, warm rim highlight",
                "composition": f"{p_name} contemplating the journey ahead in {title}",
                "ai_image_prompt": f"Cinematic 35mm film still of {p_name} in {title}, atmospheric production design, authentic film grain, 8k resolution --ar 16:9"
            }
        ]

# Aliases
PhotoDescriberAgent = KeyframeAgent
ConceptArtAgent = KeyframeAgent
KeyframeIllustratorAgent = KeyframeAgent

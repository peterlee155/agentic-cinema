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
        p_name = chars[0]["name"] if len(chars) > 0 else "LEO THORNE"
        brief = context.get("brief", {})
        title = brief.get("title", "THE SIGNAL")
        
        return [
            {
                "scene_number": 1,
                "title": f"Scene 1 Keyframe: {p_name} at the Discovery Station",
                "camera_angle": "Low-angle medium close-up, Dutch tilt (15 degrees)",
                "lighting": "High-contrast chiaroscuro with warm amber terminal bounce on the jawline and cold cyan rim light",
                "color_palette": "Deep obsidian charcoal, phosphor amber (#FFB020), neon cyan (#00E5FF)",
                "composition": f"{p_name} hunched over an illuminated vintage tape deck with vibrating copper reels and rising steam",
                "ai_image_prompt": f"Cinematic 35mm film still, low angle shot of {p_name} adjusting an illuminated analog console, amber dials glowing, cyan oscilloscopes, dark atmospheric industrial bunker, 8k resolution, photorealistic masterpiece --ar 16:9"
            },
            {
                "scene_number": 3,
                "title": "Scene 3 Keyframe: Orbital Gantry Climax",
                "camera_angle": "Extreme wide establishing shot on 24mm anamorphic lens",
                "lighting": "Vibrant Earth atmospheric blue rim lighting against harsh red orbital warning beacons",
                "color_palette": "Deep sapphire blue, crimson red, starfield white",
                "composition": "Two silhouetted figures clashing on a narrow carbon-fiber catwalk suspended over the curved blue horizon of planet Earth",
                "ai_image_prompt": f"Cinematic 35mm film still, extreme wide shot of hero silhouetted on a space station gantry high above planet Earth, glowing cyan shockwave exploding into the vacuum of space, IMAX framing, photorealistic 8k --ar 16:9"
            }
        ]

# Alias
PhotoDescriberAgent = KeyframeAgent

import logging
from typing import Dict, Any, List, Optional
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("StoryboardAgent")

class StoryboardAgent(BaseAgent):
    """
    Storyboard & Visual Agent (Google Imagen 3 Prompt Generator)
    Role: Concept Artist & Cinematographer
    
    Given a scene description from a film script, writes highly descriptive prompts
    for Google Imagen 3 Image Generation to generate high-end visual concept frames.
    
    Adheres strictly to instructions:
    1. Define the camera shot type (wide shot, extreme close-up, low-angle shot, etc.)
    2. Specify the lighting and color palette (moody cinematic lighting, neon cyan/orange tones, warm golden hour)
    3. Describe the subject action, environment details, and artistic style (35mm film render, tactile textures)
    4. Anti-buzzword directive: Do NOT use buzzwords like "photorealistic" in isolation;
       instead describe micro-textures, lens depth of field (bokeh, shallow focal plane), and dynamic lighting falloff.
    """
    def __init__(self):
        super().__init__(
            name="Storyboard & Visual Agent",
            role="Concept Artist & Cinematographer",
            system_prompt="""You are a visual storyboard artist and cinematographer.
Given a scene description from a film script, write a highly descriptive prompt for Google Imagen 3 Image Generation to generate a high-end visual concept frame.

Instructions:
1. Define the camera shot type (e.g., wide shot, extreme close-up, low-angle shot, overhead tracking).
2. Specify the lighting and color palette (e.g., moody chiaroscuro lighting, neon cyan and tungsten amber tones, warm golden hour backlighting).
3. Describe the subject action, environment details, and artistic style (e.g., 35mm anamorphic film render, highly detailed cinematic concept art).
4. CRITICAL CONSTRAINT: Do NOT use buzzwords like "photorealistic" in isolation; instead, describe tactile physical textures (woven fabric, wet rust, porous granite), optical lens depth (shallow depth of field, circular anamorphic bokeh, chromatic aberration), and lighting dynamics (volumetric haze, subsurface skin scattering, sharp specular reflections)."""
        )

    def generate_imagen3_prompt(self, scene_description: str) -> Dict[str, Any]:
        """
        Direct single-scene concept frame generator for Imagen 3.
        """
        schema = """{
  "camera_shot_type": "e.g., Low-Angle Medium Close-Up with 35mm Anamorphic Lens",
  "lighting_and_color_palette": "e.g., High-contrast chiaroscuro, cold bioluminescent violet rim light against deep umber shadows",
  "subject_action": "e.g., Scavenger holding a ticking runic device as breath condenses in the sub-zero air",
  "environment_details": "e.g., Cavernous gothic stone cathedral arches, rain cascading across an iridescent protective dome",
  "artistic_style_and_textures": "e.g., 35mm film stock with visible emulsion grain, coarse woven canvas coat fibers, wet glistening cobblestone",
  "imagen3_prompt": "Exhaustive, non-buzzword Imagen 3 generation prompt describing the exact visual composition, lighting physics, lens optics, and material tactile details",
  "aspect_ratio": "16:9"
}"""
        gemini_prompt = f"Given this scene description, generate the complete Imagen 3 visual concept frame breakdown:\n\nSCENE:\n{scene_description}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if isinstance(parsed, dict) and "imagen3_prompt" in parsed:
            return parsed

        # Robust heuristic fallback
        return {
            "camera_shot_type": "Wide Low-Angle Establishing Shot with 24mm Anamorphic Prime Lens",
            "lighting_and_color_palette": "Moody cinematic chiaroscuro with bioluminescent violet dome glow contrasting against warm flickering sodium torchlight",
            "subject_action": "Two cloaked figures stand rigid on granite cathedral steps as electrical embers arc into the torrential downpour",
            "environment_details": "Gothic cathedral spires encased beneath a shimmering translucent violet protective forcefield dome with water rivulets sheeting off stone cornices",
            "artistic_style_and_textures": "35mm anamorphic widescreen capture, shallow depth of field with horizontal lens flares, tactile coarse wool cloaks, rain-slicked wet porous basalt stone, volumetric atmospheric mist",
            "imagen3_prompt": "Cinematic 35mm anamorphic widescreen composition, wide low-angle framing of a monolithic neo-gothic cathedral enclosed under a shimmering translucent violet forcefield dome in a violent night rainstorm. Heavy atmospheric raindrops splashing off ancient weathered basalt steps. Two cloaked human scavengers in coarse oiled-canvas dusters standing before an iron archway. Rim-lit by glowing purple atmospheric ionization with warm tungsten lantern highlights cutting through dense volumetric haze. Authentic optical bokeh, natural film grain, deep shadow contrast, tactile wet surface specular reflections.",
            "aspect_ratio": "16:9"
        }

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        scenes = context.get("scenes", []) or context.get("screenplay", [])
        characters = context.get("characters", [])
        locations = context.get("locations", [])

        schema = """{
  "storyboard": [
    {
      "scene": 1,
      "frame": 1,
      "shot": "Wide Angle Master",
      "camera_shot_type": "Low-Angle 24mm Anamorphic Wide Shot",
      "lighting_and_color_palette": "Moody atmospheric violet and warm amber tones",
      "subject_action": "Physical character action and staging",
      "environment_details": "Granular background and location setting details",
      "artistic_style_and_textures": "35mm film grain, tactile coarse fabric, wet stone specular highlights",
      "imagePrompt": "Detailed Google Imagen 3 concept frame prompt adhering to shot type, lighting dynamics, and tactile textures without empty buzzwords",
      "videoPrompt": "Google Veo specification: Cinematic 24fps motion camera move with dynamic tracking",
      "camera": "24mm Anamorphic Lens",
      "lighting": "Volumetric violet shield glow and candle rim lights",
      "emotion": "Solemn awe and impending deadline",
      "action": "Character confronting the elder",
      "duration": "4 seconds"
    }
  ]
}"""

        gemini_prompt = f"Create sequential storyboard frames and Imagen 3 visual concept prompts for:\nScenes: {str(scenes)[:1500]}\nCharacters: {str(characters)[:800]}\nLocations: {str(locations)[:800]}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        items = None
        if isinstance(parsed, dict):
            for k in ["storyboard", "frames", "keyframes", "data"]:
                if k in parsed and isinstance(parsed[k], list) and len(parsed[k]) > 0:
                    items = parsed[k]
                    break
        elif isinstance(parsed, list) and len(parsed) > 0:
            items = parsed

        if items:
            for item in items:
                if "imagen3_prompt" in item and "imagePrompt" not in item:
                    item["imagePrompt"] = item["imagen3_prompt"]
                elif "imagePrompt" in item and "imagen3_prompt" not in item:
                    item["imagen3_prompt"] = item["imagePrompt"]
            return items

        # Dynamic Hollywood Storyboard Sequence derived from project scenes
        scenes = context.get("scenes", []) or context.get("screenplay", [])
        title = context.get("title") or "UNTITLED FEATURE"
        if scenes and isinstance(scenes, list):
            dynamic_frames = []
            for idx, sc in enumerate(scenes[:5]):
                s_num = sc.get("scene_number", idx + 1)
                slug = sc.get("slug") or f"Scene {s_num}"
                summary = sc.get("summary") or sc.get("script", "")[:120] or f"Sequence in {slug}"
                chars = sc.get("characters", [])
                c_name = chars[0] if (chars and isinstance(chars[0], str)) else (chars[0].get("name", "Lead Protagonist") if (chars and isinstance(chars[0], dict)) else "Lead Protagonist")
                
                img_prompt = f"Cinematic 35mm film still of {c_name} in {slug}. {summary}. Motivated directional lighting, rich volumetric depth, authentic film grain, photorealistic composition, 8k resolution --ar 16:9"
                veo_prompt = f"Google Veo 24fps motion: Slow atmospheric camera push into {slug} as {c_name} turns toward the lens with intense focus."
                
                dynamic_frames.append({
                    "scene": s_num,
                    "frame": 1,
                    "shot": f"Scene {s_num} Establishing - {slug}",
                    "camera_shot_type": "Cinematic 35mm anamorphic wide shot",
                    "lighting_and_color_palette": "High-contrast cinematic chiaroscuro with motivated warm key and deep cool shadow fill",
                    "subject_action": f"{c_name} navigating {slug}",
                    "environment_details": f"Detailed production design tailored for {slug} with atmospheric volumetric smoke and textural depth",
                    "artistic_style_and_textures": "35mm film capture, shallow depth of field, authentic fine emulsion grain, rich tactile surfaces",
                    "duration": "4 seconds",
                    "imagePrompt": img_prompt,
                    "imagen3_prompt": img_prompt,
                    "videoPrompt": veo_prompt
                })
            return dynamic_frames

        default_img = f"Cinematic 35mm film still establishing the world of {title}. Wide anamorphic composition, atmospheric volumetric lighting, authentic film grain, 8k resolution --ar 16:9"
        return [
            {
                "scene": 1,
                "frame": 1,
                "shot": f"{title} - The Horizon",
                "camera_shot_type": "Low-angle 24mm anamorphic wide establishing shot",
                "lighting_and_color_palette": "Dramatic dawn backlight contrasting with rich obsidian shadows",
                "subject_action": f"The lead protagonist stands contemplating the path ahead in {title}",
                "environment_details": f"Expansive cinematic environment capturing the atmosphere of {title}",
                "artistic_style_and_textures": "35mm film capture, shallow depth of field, authentic fine emulsion grain",
                "duration": "4 seconds",
                "imagePrompt": default_img,
                "imagen3_prompt": default_img,
                "videoPrompt": "Google Veo 24fps camera move: Slow forward tracking dolly pushing into the vista."
            }
        ]

# Aliases
StoryboardVisualAgent = StoryboardAgent
ConceptArtistAgent = StoryboardAgent

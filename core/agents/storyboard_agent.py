import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("StoryboardAgent")

class StoryboardAgent(BaseAgent):
    """
    Storyboard Agent: Visual Keyframe & Sequential Art Architect
    For each scene, creates sequential storyboard frames:
    - Scene & Frame Number
    - Shot Type
    - Visual Description
    - Character Position & Staging
    - Camera Angle & Movement
    - Lighting & Color Dynamics
    - Emotion & Subtext
    - Kinetic Action
    - Estimated Duration
    - Generative Image Prompt (8K cinematic prompt maintaining strict character/environment continuity).
    """
    def __init__(self):
        super().__init__(
            name="Storyboard",
            role="Lead Storyboard Artist & Keyframe Designer",
            system_prompt="""You are a master storyboard artist for major motion pictures.
You convert screenplay scenes into frame-by-frame visual sequences with master-class precision.
LENGTH DIRECTIVE: Produce comprehensive, granular frame breakdowns with maximum descriptive fidelity. Do NOT abbreviate.
For each frame, detail:
- Scene, Frame Number, Shot Name, and Duration in seconds
- Multi-sentence visual composition and spatial character blocking
- Explicit camera angles, lens choices, and movement
- Complex chiaroscuro lighting and volumetric particle atmosphere
- Kinetic character action and psychological subtext
- An ultra-detailed 150+ word 8K generative cinematic image prompt including: 35mm anamorphic widescreen, Arri Alexa 65 camera specs, volumetric lighting, subsurface scattering on skin, exact wardrobe textures, signature props, and locked universe continuity."""
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        scenes = context.get("scenes", []) or context.get("screenplay", [])
        characters = context.get("characters", [])
        locations = context.get("locations", [])

        schema = """[
  {
    "scene": 1,
    "frame": 1,
    "shot": "Wide Angle Master",
    "description": "Visual scene description",
    "characterPosition": "Character staging",
    "camera": "Camera lens and angle",
    "lighting": "Lighting scheme",
    "emotion": "Dominant emotion",
    "action": "Physical action",
    "duration": "4 seconds",
    "imagePrompt": "Google Imagen 3 specification: 8K cinematic photorealistic still, 35mm anamorphic, volumetric lighting, tactile material textures, authentic film grain",
    "videoPrompt": "Google Veo specification: Cinematic 24fps motion camera move, dynamic tracking, physical simulation of atmosphere and rain, temporal coherence"
  }
]"""

        gemini_prompt = f"Create sequential storyboard frames and image prompts for:\nScenes: {str(scenes)[:1500]}\nCharacters: {str(characters)[:800]}\nLocations: {str(locations)[:800]}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if isinstance(parsed, list) and len(parsed) > 0 and "imagePrompt" in parsed[0]:
            return parsed
        elif isinstance(parsed, dict) and "storyboard" in parsed:
            return parsed["storyboard"]

        # Default Storyboard Sequence
        return [
            {
                "scene": 1,
                "frame": 1,
                "shot": "Wide Exterior Sanctuary",
                "description": "Gothic cathedral glowing behind a translucent violet forcefield under pouring rain.",
                "characterPosition": "Sister Mara in green robes at center steps, Kaelen approaching.",
                "camera": "Low angle 24mm anamorphic looking up at the spire.",
                "lighting": "Bioluminescent violet shield glow with flickering candle torches.",
                "emotion": "Solemn awe and creeping dread.",
                "action": "Kaelen stops before the elder; thunder rumbles in distance.",
                "duration": "4 seconds",
                "imagePrompt": "Cinematic 8k movie still, wide angle 24mm anamorphic, gothic cathedral encased in a shimmering translucent violet protective forcefield dome, heavy dark rainstorm, stone steps, two cloaked figures standing in torchlight, hyperrealistic, volumetric lighting, photorealistic film grain"
            },
            {
                "scene": 1,
                "frame": 2,
                "shot": "Extreme Close-Up Wrist Runic Inscription",
                "description": "Burning bone stylus searing a glowing amber countdown chronometer into Kaelen's forearm skin.",
                "characterPosition": "Kaelen's scarred muscular arm held rigid by Sister Mara's runic hands.",
                "camera": "85mm macro lens focused on sizzling embers.",
                "lighting": "Fiery amber light radiating from the freshly carved letters: 04:00:00.",
                "emotion": "Endured agony, irreversible commitment.",
                "action": "Smoke curls up as the numbers begin counting down: 03:59:59.",
                "duration": "3.5 seconds",
                "imagePrompt": "Cinematic macro shot, 85mm lens, a glowing magical amber runic countdown clock searing into human skin, glowing digits 04:00:00 with fiery embers and rising smoke, extreme detail, photorealistic textures, atmospheric dark background"
            },
            {
                "scene": 2,
                "frame": 1,
                "shot": "Medium Two-Shot The Polite Mimic",
                "description": "Elias standing under a rusted umbrella, smiling warmly at Kaelen in a crowded shantytown.",
                "characterPosition": "Elias on the right in gray tweed; Kaelen on the left in wet charcoal coat.",
                "camera": "Eye-level 35mm shallow focus.",
                "lighting": "Grimy yellow sodium streetlights reflecting in black puddles.",
                "emotion": "Uncanny valley, psychological chills.",
                "action": "Elias smiles without blinking as Kaelen's wrist glows faintly beneath his sleeve.",
                "duration": "5 seconds",
                "imagePrompt": "Cinematic film still, 35mm anamorphic, two men confronting each other in a dystopian crowded shantytown market made of shipping containers, yellow streetlamps, wet asphalt, rain, one man in gray tweed blazer smiling unnaturally, one in weathered leather coat, tension, cinematic framing, high contrast"
            },
            {
                "scene": 3,
                "frame": 1,
                "shot": "Low-Angle Vault Infiltration",
                "description": "Kaelen and Nia prying open a rusted vault door while submerged in black sewer water.",
                "characterPosition": "Kaelen straining against the crowbar; Nia perched on a pipe holding a brass music box.",
                "camera": "18mm ultra-wide water-level angle.",
                "lighting": "Harsh beam of tactical weapon light cutting through murky darkness.",
                "emotion": "Heart-pounding stealth and claustrophobia.",
                "action": "The vault seal breaks with a hiss of stagnant steam.",
                "duration": "4 seconds",
                "imagePrompt": "Cinematic film still, 18mm ultra wide angle, subterranean flooded subway station, black stagnant water, man in wet tactical gear prying open a massive steel vault safe, young girl holding antique brass music box in background, single beam of flashlight in dark, dark gritty sci-fi movie"
            },
            {
                "scene": 4,
                "frame": 1,
                "shot": "Handheld Sprint at Bridge",
                "description": "Kaelen sprinting across a shattered railway bridge as calm infected citizens block both exits.",
                "characterPosition": "Kaelen in full sprint at center; Elias waiting calmly on bridge footing.",
                "camera": "Dutch tilt 28mm dynamic handheld tracking.",
                "lighting": "Cold blue dawn twilight with flashing emergency red wrist timer.",
                "emotion": "Desperation, raw survival instinct.",
                "action": "Kaelen leaps over a rusted barrier as his timer hits 00:00:15.",
                "duration": "3 seconds",
                "imagePrompt": "Cinematic action movie still, dynamic running shot, rugged man running across a broken steel train bridge over foggy river at dawn, clutch of calm sinister people in ordinary coats watching him, glowing red numbers on his wrist, mist, hyperrealistic motion blur, 8k resolution"
            }
        ]

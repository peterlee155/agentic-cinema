import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("CinematographerAgent")

class CinematographerAgent(BaseAgent):
    """
    Cinematographer Agent: Director of Photography (DoP)
    Determines for every major scene:
    - Shot Type & Framing
    - Lens Selection (Focal length, spherical vs. anamorphic, optical flares)
    - Camera Height & Tilt
    - Camera Movement & Rig (Dolly, Steadicam, Technocrane, Handheld)
    - Composition (Dynamic tension, symmetry, lead room)
    - Depth of Field (f-stop, hyperfocal focus vs. razor-thin bokeh)
    - Lighting Setup (Key, fill, back light, practical fixtures, volumetric diffusion)
    - Color Treatment (LUT, color temperature, split toning)
    - Mood & Sensory Impact
    Builds a unified visual grammar and optical consistency.
    """
    def __init__(self):
        super().__init__(
            name="Cinematographer",
            role="Director of Photography (DoP)",
            system_prompt="""You are an ASC-accredited Director of Photography.
Your mission is to establish the complete, exhaustive optical and lighting blueprint for the movie.
LENGTH DIRECTIVE: Produce comprehensive, highly detailed technical optical treatments. Do NOT abbreviate.
For each scene, specify:
- Precise lens packages (e.g. Arri Master Anamorphic 24mm, 50mm, 85mm T1.9)
- Exact T-stop and depth of field (e.g. razor-thin bokeh with rack focus vs. deep focus hyperfocal split)
- Intricate multi-point lighting blueprints (Key, fill ratios, tungsten practicals, volumetric atmospheric haze, Kelvin temperatures 2800K to 5600K)
- Camera support rigs (Technocrane, Chapman Peewee dolly, Trinity Steadicam)
- Detailed color grading LUT treatments and visual grain structure."""
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        scenes = context.get("scenes", []) or context.get("screenplay", [])
        visual_style = context.get("brief", {}).get("visualStyle", "35mm anamorphic")

        schema = """[
  {
    "scene": "Scene or Environment Name",
    "lensChoice": "e.g. 24mm & 40mm Master Anamorphic T1.9",
    "cameraHeight": "Chest Level & Low Angle Hero",
    "cameraMovement": "Steadicam lateral tracking",
    "composition": "Asymmetric negative space with rule of thirds",
    "depthOfField": "Shallow focus f/1.8 with amber oval bokeh",
    "lighting": "Low-key Chiaroscuro with volumetric haze and practical sodium lantern",
    "colorTreatment": "Warm candle amber against deep indigo shadows",
    "mood": "Sacred, claustrophobic, endangered"
  }
]"""

        gemini_prompt = f"Create cinematography plans for:\nVisual Style: {visual_style}\nScenes: {str(scenes)[:1500]}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if isinstance(parsed, list) and len(parsed) > 0 and "lensChoice" in parsed[0]:
            return parsed
        elif isinstance(parsed, dict) and "cinematography" in parsed:
            return parsed["cinematography"]

        # Default Cinematography Language
        return [
            {
                "scene": "Cathedral & Sanctuary (Scenes 1 & 5)",
                "lensChoice": "24mm & 40mm Master Anamorphic T1.9",
                "cameraHeight": "Chest Level & Low Angle Hero",
                "cameraMovement": "Slow deliberate crane and Steadicam gliding",
                "composition": "Grand Gothic symmetry framed between pulsing copper conduits",
                "depthOfField": "Deep focus on architectural stone, shallow on character portraits",
                "colorTreatment": "Rich beeswax gold, warm candle amber, and deep indigo shadow rolloff",
                "mood": "Sacred, reverent, highly endangered sanctuary"
            },
            {
                "scene": "Limbo Bazaar (Scene 2)",
                "lensChoice": "35mm & 50mm Anamorphic T2.0",
                "cameraHeight": "Eye Level Steadicam",
                "cameraMovement": "Continuous lateral track walking in lockstep with characters",
                "composition": "Paranoid foreground occlusion; crowded shipping container corridors",
                "depthOfField": "Shallow focus to compress paranoia in crowded corridors",
                "colorTreatment": "Sodium vapor yellow, wet asphalt slate, dirty emerald green tarps",
                "mood": "Corrosive distrust, deceptive safety, uncanny normalcy"
            },
            {
                "scene": "Metro Vaults & Dead Ruins (Scenes 3 & 4)",
                "lensChoice": "18mm Ultra-Wide & 85mm Macro T1.4",
                "cameraHeight": "Floor Level Looking Up / Handheld Shoulder Mount",
                "cameraMovement": "Creeping stealth push-in shifting to kinetic sprinting handheld",
                "composition": "High-contrast geometric diagonals formed by subway rails and dripping pipes",
                "depthOfField": "Razor-thin depth of field highlighting the wrist countdown",
                "colorTreatment": "Monochromatic cold steel, pitch shadow, scorching emergency red",
                "mood": "Suffocating dread, ticking clock urgency, visceral terror"
            }
        ]

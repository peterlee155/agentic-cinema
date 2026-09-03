import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("DirectorAgent")

class DirectorAgent(BaseAgent):
    """
    Director Agent: Visionary Directorial Orchestrator
    Input: Screenplay scenes from Screenwriter Agent.
    Generates professional director shot lists and staging breakdowns:
    - Shot & Shot Type (Extreme Wide, Low-Angle Medium, Dutch Angle Macro, etc.)
    - Camera Position & Elevation
    - Camera Movement (Dolly In, Steadicam Lateral Track, Whip Pan, Jib Arm Descent)
    - Lens (e.g., 24mm Master Anamorphic, 40mm Cooke S4, 85mm Prime Hero)
    - Composition (Rule of Thirds, Leading Lines, Negative Space)
    - Blocking (Actor choreography and spatial power dynamics)
    - Lighting (Chiaroscuro, Sodium Vapor, Volumetric Rim Light)
    - Pacing (Tempo, Staccato cuts vs. fluid long takes)
    - Visual Emphasis (Subtextual visual anchors)
    """
    def __init__(self):
        super().__init__(
            name="Director",
            role="Lead Director & Visual Maestro",
            system_prompt="""You are a visionary feature film director.
Your mandate is to take the screenplay scenes and create an authoritative, master-class directorial shot list and staging plan.
LENGTH DIRECTIVE: Provide an EXHAUSTIVE, highly granular breakdown for every scene. Do NOT abbreviate.
For each shot, specify:
- Specific focal lengths (e.g. 24mm Anamorphic, 85mm Prime, 135mm Macro)
- Dynamic camera movement (Technocrane descents, Steadicam orbit, hand-held visceral tracking)
- Spatial actor blocking and power dynamics across the room/environment
- Complex multi-point lighting schematics (key, fill, chiaroscuro rim, atmospheric haze)
- Temporal pacing and visual subtext anchors.
Translate narrative conflict into kinetic visual staging with maximum detail."""
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        scenes = context.get("scenes", []) or context.get("screenplay", [])
        
        schema = """[
  {
    "sceneNumber": 1,
    "shotNumber": 1,
    "shotType": "Extreme Wide Shot",
    "cameraPosition": "High Angle Crane 30ft",
    "cameraMovement": "Slow descent through atmospheric rain toward cathedral gates",
    "lens": "24mm Anamorphic Widescreen",
    "composition": "Cathedral spire dominates right third; glowing barrier arcs across upper quadrant",
    "blocking": "Sister Mara stands centered before the heavy wooden doors; Kaelen kneels before her",
    "lighting": "Chiaroscuro with glowing violet rim light from the shield",
    "pacing": "Deliberate, ritualistic, solemn",
    "visualEmphasis": "The frailty of human skin against the massive supernatural shield"
  }
]"""

        gemini_prompt = f"Create director shot lists for these scenes:\n{str(scenes)[:2000]}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if isinstance(parsed, list) and len(parsed) > 0 and "cameraPosition" in parsed[0]:
            return parsed
        elif isinstance(parsed, dict) and "shots" in parsed:
            return parsed["shots"]

        # Default Director Shot List
        return [
            {
                "sceneNumber": 1,
                "shotNumber": 1,
                "shotType": "Extreme Wide Shot",
                "cameraPosition": "High Angle Crane",
                "cameraMovement": "Slow descent through rain toward cathedral gates",
                "lens": "24mm Anamorphic",
                "composition": "Cathedral spire dominates right third; glowing barrier arcs across upper quadrant",
                "blocking": "Sister Mara stands centered before the heavy wooden doors; Kaelen kneels before her",
                "lighting": "Chiaroscuro with glowing violet rim light from the shield",
                "pacing": "Deliberate, ritualistic, reverent",
                "visualEmphasis": "The frailty of human skin against the massive supernatural shield"
            },
            {
                "sceneNumber": 1,
                "shotNumber": 2,
                "shotType": "Extreme Close-Up",
                "cameraPosition": "Eye-level Macro",
                "cameraMovement": "Locked off",
                "lens": "85mm Prime Macro",
                "composition": "Kaelen's forearm filling entire screen",
                "blocking": "Stylus carves into flesh; runic embers flare",
                "lighting": "Self-illuminating amber glyph burning at 04:00:00",
                "pacing": "Intense, tactile, visceral",
                "visualEmphasis": "The tangible, biological cost of survival magic"
            },
            {
                "sceneNumber": 2,
                "shotNumber": 1,
                "shotType": "Medium Tracking Shot",
                "cameraPosition": "Steadicam waist height",
                "cameraMovement": "Continuous lateral track walking with Kaelen",
                "lens": "35mm Prime",
                "composition": "Kaelen framed tight in foreground; background bustling with questionable survivors",
                "blocking": "Elias steps into frame from right side, matching Kaelen's walking pace seamlessly",
                "lighting": "Murky yellow sodium vapor reflections in puddles",
                "pacing": "Restless, paranoid, claustrophobic",
                "visualEmphasis": "The terrifying normalcy of the infected mimics"
            },
            {
                "sceneNumber": 3,
                "shotNumber": 1,
                "shotType": "Low-Angle Dutch Tilt",
                "cameraPosition": "Floor level submerged track",
                "cameraMovement": "Creeping push-in past submerged subway ties",
                "lens": "18mm Ultra-Wide",
                "composition": "Vault hatch towering ominously overhead; Nia crouched in shadow",
                "blocking": "Kaelen leverages crowbar with back muscles straining against camera",
                "lighting": "Faint amber glow from Kaelen's wrist battling deep pitch-black gloom",
                "pacing": "Suffocating, quiet, razor-sharp tension",
                "visualEmphasis": "The looming vulnerability of the acoustic resonance vault"
            },
            {
                "sceneNumber": 4,
                "shotNumber": 1,
                "shotType": "Handheld Over-The-Shoulder Sprint",
                "cameraPosition": "Shoulder mount behind Kaelen",
                "cameraMovement": "Urgent kinetic handheld chase through floodwater",
                "lens": "28mm Anamorphic",
                "composition": "Shaking horizon line; countdown clock bouncing into focus every few strides",
                "blocking": "Elias standing dead still while water churns around him",
                "lighting": "Cold dawn light cutting through smoke; flashing red warning hue on wrist",
                "pacing": "Frantic, breath-stealing adrenaline",
                "visualEmphasis": "The final 30 seconds of human identity slipping away"
            }
        ]

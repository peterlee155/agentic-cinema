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
        
        schema = """{
  "shots": [
    {
      "sceneNumber": 1,
      "shotNumber": 1,
      "shotType": "Extreme Wide Shot",
      "cameraPosition": "High Angle Crane 30ft",
      "cameraMovement": "Slow deliberate tracking push into the scene",
      "lens": "24mm Anamorphic Widescreen",
      "composition": "Establishing wide perspective with protagonist anchored on the rule of thirds",
      "blocking": "Lead character pauses at the entrance, surveying the room",
      "lighting": "Motivated atmospheric chiaroscuro with soft warm key and deep cool shadows",
      "pacing": "Deliberate, cinematic, immersive",
      "visualEmphasis": "The dramatic contrast between the character and their environment"
    }
  ]
}"""

        gemini_prompt = f"Create director shot lists for these scenes:\n{str(scenes)[:2000]}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if isinstance(parsed, dict):
            for k in ["shots", "shotList", "shot_list", "data"]:
                if k in parsed and isinstance(parsed[k], list) and len(parsed[k]) > 0:
                    return parsed[k]
        elif isinstance(parsed, list) and len(parsed) > 0 and "cameraPosition" in parsed[0]:
            return parsed

        # Dynamic Director Shot List derived from project scenes
        scenes = context.get("scenes", []) or context.get("screenplay", [])
        title = context.get("title") or "UNTITLED FILM"
        if scenes and isinstance(scenes, list):
            dynamic_shots = []
            for idx, sc in enumerate(scenes[:5]):
                s_num = sc.get("scene_number", idx + 1)
                slug = sc.get("slug") or f"Scene {s_num}"
                chars = sc.get("characters", [])
                c_name = chars[0] if (chars and isinstance(chars[0], str)) else (chars[0].get("name", "Lead Character") if (chars and isinstance(chars[0], dict)) else "Lead Character")
                dynamic_shots.append({
                    "sceneNumber": s_num,
                    "shotNumber": 1,
                    "shotType": "Establishing Wide Shot",
                    "cameraPosition": "Eye-level 35mm Anamorphic",
                    "cameraMovement": "Slow deliberate tracking push into the space",
                    "lens": "35mm Anamorphic Prime",
                    "composition": f"{slug} with {c_name} anchored in the lower-third power point",
                    "blocking": f"{c_name} surveying the perimeter of {slug}",
                    "lighting": "Atmospheric chiaroscuro with motivated directional practicals",
                    "pacing": "Deliberate, cinematic, immersive",
                    "visualEmphasis": f"Establishing the scale and tension of {slug}"
                })
                dynamic_shots.append({
                    "sceneNumber": s_num,
                    "shotNumber": 2,
                    "shotType": "Medium Close-Up",
                    "cameraPosition": "Steadicam chest height",
                    "cameraMovement": "Subtle lateral handheld drift",
                    "lens": "50mm High-Speed Prime",
                    "composition": f"Tight framing on {c_name}'s expressive eyes and posture",
                    "blocking": f"{c_name} reacting to immediate dramatic developments in the space",
                    "lighting": "Warm key with cold cinematic rim fill",
                    "pacing": "Intimate, high-stakes dramatic focus",
                    "visualEmphasis": "Subtle actor micro-expressions and emotional weight"
                })
            return dynamic_shots

        return [
            {
                "sceneNumber": 1,
                "shotNumber": 1,
                "shotType": "Extreme Wide Shot",
                "cameraPosition": "High Angle Crane",
                "cameraMovement": f"Slow descent toward the opening vista of {title}",
                "lens": "24mm Anamorphic",
                "composition": f"Expansive horizon of {title} with lone figure in foreground",
                "blocking": "Lead character pauses, looking out toward the challenge ahead",
                "lighting": "High-contrast cinematic backlight",
                "pacing": "Deliberate, epic, atmospheric",
                "visualEmphasis": f"Scale of the world in {title}"
            }
        ]

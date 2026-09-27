import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("DanceAgent")

class DanceAgent(BaseAgent):
    """
    Dance & Movement Choreography Agent
    Creates short, high-energy dance and movement concepts inspired by the movie.
    For each concept generates:
    - Title
    - Duration (15-30s)
    - Character association
    - Music Style & BPM
    - Mood
    - Concept Theme
    - 4-Part Beat Structure:
        * 0–3 seconds: Hook
        * 3–7 seconds: Main movement
        * 7–11 seconds: Signature movement
        * 11–15 seconds: Final pose
    - Detailed Choreography instructions
    - Camera & Framing specifications
    - Caption, CTA, and Hashtags
    CRITICAL RULE: Never guarantee virality. Frame as creative engagement.
    """
    def __init__(self):
        super().__init__(
            name="Dance Agent",
            role="Movement Choreographer & Trend Architect",
            system_prompt="""You are an innovative movement director and viral dance choreographer for entertainment campaigns.
Design rhythmic, replicable 15-second dance concepts inspired by the film's lore and kinetic moments.
Rigorously adhere to the 4-part beat structure:
0-3s: The Hook (instant attention grabber)
3-7s: Main movement (fluid, repeatable groove)
7-11s: Signature movement (distinctive viral motif)
11-15s: Final pose (arresting freeze frame)
Specify music style, BPM, camera framing, caption, CTA, and hashtags.
NEVER claim or guarantee virality."""
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        title = context.get("brief", {}).get("title") or context.get("title") or "UNTITLED FILM"
        schema = """{
  "danceConcepts": [
    {
      "title": "string",
      "duration": "15 seconds",
      "character": "string",
      "musicStyle": "string",
      "bpm": 130,
      "mood": "string",
      "concept": "string",
      "beatStructure": {
        "0_to_3s": "The Hook",
        "3_to_7s": "Main movement",
        "7_to_11s": "Signature movement",
        "11_to_15s": "Final pose"
      },
      "choreography": "string",
      "camera": "string",
      "framing": "string",
      "caption": "string",
      "cta": "string",
      "hashtags": ["#Tag"]
    }
  ]
}"""

        gemini_prompt = f"Design dance concepts for '{title}' with BPM and beat structure."
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if isinstance(parsed, dict):
            for k in ["danceConcepts", "dance_concepts", "concepts", "data"]:
                if k in parsed and isinstance(parsed[k], list) and len(parsed[k]) > 0:
                    return parsed[k]
        elif isinstance(parsed, list) and len(parsed) > 0 and "beatStructure" in parsed[0]:
            return parsed

        brief = context.get("brief", {})
        title = brief.get("title") or context.get("title") or "UNTITLED FILM"
        clean_tag = "".join(w.capitalize() for w in title.split() if w.isalnum())
        protagonist = brief.get("protagonist", {}).get("name") if isinstance(brief.get("protagonist"), dict) else "Lead Performer"

        # Dynamic Dance Concepts
        return [
            {
                "title": f"The {title} Anthem Groove",
                "duration": "15 seconds",
                "character": protagonist,
                "musicStyle": "Cinematic Electronic / High-Energy Rhythm",
                "bpm": 128,
                "mood": "Confident, stylized, dynamic, captivating",
                "concept": f"Dynamic rhythmic movements inspired by the emotional themes of {title}.",
                "beatStructure": {
                    "0_to_3s": f"THE HOOK: Direct eye contact into camera with sharp syncopated shoulder accents reflecting {title}.",
                    "3_to_7s": "MAIN MOVEMENT: Fluid rotational footwork and body wave transitioning across the frame.",
                    "7_to_11s": "SIGNATURE MOVEMENT: Distinctive stylized gestural sequence echoing the project motif.",
                    "11_to_15s": "FINAL POSE: Striking freeze frame with high-tension silhouette lighting."
                },
                "choreography": "Modern street movement and theatrical physical storytelling accessible for audience duets.",
                "camera": "Dynamic handheld tracking shot following the cadence of the dancer.",
                "framing": "9:16 vertical orientation with motivated rim lighting.",
                "caption": f"Can you master the {title} Anthem Groove? Show us your take! 🎬🔥",
                "cta": "Duet this video and bring your own energy.",
                "hashtags": [f"#{clean_tag}Dance", "#DanceTrend", "#AgenticCinema", "#MovementChoreography"]
            }
        ]

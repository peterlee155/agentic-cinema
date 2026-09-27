import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("ArtDirectorAgent")

class ArtDirectorAgent(BaseAgent):
    """
    Art Director Agent: Production Designer & World Stylist
    Creates the Production Visual Bible:
    - Characters: Name, Age, Appearance, Hair, Clothing, Props, Color Palette, Visual Evolution.
    - Locations: Architecture, Geography, Weather, Materials, Objects, Lighting, Color Palette.
    Maintains rigid visual consistency and design aesthetics across all assets.
    """
    def __init__(self):
        super().__init__(
            name="Art Director",
            role="Production Designer & Visual Stylist",
            system_prompt="""You are a world-renowned Film Production Designer and Art Director.
Your task is to establish the complete, exhaustive visual bible for all characters and locations.
LENGTH DIRECTIVE: Provide deep, granular descriptions with maximum visual richness. Do NOT abbreviate.
For Characters: Detail exact physical features, scars, gait, hair styling, multi-layer wardrobe (fabrics, stitching, distress aging), signature props with intricate mechanical or historical backstories, explicit color palettes with hex codes, and a detailed chronological Visual Evolution explaining how trauma and environment physically alter them.
For Locations: Detail complete architectural styles, structural materials, environmental weathering, ambient micro-climates, key interactive objects, lighting color temperature, and atmospheric mood.
Ensure absolute visual continuity across the entire universe."""
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        brief = context.get("brief", {})
        scenes = context.get("scenes", []) or context.get("screenplay", [])

        schema = """{
  "characters": [
    {
      "name": "string",
      "age": 30,
      "role": "string",
      "appearance": "string",
      "hair": "string",
      "clothing": "string",
      "props": "string",
      "colorPalette": "string",
      "visualEvolution": "string"
    }
  ],
  "locations": [
    {
      "name": "string",
      "architecture": "string",
      "geography": "string",
      "weather": "string",
      "materials": "string",
      "objects": "string",
      "lighting": "string",
      "colorPalette": "string"
    }
  ]
}"""

        gemini_prompt = f"Design visual characters and locations for:\nTitle: {brief.get('title')}\nLogline: {brief.get('logline')}\nScenes: {str(scenes)[:1500]}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if parsed and "characters" in parsed and "locations" in parsed:
            return parsed

        # Default Production Visual Bible dynamically derived from project brief
        title = brief.get("title", "UNTITLED FILM")
        p_name = brief.get("protagonist", {}).get("name") if isinstance(brief.get("protagonist"), dict) else f"Hero of {title}"
        return {
            "characters": [
                {
                    "name": p_name,
                    "age": 32,
                    "role": "Lead Protagonist",
                    "appearance": f"Distinctive, commanding presence reflecting the world of {title}.",
                    "hair": "Neatly styled dark hair.",
                    "clothing": "High-contrast cinematic attire tailored to the environment.",
                    "props": "Key signature item central to the narrative mission.",
                    "colorPalette": "#1E293B (Slate Navy), #F59E0B (Warm Amber)",
                    "visualEvolution": "Displays visual transformation reflecting their emotional arc across the story."
                },
                {
                    "name": "The Guide",
                    "age": 45,
                    "role": "Trusted Ally & Guide",
                    "appearance": "Experienced, observant posture, sharp empathetic gaze.",
                    "hair": "Silver-streaked hair.",
                    "clothing": "Practical utility clothing suited for movement and endurance.",
                    "props": "Navigation toolkit and communicator.",
                    "colorPalette": "#047857 (Deep Emerald), #64748B (Steel Gray)",
                    "visualEvolution": "Stands firm as a pillar of guidance through every trial."
                }
            ],
            "locations": [
                {
                    "name": f"The Threshold of {title}",
                    "architecture": "Expansive architectural threshold with distinctive structural features tailored to this story world.",
                    "geography": "Strategic vantage point marking the transition into uncharted territory.",
                    "weather": "Dynamic atmospheric conditions with motivated dramatic contrast.",
                    "materials": "Tactile industrial and environmental materials shaped by the setting.",
                    "objects": "Essential equipment, signaling arrays, and transit vehicles.",
                    "lighting": "Atmospheric cinematic lighting with motivated practical rim accents.",
                    "colorPalette": "#0F172A (Deep Slate), #38BDF8 (Ambient Sky), #F59E0B (Amber Practical)"
                },
                {
                    "name": "The Operational Core",
                    "architecture": "Functional operational hub designed for coordination and command.",
                    "geography": "Central sheltered facility providing sanctuary and intelligence.",
                    "weather": "Protected interior climate with focused utilitarian atmosphere.",
                    "materials": "Reinforced alloys, interactive terminals, and weathered functional surfaces.",
                    "objects": "Navigational consoles, communication displays, and field gear.",
                    "lighting": "Focused directional overhead lighting paired with warm console glows.",
                    "colorPalette": "#1E1B4B (Midnight Indigo), #FCD34D (Warm Tungsten), #334155 (Steel Slate)"
                }
            ]
        }

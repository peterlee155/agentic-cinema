import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("EditorAgent")

class EditorAgent(BaseAgent):
    """
    Editor Agent: Master Picture Editor & Pacing Strategist
    Generates the complete editorial architecture:
    - Scene Order & Narrative Sequence
    - Scene Durations & Pacing Curve
    - Cut Timing (Micro-rhythms, staccato vs. fluid breath)
    - Transitions (Hard cuts, dissolves, match cuts, J-cuts, L-cuts)
    - Montage Sequences (Time compression)
    - Parallel Editing / Cross-Cutting (Simultaneous tension)
    - Final Shot Selection (Lasting thematic punchline)
    Eliminates narrative deadweight and trims unnecessary material.
    """
    def __init__(self):
        super().__init__(
            name="Editor",
            role="Lead Picture Editor & Assembly Master",
            system_prompt="""You are a veteran Hollywood film editor.
Your objective is to shape the raw scenes and shots into a compelling, tightly-wound editorial structure.
Define the scene order, pacing curve (accelerating tempo from slow tension to breathless climax), cut timing, match cuts, J-cuts, L-cuts, parallel editing sequences, and the iconic final shot.
Ruthlessly identify and eliminate narrative deadweight."""
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        scenes = context.get("scenes", []) or context.get("screenplay", [])

        schema = """{
  "pacingStrategy": "string",
  "sceneOrder": [1, 2, 3, 4, 5],
  "sceneDurations": {"scene_1": "14 min", "scene_2": "18 min"},
  "cutTiming": "string",
  "transitions": ["string"],
  "parallelEditing": "string",
  "matchCuts": ["string"],
  "jCutsLCuts": ["string"],
  "finalShot": "string",
  "trimmedMaterialNotes": "string"
}"""

        gemini_prompt = f"Design editing architecture for:\nScenes: {str(scenes)[:1500]}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if parsed and "pacingStrategy" in parsed and "finalShot" in parsed:
            return parsed

        # Dynamic Editorial Master Plan derived from project
        brief = context.get("brief", {})
        title = brief.get("title") or context.get("title") or "UNTITLED FEATURE"
        genre = brief.get("genre", "Cinematic Feature")

        return {
            "pacingStrategy": f"Gradual acceleration tailored for {title}: deliberate atmospheric worldbuilding in Act 1 builds to dynamic kinetic pacing in Act 3.",
            "sceneOrder": [1, 2, 3, 4, 5],
            "sceneDurations": {
                "scene_1": "12 minutes (Status Quo & Inciting Incident)",
                "scene_2": "16 minutes (Entering Uncharted Territory)",
                "scene_3": "20 minutes (Escalating Trials & Investigation)",
                "scene_4": "24 minutes (Climactic Confrontation)",
                "scene_5": "14 minutes (Resolution & Aftermath)"
            },
            "cutTiming": "Act 1 averages 6.0s per take for immersive spatial establishment; Act 2 tightens to 3.5s; Act 3 operates at 1.5s for peak narrative velocity.",
            "transitions": [
                "Scene 1 to 2: Cut on narrative movement into the unfamiliar realm",
                "Scene 2 to 3: Sound bridge into subterranean environment",
                "Scene 3 to 4: Accelerating cut rate from wide master to tight kinetic coverage",
                "Scene 4 to 5: Smash cut on climactic beat to quiet ambient dawn"
            ],
            "parallelEditing": f"In the climax of {title}, cross-cut between the protagonist's physical challenge and supporting developments across secondary locations.",
            "matchCuts": [
                "Match cut between opening emblem and key environmental framing element.",
                "Match cut between character eye-line and the horizon ahead."
            ],
            "jCutsLCuts": [
                "J-Cut into Act 2: Ambient environmental audio precedes the visual scene transition by 3 seconds.",
                "L-Cut out of Act 1: Dialogue resonance carries over the establishing shot of the next sequence."
            ],
            "finalShot": f"A slow, lingering optical pull-back from our lead characters into the transformed horizon of {title}.",
            "trimmedMaterialNotes": "Trimmed extraneous exposition to plunge directly into the active cinematic dilemma."
        }

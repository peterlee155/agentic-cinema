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

        # Default Editorial Master Plan
        return {
            "pacingStrategy": "Gradual acceleration: deliberate, ceremonial pacing in Act 1 builds to breathless real-time editing in Act 3 as the countdown drops below five minutes.",
            "sceneOrder": [1, 2, 3, 4, 5],
            "sceneDurations": {
                "scene_1": "14 minutes (Ritual Setup & Rule Revelation)",
                "scene_2": "18 minutes (Paranoid Limbo Market Crawl)",
                "scene_3": "22 minutes (Underground Vault Heist & Whistle Tension)",
                "scene_4": "25 minutes (High-Octane Bridge Sprint Climax)",
                "scene_5": "16 minutes (Cathedral Renewal & Cliffhanger Unmasking)"
            },
            "cutTiming": "Act 1 averages 6.5s per shot to absorb sacred atmosphere; Act 2 tightens to 3.8s to build paranoia; Act 3 cuts on kinetics at 1.2s intervals.",
            "transitions": [
                "Scene 1 to 2: Hard cut from rising smoke into muddy sodium rain",
                "Scene 2 to 3: Dissolve through murky water puddle into flooded subway concourse",
                "Scene 3 to 4: Accelerating cut rate from 6-second takes down to 1.2-second rhythmic cuts",
                "Scene 4 to 5: Smash cut from running footsteps to heavy steel vault door slamming shut"
            ],
            "parallelEditing": "In Act 3, cross-cut between Kaelen sprinting across the floodwater with the dying timer and Sister Mara desperately burning incense at the fracturing altar.",
            "matchCuts": [
                "Match cut between the circular glowing countdown timer '00:00:01' and the circular Keystone altar well.",
                "Match cut between Elias's static smile in the rain and the statue of St. Jude above the gate."
            ],
            "jCutsLCuts": [
                "J-Cut into Scene 3: The eerie whistling down the tracks precedes the visual transition by 4 seconds.",
                "L-Cut out of Scene 1: Sister Mara's voiceover warning 'they ask about your family' carries over Kaelen walking into the market."
            ],
            "finalShot": "A slow, creeping optical push into Elias's calm face through the cathedral glass as the rain runs down the pane like static, smiling unblinkingly at Nia.",
            "trimmedMaterialNotes": "Cut initial 5-minute opening monologue about the history of the apocalypse; replaced with immediate physical action of the bone stylus searing into flesh."
        }

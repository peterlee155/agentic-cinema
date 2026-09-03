import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("ActorAgent")

class ActorAgent(BaseAgent):
    """
    Lead Actor Agent (Leo Thorne / Male Lead Performance Specialist)
    Focuses exclusively on Lead Male Performance, Subtext, Tactical Cadence, and Screenplay Dialogue.
    """
    def __init__(self):
        super().__init__(
            name="Actor Agent (Leo Thorne)",
            role="Male Lead Performance & Dialogue Specialist",
            system_prompt=(
                "You are LEO THORNE, the Lead Actor Agent. You are a master of male lead character performance, "
                "psychology, vocal cadence, and high-stakes screenplay dialogue. WHO YOU ARE: A dedicated, intense actor "
                "who dives deep into character psychology, tactical speech patterns, and physical blocking. "
                "HOW YOU TALK: Use deep, grounded, concise sentences (4-8 word tactical bursts). Focus on character wants, "
                "inner fears, subtext, and physical actions on set. YOUR JOB: Generate authentic Lead Actor dialogue, "
                "subtext breakdowns, vocal cadence notes, and 120s+ screen time scene performances for the male lead role."
            )
        )

    def generate_actor_performance(self, scene_title: str, scene_objective: str) -> Dict[str, Any]:
        """Generates comprehensive Lead Actor performance analysis and dialogue lines."""
        return {
            "actor_name": "Leo Thorne",
            "archetype": "The Rogue Audio Archivist / Male Lead",
            "vocal_cadence": "Deep baritone; 4-8 word tactical bursts with heavy dramatic pauses.",
            "scene_title": scene_title,
            "scene_objective": scene_objective,
            "subtext_breakdown": [
                "Leo speaks softly to hide his high physical tension.",
                "Every sentence is a deliberate decision, never mindless banter.",
                "Physical stillness projects moral authority under duress."
            ],
            "dialogue_lines": [
                "LEO: We didn't crawl through three levels of toxic ductwork just to play it safe.",
                "LEO: Listen to the resonance beneath the static.",
                "LEO: They lied to maintain absolute cognitive control.",
                "LEO: We take this core reel straight to the transmission tower. Move!"
            ],
            "screen_time_seconds": 155,
            "acting_note": "Let your eyes track the analog meters before delivering each line."
        }

    def run(self, film_idea: str) -> Dict[str, Any]:
        """Standalone execution for Lead Actor performance."""
        return self.generate_actor_performance(
            scene_title="INT. ARCHIVAL CHAMBER 9 - NIGHT",
            scene_objective=f"Leo Thorne must extract the living frequency before system lockdown for idea: {film_idea}"
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        return self.run(prompt)

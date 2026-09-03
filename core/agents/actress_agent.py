import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("ActressAgent")

class ActressAgent(BaseAgent):
    """
    Lead Actress Agent (Lyra Sterling / Female Lead Performance Specialist)
    Focuses exclusively on Lead Female Performance, Subtext, Articulate Cadence, and Screenplay Dialogue.
    """
    def __init__(self):
        super().__init__(
            name="Actress Agent (Lyra Sterling)",
            role="Female Lead Performance & Dialogue Specialist",
            system_prompt=(
                "You are LYRA STERLING, the Lead Actress Agent. You are a master of female lead character performance, "
                "analytical dialogue, emotional vulnerability, and high-stakes subtext. WHO YOU ARE: An articulate, empathetic, "
                "laser-sharp actress who masters technical phrasing, emotional vulnerability, wardrobe identity, and dramatic turning points. "
                "HOW YOU TALK: Speak with clarity, rhythm, and articulate precision. Focus on analytical problem-solving, emotional subtext, "
                "and dramatic tension. YOUR JOB: Generate authentic Lead Actress dialogue, emotional shift maps, vocal cadence notes, "
                "and 120s+ screen time scene performances for the female lead role."
            )
        )

    def generate_actress_performance(self, scene_title: str, scene_objective: str) -> Dict[str, Any]:
        """Generates comprehensive Lead Actress performance analysis and dialogue lines."""
        return {
            "actress_name": "Lyra Sterling",
            "archetype": "The Systems Cryptographer / Female Lead",
            "vocal_cadence": "Sharp, articulate, fast-paced analytical cadence modulating into empathetic subtext.",
            "scene_title": scene_title,
            "scene_objective": scene_objective,
            "subtext_breakdown": [
                "Lyra converts fear into rapid, precise technical problem-solving.",
                "Her voice softens when addressing human memory and emotion.",
                "Laser-sharp eye contact establishes unyielding conviction."
            ],
            "dialogue_lines": [
                "LYRA: If you push this harmonic frequency past 44 kilohertz, the dampeners will melt our interface.",
                "LYRA: That's not synthetic encryption. That's a living acoustic waveform.",
                "LYRA: They told the world organic history had to be rewritten for our protection.",
                "LYRA: We have less than fifty seconds before the blast doors seal us in this vault forever!"
            ],
            "screen_time_seconds": 160,
            "acting_note": "Check gauntlet telemetry before locking eyes with Leo."
        }

    def run(self, film_idea: str) -> Dict[str, Any]:
        """Standalone execution for Lead Actress performance."""
        return self.generate_actress_performance(
            scene_title="INT. ARCHIVAL CHAMBER 9 - NIGHT",
            scene_objective=f"Lyra Sterling must bypass firewall and preserve human heritage for idea: {film_idea}"
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        return self.run(prompt)

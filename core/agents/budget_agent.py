import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("BudgetAgent")

class BudgetSimplificationAgent(BaseAgent):
    """
    Budget Simplification Agent: Money Saver
    Provides expensive vs budget options for shooting major VFX, stunts, and sets without sacrificing dramatic impact.
    """
    def __init__(self):
        super().__init__(
            name="Budget Simplification Agent",
            role="Line Producer & Cost Optimization Specialist",
            system_prompt='You are the Money Saver. Look at the expensive parts of the movie (big VFX, space scenes, huge sets) and suggest a cheaper way to shoot the same idea without losing the excitement. Give an "expensive version" and a "budget version" for each big scene.'
        )

    def _normalize_gemini_output(self, raw: Any, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        if isinstance(raw, list) and len(raw) > 0:
            return raw
        if isinstance(raw, dict) and "scene_budget_tiers" in raw:
            return raw["scene_budget_tiers"]
        return self._process("", prompt, context)

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        return [
            {
                "scene_number": 1,
                "scene_name": "Archival Chamber 9 Subterranean Vault",
                "expensive_version": {
                    "method": "Build a multi-level 10,000 sq ft concrete physical vault set with hydraulic automated steel blast doors and practical water drainage piping.",
                    "estimated_cost": "$2,800,000"
                },
                "budget_version": {
                    "method": "Shoot in an authentic decommissioned industrial boiler room or brewery cellar with practical haze, portable amber LED tube lighting, and a single custom prop console.",
                    "estimated_cost": "$250,000 (Savings: 91%)"
                },
                "story_impact": "Preserves claustrophobic tension and tactile mechanical textures while cutting stage construction overhead."
            },
            {
                "scene_number": 2,
                "scene_name": "Silas's Transmission Tower & Workshop",
                "expensive_version": {
                    "method": "Helicopter mountain location shoot with real high-altitude geodesic dome construction and crane rigging for windswept aerials.",
                    "estimated_cost": "$3,500,000"
                },
                "budget_version": {
                    "method": "Utilize an existing university planetary observatory or Victorian greenhouse with stained glass lighting and practical wind machines.",
                    "estimated_cost": "$320,000 (Savings: 90%)"
                },
                "story_impact": "Retains the majestic architectural gravitas and warm golden hour dusk lighting."
            },
            {
                "scene_number": 3,
                "scene_name": "Orbital Apex Platform Space Climax",
                "expensive_version": {
                    "method": "Zero-gravity wire stunt rigs in a 360-degree LED volume soundstage with massive full-CGI Earth photorealistic rendering.",
                    "estimated_cost": "$6,200,000"
                },
                "budget_version": {
                    "method": "High-contrast dark soundstage with an authentic 15-meter steel industrial catwalk, blue rim-lighting, black velvet curtains, and localized composite matte paintings.",
                    "estimated_cost": "$650,000 (Savings: 89%)"
                },
                "story_impact": "Focuses audience attention on the emotional actor performances and close-quarters stunt choreography rather than expensive background rendering."
            }
        ]

# Alias
MoneySaverAgent = BudgetSimplificationAgent

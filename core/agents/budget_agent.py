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
        scenes = context.get("scenes", []) or context.get("screenplay", [])
        brief = context.get("brief", {})
        title = brief.get("title") or context.get("title") or "UNTITLED FEATURE"

        schema = """{
  "scene_budget_tiers": [
    {
      "scene_number": 1,
      "scene_name": "string",
      "expensive_version": {
        "method": "string",
        "estimated_cost": "$2,800,000"
      },
      "budget_version": {
        "method": "string",
        "estimated_cost": "$250,000 (Savings: 91%)"
      },
      "story_impact": "string"
    }
  ]
}"""

        gemini_prompt = f"Optimize production budget for '{title}'. Provide high-budget vs smart budget options for these scenes:\n{str(scenes)[:1500]}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if isinstance(parsed, dict):
            for k in ["scene_budget_tiers", "budget_tiers", "tiers", "data"]:
                if k in parsed and isinstance(parsed[k], list) and len(parsed[k]) > 0:
                    return parsed[k]
        elif isinstance(parsed, list) and len(parsed) > 0 and "expensive_version" in parsed[0]:
            return parsed

        tiers = []
        if scenes and isinstance(scenes, list):
            for idx, sc in enumerate(scenes[:5]):
                s_num = sc.get("scene_number", idx + 1)
                s_name = sc.get("slug") or f"Scene {s_num} Sequence"
                tiers.append({
                    "scene_number": s_num,
                    "scene_name": s_name,
                    "expensive_version": {
                        "method": f"Full-scale physical build for {s_name} with heavy VFX extensions and elaborate stage rigs.",
                        "estimated_cost": f"${2_000_000 + idx * 500_000:,}"
                    },
                    "budget_version": {
                        "method": f"Location scout authentic industrial/architectural space with motivated lighting and practical SFX.",
                        "estimated_cost": f"${220_000 + idx * 40_000:,} (Savings: 89%)"
                    },
                    "story_impact": f"Retains dramatic tension and intimate character focus in {title} while maximizing production efficiency."
                })
            return tiers

        return [
            {
                "scene_number": 1,
                "scene_name": f"{title} Principal Sequence",
                "expensive_version": {
                    "method": "Massive bespoke soundstage construction with full LED volume wall.",
                    "estimated_cost": "$2,500,000"
                },
                "budget_version": {
                    "method": "Controlled practical location with high-contrast anamorphic lighting.",
                    "estimated_cost": "$280,000 (Savings: 88%)"
                },
                "story_impact": "Keeps the spotlight on performance while eliminating heavy construction costs."
            }
        ]

# Aliases
MoneySaverAgent = BudgetSimplificationAgent
BudgetAgent = BudgetSimplificationAgent
LineProducerAgent = BudgetSimplificationAgent

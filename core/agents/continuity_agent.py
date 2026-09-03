import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent
from core.continuity_engine import continuity_engine

logger = logging.getLogger("ContinuityAgent")

class ContinuityCheckerAgent(BaseAgent):
    """
    Continuity Auditor Agent
    Inspects outputs from all agents against canonical Project Bible facts.
    Detects discrepancies across character appearances, names, locations,
    timeline, world rules, objects, scene order, and story events.
    When conflicts arise, outputs structured alerts:
    ⚠️ CONTINUITY CONFLICT
    Problem: ...
    Existing Canon: ...
    New Output: ...
    Suggested Resolution: ...
    Never silently overwrites established canon.
    """
    def __init__(self):
        super().__init__(
            name="Continuity Auditor",
            role="Script Supervisor & Canon Auditor",
            system_prompt="""You are the Script Supervisor and Canon Integrity Auditor.
Your solemn duty is to review the complete Project Bible across all creative disciplines (Screenwriter, Art Director, Director, Cinematographer, Storyboard, Sound).
Identify any plot contradictions, visual mismatches, rule breaks, or chronological flaws.
Report findings objectively without silently altering established facts."""
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        bible_dict = context.get("bible", {})
        audit_res = continuity_engine.audit_production(bible_dict)
        
        # Build prompt for Gemini if API key is active
        if self.api_key:
            gemini_prompt = f"Audit this film production for narrative continuity:\n{str(bible_dict)[:2000]}"
            raw = self.call_gemini(gemini_prompt, '{"continuity_status": "VERIFIED_CANON", "audited_items": 10, "notes": "string"}')
            parsed = self.parse_gemini_json(raw)
            if parsed and "notes" in parsed:
                audit_res["gemini_review"] = parsed["notes"]

        return audit_res

# Alias
ContinuityAgent = ContinuityCheckerAgent

import json
import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent
from core.memory import MemoryBank

logger = logging.getLogger("StrategistAgent")

class StrategistAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Strategist Agent",
            role="Executive Strategist & Counter-Play Architect",
            system_prompt=(
                "You are a Chief Strategy Officer AI. Your mission is to synthesize all competitor intel "
                "and quantitative SWOT metrics into an actionable, executive-ready playbook. Formulate high-leverage "
                "counter-plays, product moats, positioning angles, and an executive briefing."
            )
        )

    def _process(self, memory: MemoryBank, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        scout_data = context.get("scout_data", {})
        analyst_data = context.get("analyst_data", {})
        target = scout_data.get("target_name", prompt)

        memory.log_reasoning_step(self.name, "Formulating Counter-Strategy", f"Synthesizing actionable playbook and executive brief for '{target}'...")

        schema_req = """
        {
            "executive_summary": "Crisp 3-sentence high-level summary for the C-Suite / Founders",
            "key_vulnerabilities_to_exploit": [
                "Vulnerability 1 with tactical attack vector",
                "Vulnerability 2 with tactical attack vector"
            ],
            "strategic_counter_plays": [
                {
                    "play_title": "...",
                    "horizon": "Immediate (30 days) / Medium (90 days) / Long-term (180 days)",
                    "action_plan": "...",
                    "expected_impact": "High/Medium/Low"
                }
            ],
            "defensive_moats_to_build": [
                "Moat 1", "Moat 2"
            ],
            "slack_webhook_payload": {
                "headline": "🚨 Competitive Intelligence Alert: ...",
                "urgency": "HIGH",
                "key_takeaway": "..."
            }
        }
        """

        gemini_prompt = f"Develop executive strategic counter-plays based on this intelligence:\nScout: {json.dumps(scout_data)}\nAnalyst: {json.dumps(analyst_data)}"
        ai_resp = self.call_gemini(gemini_prompt, schema_req)

        if ai_resp:
            try:
                cleaned = ai_resp.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned[7:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                data = json.loads(cleaned)
                return data
            except Exception as e:
                logger.warning(f"Error parsing Gemini response in StrategistAgent: {e}")

        # Heuristic fallback
        return {
            "executive_summary": (
                f"{target} poses a significant competitive challenge due to its rapid release cadence and developer adoption. "
                "However, notable friction exists in enterprise integration friction and unpredictable consumption costs, "
                "leaving clear market whitespace for our solution to dominate."
            ),
            "key_vulnerabilities_to_exploit": [
                "High API / Token Volatility: Capitalize by introducing transparent, predictable flat-rate tiering.",
                "Complex Customization Curve: Differentiate through zero-config plug-and-play agent templates.",
                "Ecosystem Lock-In: Champion open-source protocols (like Model Context Protocol) to appeal to sovereignty-conscious teams."
            ],
            "strategic_counter_plays": [
                {
                    "play_title": "Launch 'Predictable Enterprise Compute' Positioning",
                    "horizon": "Immediate (30 Days)",
                    "action_plan": "Publish direct TCO comparison calculators showing our cost predictability against volatile competitor token spikes.",
                    "expected_impact": "High"
                },
                {
                    "play_title": "Deploy One-Click Migration Bridge",
                    "horizon": "Medium (90 Days)",
                    "action_plan": "Ship an automated converter script allowing teams to migrate prompts and agent workflows into our platform in under 5 minutes.",
                    "expected_impact": "High"
                },
                {
                    "play_title": "Form Strategic Enterprise Alliances",
                    "horizon": "Long-term (180 Days)",
                    "action_plan": "Co-market with premier cloud providers and security auditing platforms to certify zero-trust compliance.",
                    "expected_impact": "Medium"
                }
            ],
            "defensive_moats_to_build": [
                "Proprietary Real-Time Tracing & Telemetry Graph for mission-critical audit trails.",
                "Deep Zero-Trust Model Armor Guardrail Layer embedded natively into runtime execution."
            ],
            "slack_webhook_payload": {
                "headline": f"🚨 Competitive Intel Radar Alert: High Activity on {target}",
                "urgency": "HIGH",
                "key_takeaway": f"Threat Score computed at {analyst_data.get('overall_threat_score', 84)}/100. Immediate counter-play focus on transparent pricing and enterprise migration tooling."
            }
        }

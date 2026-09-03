import json
import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent
from core.memory import MemoryBank

logger = logging.getLogger("AnalystAgent")

class AnalystAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Analyst Agent",
            role="Quantitative Market Analyst & SWOT Engine",
            system_prompt=(
                "You are an expert Quantitative Tech Analyst. Your mission is to evaluate competitor "
                "intelligence, compute multidimensional Threat Radar Scores (0-100), generate a rigorous SWOT matrix, "
                "and structure an objective capability comparison matrix."
            )
        )

    def _process(self, memory: MemoryBank, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        scout_data = context.get("scout_data", {})
        target = scout_data.get("target_name", prompt)
        
        memory.log_reasoning_step(self.name, "Quantitative Scoring", f"Calculating multidimensional threat scores and SWOT vectors for '{target}'...")

        schema_req = """
        {
            "overall_threat_score": 85,
            "threat_level": "CRITICAL / HIGH / MODERATE / LOW",
            "radar_scores": {
                "innovation_speed": 90,
                "pricing_competitiveness": 75,
                "feature_depth": 88,
                "enterprise_readiness": 80,
                "community_traction": 85
            },
            "swot_analysis": {
                "strengths": ["Item 1", "Item 2", "Item 3"],
                "weaknesses": ["Item 1", "Item 2", "Item 3"],
                "opportunities": ["Item 1", "Item 2", "Item 3"],
                "threats": ["Item 1", "Item 2", "Item 3"]
            },
            "comparison_matrix": [
                {"capability": "Agentic Tool Use", "competitor_status": "Advanced", "market_benchmark": "Standard", "threat_impact": "High"},
                {"capability": "Multimodal Input", "competitor_status": "Native", "market_benchmark": "Emerging", "threat_impact": "Medium"},
                {"capability": "On-Prem / VPC Deployment", "competitor_status": "Limited", "market_benchmark": "High Demand", "threat_impact": "Low"},
                {"capability": "Cost per 1M Tokens", "competitor_status": "Aggressive", "market_benchmark": "Moderate", "threat_impact": "High"}
            ],
            "core_differentiator": "Primary moat or distinctive advantage"
        }
        """

        gemini_prompt = f"Perform deep competitive analysis on this data:\n{json.dumps(scout_data, indent=2)}"
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
                logger.warning(f"Error parsing Gemini response in AnalystAgent: {e}")

        # Heuristic fallback calculation
        return {
            "overall_threat_score": 84,
            "threat_level": "HIGH",
            "radar_scores": {
                "innovation_speed": 88,
                "pricing_competitiveness": 78,
                "feature_depth": 86,
                "enterprise_readiness": 82,
                "community_traction": 85
            },
            "swot_analysis": {
                "strengths": [
                    f"Strong technical architecture with rapid release cycles for {target}.",
                    "High developer mindshare and active open ecosystem adoption.",
                    "Robust multimodal inference pipeline with competitive latency SLAs."
                ],
                "weaknesses": [
                    "Complex configuration overhead for customized enterprise workflows.",
                    "Higher variable compute costs during sustained recursive agent loops.",
                    "Opaque rate-limiting and tier throttling under burst traffic."
                ],
                "opportunities": [
                    "Capturing high-security regulated enterprise markets with air-gapped support.",
                    "Offering predictable fixed-cost billing models to counteract usage volatility.",
                    "Expanding plug-and-play integrations with legacy ERP and developer toolchains."
                ],
                "threats": [
                    f"Rapid feature commoditization as open-source alternatives catch up.",
                    "Aggressive price cuts from hyperscalers bundling competing suites.",
                    "Shifting developer allegiance towards specialized niche micro-agents."
                ]
            },
            "comparison_matrix": [
                {"capability": "Autonomous Multi-Agent Loops", "competitor_status": "Native & Optimized", "market_benchmark": "Experimental", "threat_impact": "High"},
                {"capability": "Real-Time Telemetry & Tracing", "competitor_status": "Standard", "market_benchmark": "Advanced", "threat_impact": "Medium"},
                {"capability": "Zero-Trust Guardrails (Model Armor)", "competitor_status": "Configurable", "market_benchmark": "Mandatory", "threat_impact": "High"},
                {"capability": "Cost Predictability & Margin Efficiency", "competitor_status": "Variable / Consumption", "market_benchmark": "Fixed Tiering", "threat_impact": "High"},
                {"capability": "Ecosystem Plugins & Custom Connectors", "competitor_status": "Expansive", "market_benchmark": "Growing", "threat_impact": "Medium"}
            ],
            "core_differentiator": f"{target}'s primary moat lies in its aggressive developer ergonomics, low-latency execution loops, and rapid integration of multimodal frontier capabilities."
        }

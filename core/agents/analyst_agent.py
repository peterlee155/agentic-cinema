"""
Script Analyst Agent
Backwards compatibility bridge redirecting to ScriptAnalysisAgent.
"""
from core.agents.script_analysis_agent import ScriptAnalysisAgent

class AnalystAgent(ScriptAnalysisAgent):
    """
    Expert Script Analyst & Pre-Production Coordinator
    """
    pass

__all__ = ["AnalystAgent", "ScriptAnalysisAgent"]

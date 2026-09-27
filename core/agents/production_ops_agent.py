import re
import json
import logging
from typing import Dict, Any, List, Optional
from core.agents.base_agent import BaseAgent
from mcp.clickhouse_mcp_server import clickhouse_mcp
from db.clickhouse_client import db

logger = logging.getLogger("ProductionOpsAgent")

class ProductionOpsAgent(BaseAgent):
    """
    Production & Ops Agent (MCP Data Querying Engine)
    Role: Studio Resource & Budget Logistics Manager

    Connected to production databases via Model Context Protocol (MCP) and ClickHouse / Grafana Labs.
    Task: Convert user queries regarding budget allocation, shoot schedules, and scene costs into valid SQL/MCP function calls.
    Constraints:
    - Always perform a safety check before triggering any function call that modifies production records or spending logs.
    - Respond to the studio producer with clear, concise visual metrics and actionable next steps for cost optimization.
    """
    def __init__(self):
        super().__init__(
            name="Production & Ops Agent",
            role="Studio Resource & Budget Logistics Manager",
            system_prompt="""You are a Studio Operations Agent connected to production databases via Model Context Protocol (MCP) and ClickHouse / Grafana Labs.
Task: Convert user queries regarding budget allocation, shoot schedules, and scene costs into valid SQL/MCP function calls.

Constraints:
1. Always perform a safety check before triggering any function call that modifies production records or spending logs.
2. Respond to the studio producer with clear, concise visual metrics and actionable next steps for cost optimization."""
        )
        self.mcp = clickhouse_mcp
        self.grafana_base_url = "https://grafana.agentic-cinema.internal/d/cinema-ops-01"

    def query_production(self, user_query: str, project_id: str = "proj_last_spell", confirmed_by_producer: bool = False) -> Dict[str, Any]:
        """Processes a natural language ops query, performs safety checks, executes MCP call, and formats output."""
        return self._process(project_id, user_query, {"confirmed_by_producer": confirmed_by_producer})

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        q = (prompt or "").strip()
        q_lower = q.lower()
        confirmed_by_producer = context.get("confirmed_by_producer", False)

        # 1. SAFETY CHECK DETECTION
        mutating_keywords = ["delete", "drop", "truncate", "insert into", "update", "alter table", "modify"]
        is_mutating = any(kw in q_lower for kw in mutating_keywords)

        if is_mutating and not confirmed_by_producer:
            logger.warning(f"Safety check triggered: User request attempted mutating action: {q}")
            return {
                "success": False,
                "safety_check": "FAILED - MUTATION BLOCKED",
                "alert": "[SAFETY ALERT] Critical Safety Check: Modification Attempt Detected",
                "details": "You have requested a database operation that modifies production records, shoot schedules, or spending logs. Under Studio Protocol, destructive changes require explicit Producer Confirmation.",
                "query": q,
                "action_required": "Resubmit with explicit producer confirmation flag: {'confirmed_by_producer': true}.",
                "mcp_function_called": None
            }

        # 2. INTENT CLASSIFICATION & SQL / MCP FUNCTION ROUTING
        mcp_tool = "get_budget_allocation"
        mcp_args = {"project_id": project_id}
        sql_equivalent = f"SELECT * FROM {db.database}.budget_allocation WHERE project_id = '{project_id}'"
        category = "BUDGET_ALLOCATION"

        if any(k in q_lower for k in ["schedule", "timeline", "shoot day", "calendar", "call sheet"]):
            mcp_tool = "get_shoot_schedule"
            sql_equivalent = f"SELECT scene_number, shoot_day, location, cast_required, estimated_hours, status FROM {db.database}.shoot_schedules WHERE project_id = '{project_id}' ORDER BY shoot_day ASC"
            category = "SHOOT_SCHEDULES"
        elif any(k in q_lower for k in ["scene cost", "cost per scene", "scene breakdown", "vfx cost", "stunt cost"]):
            mcp_tool = "get_scene_costs"
            sql_equivalent = f"SELECT scene_number, slugline, base_location_cost, cast_cost, vfx_cost, stunt_cost, total_scene_cost, optimization_savings_potential FROM {db.database}.scene_costs WHERE project_id = '{project_id}' ORDER BY total_scene_cost DESC"
            category = "SCENE_COSTS"
        elif any(k in q_lower for k in ["telemetry", "latency", "tokens", "agent performance"]):
            mcp_tool = "get_production_telemetry"
            sql_equivalent = f"SELECT agent_name, count(), avg(latency_ms), sum(prompt_tokens + completion_tokens) FROM {db.database}.production_telemetry WHERE project_id = '{project_id}' GROUP BY agent_name"
            category = "TELEMETRY"

        # 3. EXECUTE VIA CLICKHOUSE MCP SERVER
        mcp_result = self.mcp.call_tool(mcp_tool, mcp_args)

        # 4. GENERATE VISUAL METRICS AND ACTIONABLE COST OPTIMIZATION STEPS
        visual_metrics = self._format_visual_metrics(category, mcp_result)
        cost_optimizations = self._generate_cost_optimizations(category, mcp_result)

        return {
            "success": True,
            "safety_check": "PASSED (Read-Only Analytical Operation)",
            "user_query": q,
            "intent_category": category,
            "mcp_function_called": {
                "server": self.mcp.server_info["name"],
                "protocol": self.mcp.server_info["protocol_version"],
                "tool": mcp_tool,
                "arguments": mcp_args
            },
            "sql_equivalent": sql_equivalent,
            "data": mcp_result,
            "visual_metrics": visual_metrics,
            "actionable_next_steps": cost_optimizations,
            "grafana_observability": {
                "dashboard_url": f"{self.grafana_base_url}?orgId=1&var-project={project_id}&refresh=5s",
                "recommended_panels": [
                    "Departmental Burn Rate Gauge",
                    "Daily Shoot Hour Cumulative Heatmap",
                    "Scene VFX vs Practical Cost Pareto Frontier"
                ]
            }
        }

    def _format_visual_metrics(self, category: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generates clear, concise visual metrics for studio executives."""
        if category == "BUDGET_ALLOCATION":
            items = data.get("items", [])
            total_alloc = data.get("total_allocated", 0)
            total_spent = data.get("total_spent", 0)
            burn = data.get("burn_rate_percent", 0)
            
            # Formatted text table
            table_lines = [
                f"{'DEPARTMENT':<22} | {'ALLOCATED':<12} | {'SPENT':<12} | {'REMAINING':<12} | {'BURN %'}",
                "-" * 72
            ]
            for item in items:
                dept = item["department"]
                alloc = f"${item['allocated']:,.0f}"
                spent = f"${item['spent']:,.0f}"
                rem = f"${item['remaining']:,.0f}"
                pct = f"{round((item['spent'] / max(1.0, item['allocated'])) * 100)}%"
                table_lines.append(f"{dept:<22} | {alloc:<12} | {spent:<12} | {rem:<12} | {pct}")

            return {
                "headline_metric": f"${total_spent:,.0f} spent of ${total_alloc:,.0f} budget ({burn}% burn rate)",
                "runway_status": "HEALTHY" if burn < 50 else ("CAUTION" if burn < 80 else "CRITICAL OVERRUN RISK"),
                "ascii_table": "\n".join(table_lines),
                "top_expenditure_dept": items[0]["department"] if items else "None"
            }

        elif category == "SHOOT_SCHEDULES":
            schedules = data.get("schedules", [])
            total_days = data.get("total_shoot_days", 0)
            total_hours = sum(s["hours"] for s in schedules)
            
            table_lines = [
                f"{'DAY':<5} | {'SCENE':<7} | {'LOCATION':<32} | {'EST. HOURS':<10} | {'STATUS'}",
                "-" * 75
            ]
            for s in schedules:
                table_lines.append(f"Day {s['shoot_day']:<2} | Sc {s['scene_number']:<4} | {s['location'][:30]:<32} | {s['hours']:<10.1f} | {s['status']}")

            return {
                "headline_metric": f"{total_days} Shoot Days | {total_hours:.1f} Total Production Hours Scheduled",
                "risk_factor": "Day 4 Overtime Hazard (14.0 hrs scheduled on Iron Rail Bridge)",
                "ascii_table": "\n".join(table_lines)
            }

        elif category == "SCENE_COSTS":
            scenes = data.get("scenes", [])
            total_cost = data.get("total_production_cost", 0)
            total_savings = data.get("total_savings_potential", 0)

            table_lines = [
                f"{'SCENE':<7} | {'TOTAL COST':<12} | {'VFX COMPONENT':<14} | {'SAVINGS POTENTIAL':<18}",
                "-" * 60
            ]
            for sc in scenes:
                table_lines.append(f"Sc {sc['scene_number']:<4} | ${sc['total_cost']:<11,.0f} | ${sc['vfx_cost']:<13,.0f} | ${sc['savings_potential']:<17,.0f}")

            return {
                "headline_metric": f"${total_cost:,.0f} Total Production Cost across {len(scenes)} Scenes",
                "optimization_runway": f"${total_savings:,.0f} (Potential {round((total_savings / max(1.0, total_cost)) * 100)}% Cost Reduction)",
                "ascii_table": "\n".join(table_lines)
            }

        return {"summary": "Telemetry retrieved successfully."}

    def _generate_cost_optimizations(self, category: str, data: Dict[str, Any]) -> List[str]:
        """Provides actionable next steps for cost optimization."""
        if category == "BUDGET_ALLOCATION":
            return [
                "1. [VFX Department] Shift 40% of complex environmental background simulation into practical in-camera optical and lighting techniques, saving an estimated $120,000.",
                "2. [Location Consolidation] Bundle primary soundstage and interior location shooting days consecutively to eliminate tear-down and re-rigging stage rental fees ($45,000 savings).",
                "3. [Cast Scheduling] Block supporting ensemble and background calls strictly within unified shooting blocks to avoid multi-day standby holding penalties ($32,000 savings)."
            ]
        elif category == "SHOOT_SCHEDULES":
            return [
                "1. [Overtime Mitigation] Split extended exterior shooting days across balanced half-day blocks to prevent union golden-time multiplier penalties.",
                "2. [Weather Contingency] Invert interior and exterior call sheets if adverse weather occurs, safeguarding delicate camera packages.",
                "3. [Production Continuity] Schedule principal character coverage consecutively to maximize cast availability and minimize travel turnaround."
            ]
        elif category == "SCENE_COSTS":
            return [
                "1. [High-Impact Sequence Optimization] Use practical stunt rigs and motivated practical effects rather than full-CGI digital doubles to save up to $85,000.",
                "2. [Crowd Scene Efficiency] Substitute distant background extras with foreground silhouette blocking and motivated high-contrast rim lighting ($42,000 savings).",
                "3. [Special Effects Practical Balance] Utilize practical mechanical effects for physical set interactions instead of post-production volumetric particle rendering ($38,000 savings)."
            ]
        return [
            "Monitor ClickHouse execution latency SLAs in Grafana to prevent excessive token inference spend."
        ]

# Aliases
StudioOpsAgent = ProductionOpsAgent
BudgetLogisticsAgent = ProductionOpsAgent

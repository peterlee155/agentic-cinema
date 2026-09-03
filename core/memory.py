import time
import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("MemoryBank")

class MemoryBank:
    """Central State, Continuity, and Observability Storage for AgentPulse."""

    def __init__(self, target_id: str = "target_intel_01"):
        self.target_id = target_id
        self.target_topic = ""
        self.created_at = time.time()
        
        # State Containers
        self.scout_data: Dict[str, Any] = {}
        self.analyst_data: Dict[str, Any] = {}
        self.strategist_data: Dict[str, Any] = {}
        
        # Observability & OpenTelemetry-compatible traces
        self.telemetry_logs: List[Dict[str, Any]] = []
        self.reasoning_steps: List[Dict[str, Any]] = []

    def log_telemetry(self, agent_name: str, stage: str, prompt_tokens: int, completion_tokens: int, latency_ms: int, status: str = "SUCCESS"):
        """Record real-time execution telemetry."""
        record = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "agent": agent_name,
            "stage": stage,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "latency_ms": latency_ms,
            "status": status
        }
        self.telemetry_logs.append(record)

    def log_reasoning_step(self, agent_name: str, action: str, details: str):
        """Record human-interpretable reasoning trace."""
        step = {
            "timestamp": time.strftime("%H:%M:%S"),
            "agent": agent_name,
            "action": action,
            "details": details
        }
        self.reasoning_steps.append(step)

    def get_summary_metrics(self) -> Dict[str, Any]:
        """Aggregate total tokens, latency, and agent stats."""
        total_tokens = sum(t["total_tokens"] for t in self.telemetry_logs)
        total_latency = sum(t["latency_ms"] for t in self.telemetry_logs)
        avg_latency = total_latency // max(1, len(self.telemetry_logs))
        
        return {
            "total_invocations": len(self.telemetry_logs),
            "total_tokens": total_tokens,
            "total_latency_ms": total_latency,
            "avg_latency_ms": avg_latency,
            "agent_count": 3,
            "telemetry_logs": self.telemetry_logs
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            "target_id": self.target_id,
            "target_topic": self.target_topic,
            "created_at": self.created_at,
            "scout_data": self.scout_data,
            "analyst_data": self.analyst_data,
            "strategist_data": self.strategist_data,
            "metrics": self.get_summary_metrics(),
            "reasoning_steps": self.reasoning_steps
        }

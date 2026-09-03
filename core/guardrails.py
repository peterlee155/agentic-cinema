import re
import logging
from typing import Dict, Any, Tuple

logger = logging.getLogger("ModelArmor")

class ModelArmor:
    """Enterprise Guardrail and Safety Filter for AgentPulse Swarm."""

    INJECTION_PATTERNS = [
        r"ignore previous instructions",
        r"system prompt override",
        r"bypass security filters",
        r"disregard all prior directives",
        r"reveal your secret instructions"
    ]

    PII_PATTERNS = [
        r"\b\d{3}-\d{2}-\d{4}\b",                 # SSN
        r"\b(?:4[0-9]{12}(?:[0-9]{3})?)\b",        # Credit Card
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"  # Email
    ]

    @classmethod
    def inspect_input(cls, text: str) -> Tuple[bool, str]:
        """Verify prompt integrity before passing to Gemini agents."""
        lower_text = text.lower()
        for pattern in cls.INJECTION_PATTERNS:
            if re.search(pattern, lower_text):
                logger.warning(f"Guardrail Alert: Prompt injection pattern detected: {pattern}")
                return False, "Prompt contains prohibited injection patterns."
        return True, "Passed"

    @classmethod
    def sanitize_output(cls, data: Any) -> Any:
        """Sanitize agent output for PII and unsafe content."""
        if isinstance(data, str):
            sanitized = data
            for pattern in cls.PII_PATTERNS:
                sanitized = re.sub(pattern, "[REDACTED_BY_MODEL_ARMOR]", sanitized)
            return sanitized
        elif isinstance(data, dict):
            return {k: cls.sanitize_output(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [cls.sanitize_output(item) for item in data]
        return data

guardrails = ModelArmor()

"""
World Rule Engine for Agentic Cinema.
Provides structured, unbreakable universe laws for sci-fi, fantasy, zombie, magic, and alternate physics lore.
All production agents (Screenwriter, Director, Cinematographer, etc.) must respect these rules.
"""

from typing import List, Dict, Any, Optional

class WorldRule:
    def __init__(self, rule_id: str, category: str, rule: str, consequence: str, strictness: str = "UNBREAKABLE"):
        self.rule_id = rule_id
        self.category = category  # Magic, Zombies, Technology, Biology, Physics
        self.rule = rule
        self.consequence = consequence
        self.strictness = strictness  # UNBREAKABLE, RESTRICTED, NARRATIVE_EXCEPTION

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.rule_id,
            "category": self.category,
            "rule": self.rule,
            "consequence": self.consequence,
            "strictness": self.strictness
        }


class WorldRuleEngine:
    """Enforces canon universe laws across all creative agents."""
    
    def __init__(self, initial_rules: Optional[List[Dict[str, Any]]] = None):
        self.rules: List[WorldRule] = []
        if initial_rules:
            for r in initial_rules:
                self.add_rule(
                    rule_id=r.get("id", f"RULE_{len(self.rules)+1:02d}"),
                    category=r.get("category", "General"),
                    rule=r.get("rule", ""),
                    consequence=r.get("consequence", ""),
                    strictness=r.get("strictness", "UNBREAKABLE")
                )

    def add_rule(self, rule_id: str, category: str, rule: str, consequence: str, strictness: str = "UNBREAKABLE") -> WorldRule:
        rule_obj = WorldRule(rule_id, category, rule, consequence, strictness)
        self.rules.append(rule_obj)
        return rule_obj

    def get_rules_prompt_block(self) -> str:
        """Formats the universe rules as an authoritative prompt block for LLMs."""
        if not self.rules:
            return "No custom universe rules specified."
        
        lines = ["=== UNBREAKABLE WORLD RULES (CANON MUST BE PRESERVED) ==="]
        for r in self.rules:
            lines.append(f"[{r.rule_id}] ({r.category}) {r.rule} -> VIOLATION CONSEQUENCE: {r.consequence} [{r.strictness}]")
        return "\n".join(lines)

    def validate_content_against_rules(self, text: str) -> List[Dict[str, Any]]:
        """Scans scene text or character actions for direct rule contradictions."""
        violations = []
        text_lower = text.lower()

        for r in self.rules:
            # Domain-specific heuristics for instant detection
            if "countdown" in r.rule.lower() and "infinite spell" in text_lower:
                violations.append({
                    "rule_id": r.rule_id,
                    "rule": r.rule,
                    "violation": "Scene indicates unlimited protection while rule specifies a finite countdown."
                })
            if "inner sanctuary" in r.rule.lower() and "zombies inside inner" in text_lower:
                violations.append({
                    "rule_id": r.rule_id,
                    "rule": r.rule,
                    "violation": "Zombies entered the inner sanctuary violating barrier immunity."
                })
        return violations

    def to_list(self) -> List[Dict[str, Any]]:
        return [r.to_dict() for r in self.rules]

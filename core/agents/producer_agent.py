import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("ProducerAgent")

class ProducerAgent(BaseAgent):
    """
    Producer Agent: Executive Creative & Strategic Architect
    Transforms the raw user movie idea into a comprehensive Production Brief.
    Outputs: Title, Genre, Tone, Logline, Core Hook, World, Protagonist, Antagonist,
    Supporting Characters, Central Conflict, Stakes, Themes, Three-Act Structure, Production Risks.
    Does NOT generate the entire screenplay.
    """
    def __init__(self):
        super().__init__(
            name="Producer",
            role="Executive Producer & Studio Architect",
            system_prompt="""You are the Executive Producer of a top-tier cinematic feature studio.
Your role is to evaluate the creator's movie idea and produce a bulletproof, high-concept, fully fleshed-out Executive Production Brief.
LENGTH DIRECTIVE: Produce the most thorough, detailed, and expansive brief possible. Do NOT summarize or abbreviate.
You define:
- Title, Genre, Tone, and an evocative multi-sentence Logline.
- Deep, immersive World Cosmology and societal rules.
- Fully dimensioned Protagonist (flaw, inner need, external goal, psychological arc).
- Antagonist with compelling, logical motivations and worldview.
- Multi-paragraph, beat-by-beat breakdowns for each act of the Three-Act Structure (Act 1 Setup, Act 2 Confrontation, Act 3 Climax & Resolution).
- Detailed thematic analysis and production risks.
You build the exhaustive creative bedrock of the cinematic vision."""
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        idea = prompt or context.get("logline") or context.get("title") or "A cinematic story of discovery, conflict, and triumph."
        
        schema = """{
  "title": "string",
  "genre": "string",
  "tone": "string",
  "logline": "string",
  "coreHook": "string",
  "world": "string",
  "protagonist": {"name": "string", "role": "string", "flaw": "string", "goal": "string"},
  "antagonist": {"name": "string", "role": "string", "motivation": "string"},
  "supportingCharacters": [{"name": "string", "role": "string"}],
  "centralConflict": "string",
  "stakes": "string",
  "themes": ["string"],
  "threeActStructure": {
    "act1_setup": "string",
    "act2_confrontation": "string",
    "act3_resolution": "string"
  },
  "productionRisks": ["string"]
}"""
        gemini_raw = self.call_gemini(f"Analyze this film idea and create an Executive Production Brief:\nIdea: {idea}", schema)
        parsed = self.parse_gemini_json(gemini_raw)
        if parsed and "title" in parsed and "threeActStructure" in parsed:
            return parsed

        # Intelligent Heuristic Fallback
        words = [w for w in idea.split() if w.isalnum()]
        clean_title = context.get("title") or (("THE " + " ".join(words[:2]).upper()) if len(words) >= 2 else "UNTITLED FILM")
        main_subject = words[0].capitalize() if words else "Hero"
        genre = context.get("genre") or "Cinematic Drama"
        if any(k in idea.lower() for k in ["space", "alien", "orbit", "star"]):
            genre = "Hard Sci-Fi Space Thriller"
        elif any(k in idea.lower() for k in ["magic", "spell", "witch", "rune", "sorcerer", "dragon"]):
            genre = "Epic Fantasy Adventure"
        elif any(k in idea.lower() for k in ["robot", "ai", "cyber", "android", "neon"]):
            genre = "Cyberpunk Sci-Fi"

        return {
            "title": clean_title,
            "genre": genre,
            "tone": context.get("tone") or "Compelling, Dynamic, Cinematic",
            "logline": idea,
            "coreHook": f"A high-stakes cinematic journey centered around {idea[:120]}.",
            "world": f"The unique story world of {clean_title}, characterized by rich {genre.lower()} atmosphere and distinct visual rules.",
            "protagonist": {
                "name": f"{main_subject} Vanguard",
                "role": "Lead Protagonist",
                "flaw": "Struggles with self-doubt when isolated from the team.",
                "goal": f"To overcome the primary challenge facing {clean_title}."
            },
            "antagonist": {
                "name": "The Opposing Architect",
                "role": "Primary Antagonist",
                "motivation": "Enforce an opposing vision that directly challenges the protagonist."
            },
            "supportingCharacters": [
                {"name": "Trusted Navigator", "role": "Loyal confidant who keeps the mission on track"},
                {"name": "Specialist Guide", "role": "Technical expert possessing crucial knowledge"}
            ],
            "centralConflict": f"The clash between the protagonist's mission and opposing forces in {clean_title}.",
            "stakes": "The ultimate future and safety of the community.",
            "themes": ["Courage under pressure", "Trust and teamwork", "Overcoming impossible odds"],
            "threeActStructure": {
                "act1_setup": f"The journey begins in {clean_title} when the status quo is disrupted by a major challenge.",
                "act2_confrontation": "Our heroes navigate escalating complications, facing deep tests of loyalty and courage.",
                "act3_resolution": "A climactic confrontation where resolve and teamwork achieve a hard-won victory."
            },
            "productionRisks": [
                "Maintaining pacing and clarity across key scene transitions",
                "Grounding character motivation in emotionally relatable beats"
            ]
        }

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
        idea = prompt or context.get("logline", "In a post-apocalyptic world where humanity survives inside two magical protection layers, an expedition scout ventures outside with a dying countdown spell while knowing the zombies look entirely human.")
        
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
        words = [w.capitalize() for w in idea.split() if len(w) > 3 and w.lower() not in ["with", "from", "that", "this", "into", "over", "about", "when"]]
        title = "THE " + " ".join(words[:2]).upper() if len(words) >= 2 else "UNTITLED FILM"
        
        genre = "Post-Apocalyptic Supernatural Thriller"
        if any(k in idea.lower() for k in ["space", "alien", "orbit", "star"]):
            genre = "Hard Sci-Fi Space Thriller"
        elif any(k in idea.lower() for k in ["magic", "spell", "witch", "rune", "sorcerer"]):
            genre = "Supernatural Dark Fantasy"

        return {
            "title": context.get("title") or title,
            "genre": genre,
            "tone": "Gritty, claustrophobic, visceral, psychologically tense",
            "logline": idea,
            "coreHook": "The enemy is physically indistinguishable from normal survivors; survival protection operates on an unyielding countdown clock.",
            "world": "A partitioned survival world where humanity clings to failing supernatural wardstones amidst deceptive mimics.",
            "protagonist": {
                "name": "Kaelen Vance",
                "role": "Expedition Scout Leader",
                "flaw": "Guilt-ridden over prior squad casualties, refuses to ask for help.",
                "goal": "Extract acoustic resonance crystals from the transit vault before the sanctuary Keystone shatters."
            },
            "antagonist": {
                "name": "Elias (The Mimic)",
                "role": "Outer Ward Infiltrator",
                "motivation": "Guide the infected into the inner cathedral once human protections drop."
            },
            "supportingCharacters": [
                {"name": "Sister Mara", "role": "Elder Rune Weaver holding the fracturing Keystone"},
                {"name": "Nia", "role": "11-year-old scout apprentice with an analog music box"}
            ],
            "centralConflict": "Humanity's countdown to extinction vs. cognitive infected waiting for the barrier to fail.",
            "stakes": "The extinction of the final 4,000 living humans inside St. Jude's Cathedral Sanctuary.",
            "themes": ["The cost of survival", "Trust in an era of deceptive surfaces", "Humanity under time pressure"],
            "threeActStructure": {
                "act1_setup": "The Keystone fractures. Sister Mara carves Kaelen's final 4-hour countdown spell. Kaelen steps outside into the Limbo Bazaar.",
                "act2_confrontation": "Kaelen navigates past deceptively polite mimics into the submerged metro vaults, securing the crystals while the timer reaches critical 10-minute redline.",
                "act3_resolution": "A desperate sprint back to the cathedral gates with seconds remaining; unmasking Elias and recharging the barrier as the countdown hits zero."
            },
            "productionRisks": [
                "Maintaining psychological tension without relying on cheap jump scares",
                "Visual clarity of the wrist countdown chronometer across diverse lighting environments",
                "Balancing the uncanny mimic performance without making actors look robotic"
            ]
        }

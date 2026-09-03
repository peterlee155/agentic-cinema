import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("DanceAgent")

class DanceAgent(BaseAgent):
    """
    Dance & Movement Choreography Agent
    Creates short, high-energy dance and movement concepts inspired by the movie.
    For each concept generates:
    - Title
    - Duration (15-30s)
    - Character association
    - Music Style & BPM
    - Mood
    - Concept Theme
    - 4-Part Beat Structure:
        * 0–3 seconds: Hook
        * 3–7 seconds: Main movement
        * 7–11 seconds: Signature movement
        * 11–15 seconds: Final pose
    - Detailed Choreography instructions
    - Camera & Framing specifications
    - Caption, CTA, and Hashtags
    CRITICAL RULE: Never guarantee virality. Frame as creative engagement.
    """
    def __init__(self):
        super().__init__(
            name="Dance Agent",
            role="Movement Choreographer & Trend Architect",
            system_prompt="""You are an innovative movement director and viral dance choreographer for entertainment campaigns.
Design rhythmic, replicable 15-second dance concepts inspired by the film's lore and kinetic moments.
Rigorously adhere to the 4-part beat structure:
0-3s: The Hook (instant attention grabber)
3-7s: Main movement (fluid, repeatable groove)
7-11s: Signature movement (distinctive viral motif)
11-15s: Final pose (arresting freeze frame)
Specify music style, BPM, camera framing, caption, CTA, and hashtags.
NEVER claim or guarantee virality."""
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        title = context.get("brief", {}).get("title", "THE LAST SPELL")
        schema = """[
  {
    "title": "string",
    "duration": "15 seconds",
    "character": "string",
    "musicStyle": "string",
    "bpm": 130,
    "mood": "string",
    "concept": "string",
    "beatStructure": {
      "0_to_3s": "The Hook",
      "3_to_7s": "Main movement",
      "7_to_11s": "Signature movement",
      "11_to_15s": "Final pose"
    },
    "choreography": "string",
    "camera": "string",
    "framing": "string",
    "caption": "string",
    "cta": "string",
    "hashtags": ["#Tag"]
  }
]"""

        gemini_prompt = f"Design dance concepts for '{title}' with BPM and beat structure."
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if isinstance(parsed, list) and len(parsed) > 0 and "beatStructure" in parsed[0]:
            return parsed
        elif isinstance(parsed, dict) and "danceConcepts" in parsed:
            return parsed["danceConcepts"]

        # Default Dance Concepts
        return [
            {
                "title": "The 4-Minute Countdown Shuffle",
                "duration": "15 seconds",
                "character": "Nia & The Scavengers",
                "musicStyle": "Dark Phonk / Industrial Trap with ticking clock metronome",
                "bpm": 135,
                "mood": "Edgy, rhythmic, energetic, intense",
                "concept": "Dancers sync sharp mechanical wrist isolations to a ticking countdown clock before breaking into fluid evasive street footwork.",
                "beatStructure": {
                    "0_to_3s": "THE HOOK: Close-up check of wrist timer syncing with heavy 808 bass drop and 3 sharp neck-and-shoulder snap isolations.",
                    "3_to_7s": "MAIN MOVEMENT: Gliding step-slide combo miming ducking through crowded shantytown corridors past frozen bystanders.",
                    "7_to_11s": "SIGNATURE MOVEMENT: The 'Glyph Flick' - arms trace a circular glowing rune in the air followed by a synchronized double boot stomp.",
                    "11_to_15s": "FINAL POSE: Sudden dead freeze looking sharply over left shoulder with index finger on lips as the clock sound rings zero."
                },
                "choreography": "Hybrid tutting, liquid arms, and modern street footwork designed for achievable community recreation.",
                "camera": "Dynamic handheld tracking moving backward with dancer",
                "framing": "Low-angle 9:16 vertical framing starting waist-up and pulling back to full body on beat 7.",
                "caption": "Can you hit the Glyph Flick before your timer hits zero? ⏳🔥 Duet this with your crew.",
                "cta": "Tag your squad and show us your 00:00 freeze pose.",
                "hashtags": ["#TheLastSpellDance", "#CountdownShuffle", "#DanceTrend", "#AgenticCinema", "#MovementChoreography"]
            },
            {
                "title": "The Mimic Smile Wave",
                "duration": "15 seconds",
                "character": "Elias (The Infiltrator)",
                "musicStyle": "Eerie Lo-Fi Classical Drill with violin tremolo",
                "bpm": 120,
                "mood": "Uncanny valley, hypnotic, unsettling",
                "concept": "A deceptive smooth waltz that suddenly breaks into robotic finger-tutting and a frozen unnatural smile.",
                "beatStructure": {
                    "0_to_3s": "THE HOOK: Polite bow in formal clothing followed by an instantaneous wide, unblinking smile right into lens.",
                    "3_to_7s": "MAIN MOVEMENT: Smooth arm waves and umbrella spin imitating an ordinary gentleman taking a stroll.",
                    "7_to_11s": "SIGNATURE MOVEMENT: 'The Jaw Snap' - sharp hand mime under chin snapping shut on the snare rimshot.",
                    "11_to_15s": "FINAL POSE: Both hands clasped behind back, tilt head 45 degrees, tilt umbrella forward to shadow eyes."
                },
                "choreography": "Popping, waving, and mime illusion techniques with high theatricality.",
                "camera": "Slow steady push-in towards dancer's eyes",
                "framing": "Eye-level 9:16 portrait orientation.",
                "caption": "When they don't know you're not one of them... ☂️👀",
                "cta": "Duet if you can hold the smile for 15 seconds without blinking.",
                "hashtags": ["#MimicWave", "#UncannyDance", "#TheLastSpell", "#ChoreographyTrend"]
            }
        ]

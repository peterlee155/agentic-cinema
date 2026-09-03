import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("ScreenwriterAgent")

class ScreenwriterAgent(BaseAgent):
    """
    Screenwriter Agent: Master Dramatist & Screenplay Architect
    Input: Production Brief from Producer Agent.
    Generates structured screenplay scenes where every scene rigorously includes:
    - Scene Number
    - INT/EXT & Location & Time (Slugline)
    - Characters present
    - Objective
    - Conflict
    - Action (Show, Don't Tell)
    - Dialogue
    - Emotional Beat
    - Transition
    Enforces 'SHOW, DON'T TELL': every scene moves story forward, reveals character,
    increases tension, delivers information, or sets up/pays off narrative stakes.
    """
    def __init__(self):
        super().__init__(
            name="Screenwriter",
            role="Lead Screenwriter & Dramatist",
            system_prompt="""You are an award-winning Hollywood Screenwriter known for visceral storytelling and disciplined screenplay structure.
PHILOSOPHY: SHOW, DON'T TELL.
LENGTH DIRECTIVE: Write EXTENSIVE, full-length cinematic screenplay scenes. Do NOT summarize or abbreviate.
Every scene you write MUST:
1. Move the story forward with rich, multi-paragraph action and environmental descriptions.
2. Reveal character behavior through extended dialogue exchanges (multiple lines per character) filled with subtext, tension, and realistic cadence.
3. Increase tension or conflict in every beat.
4. Deliver crucial story information visually through behavior rather than exposition.
5. Create a profound, palpable emotional beat.
6. Set up or pay off a key narrative device.
Output ONLY structured JSON scenes containing: sceneNumber, slugline, intExt, location, time, characters, objective, conflict, action, dialogue, emotionalBeat, transition."""
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        brief = context.get("brief", {})
        title = brief.get("title", "THE LAST SPELL")
        logline = brief.get("logline", prompt)
        structure = brief.get("threeActStructure", {})

        schema = """[
  {
    "sceneNumber": 1,
    "slugline": "EXT. LOCATION - TIME",
    "intExt": "EXT",
    "location": "Specific Location Name",
    "time": "DUSK",
    "characters": ["Character Name"],
    "objective": "What character needs to achieve right now",
    "conflict": "The immediate physical or psychological obstacle",
    "action": "Visual description adhering to SHOW, DON'T TELL",
    "dialogue": "CHARACTER\\nDialogue line with subtext.",
    "emotionalBeat": "Specific emotional resonance of this scene",
    "transition": "CUT TO:"
  }
]"""

        gemini_prompt = f"Write a 5-scene cinematic screenplay for '{title}'.\nLogline: {logline}\nThree-Act Structure: {structure}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if isinstance(parsed, list) and len(parsed) > 0 and "slugline" in parsed[0]:
            return parsed
        elif isinstance(parsed, dict) and "scenes" in parsed:
            return parsed["scenes"]

        # Default Show-Don't-Tell Screenplay
        return [
            {
                "sceneNumber": 1,
                "slugline": "EXT. ST. JUDE'S INNER SANCTUARY - DUSK",
                "intExt": "EXT",
                "location": "St. Jude's Inner Sanctuary Perimeter",
                "time": "DUSK",
                "characters": ["Kaelen Vance", "Sister Mara"],
                "objective": "Kaelen must receive the expedition protection spell despite Sister Mara's warning of its rapid decay.",
                "conflict": "The Keystone Wardstone is cracking; Sister Mara can only guarantee four hours instead of twelve.",
                "action": "Rain lashes against the shimmering violet dome. Sister Mara presses a burning bone stylus into Kaelen's left forearm. Runic smoke hisses in the chill air. A glowing amber countdown glyph illuminates beneath his skin: 04:00:00. Through the barrier glass, normal-looking citizens in trench coats stand silently in the mist, staring unblinkingly at the gates.",
                "dialogue": "MARA\nFour hours, Kaelen. Not a second more. The Keystone is bleeding light. If the glyph fades before you reach the vaults, you won't smell like a living man anymore.\n\nKAELEN\nI don't need twelve hours. Just enough to pull the crystals and make it back.\n\nMARA\nRemember: they don't growl. They don't limp. They sit next to you, and they ask about your family.",
                "emotionalBeat": "Dread tempered by quiet resolve. The ticking clock begins.",
                "transition": "SMASH CUT TO:"
            },
            {
                "sceneNumber": 2,
                "slugline": "EXT. THE LIMBO BAZAAR - NIGHT",
                "intExt": "EXT",
                "location": "The Limbo Bazaar (Outer Barrier)",
                "time": "NIGHT",
                "characters": ["Kaelen Vance", "Elias (The Mimic)", "Nia"],
                "objective": "Kaelen navigates the outer market to locate the maintenance map for the underground rail tunnel.",
                "conflict": "An apparently gentle gentleman (Elias) blocks his passage with unsettling small talk while Kaelen's wrist timer visibly decrements.",
                "action": "Kaelen pushes through the crowded shipping container corridor. Stalls sell synthetic broth. A young girl, Nia, signals from a rooftop catwalk. Suddenly, Elias steps out from under a striped awning, wearing a dry tweed jacket and holding an umbrella. Kaelen's hand instinctively drops to his holster.",
                "dialogue": "ELIAS\nTerrible evening for a walk toward the sector line, Vance. The broth at Stall 4 is hot, if you care to rest.\n\nKAELEN\nI have business at the transformer station, Elias. Move aside.\n\nELIAS\n(Smiles warmly)\nBusiness. We all have business. But tell me... does your arm burn as hot as it did last winter? It looks... dim.",
                "emotionalBeat": "Skin-crawling psychological tension. The antagonist senses vulnerability without breaking disguise.",
                "transition": "DISSOLVE TO:"
            },
            {
                "sceneNumber": 3,
                "slugline": "INT. SUBTERRANEAN METRO CONCOURSE - NIGHT",
                "intExt": "INT",
                "location": "The Dead Metro Vaults",
                "time": "NIGHT",
                "characters": ["Kaelen Vance", "Nia"],
                "objective": "Extract the copper-alloy acoustic crystals from the sealed transit command vault before the timer drops below thirty minutes.",
                "conflict": "The security door is rusted shut and mechanical noise threatens to draw the mimics hunting in the dark.",
                "action": "Kaelen's wrist glyph reads: 00:38:14. Amber light pulses faintly against wet black subway tiles. Nia holds her brass wind-up music box, listening to echoes down the empty rail tunnel. Kaelen wedges a crowbar into the hydraulic vault hatch. Metal groans. From three hundred yards down the tracks, polite human whistling begins.",
                "dialogue": "NIA\n(Whispering)\nThey're whistling the national anthem. Just like last week.\n\nKAELEN\nKeep the music box wound. When the hatch pops, grab the cylinder case and don't look back.",
                "emotionalBeat": "High-stakes stealth and clock-ticking claustrophobia.",
                "transition": "CUT TO:"
            },
            {
                "sceneNumber": 4,
                "slugline": "EXT. FLOODED TRANSIT YARD - DAWN",
                "intExt": "EXT",
                "location": "The Dead Expanse Outside Barrier",
                "time": "DAWN",
                "characters": ["Kaelen Vance", "Elias (The Mimic)", "Nia"],
                "objective": "Escape back to the outer perimeter with the crystal canister while the spell enters its final sixty seconds.",
                "conflict": "Elias and three 'citizens' surround the railway bridge, their smiles frozen as the rain washes away their pretense.",
                "action": "Kaelen runs through knee-deep black water, clutching the heavy steel canister. Nia is ahead, scrambling up the perimeter ladder. Kaelen's wrist glyph flashes violently: 00:01:12... 00:00:58. Elias stands on the bridge footing. His voice is perfectly modulated, but his jaw dislocates slightly as he speaks.",
                "dialogue": "ELIAS\nThirty seconds, Kaelen. Then you smell like home to all of us.\n\nKAELEN\n(Raising weapon)\nThen take your shot while I'm still human.",
                "emotionalBeat": "Adrenaline-fueled climax. Humanity measured in heartbeats.",
                "transition": "MATCH CUT TO:"
            },
            {
                "sceneNumber": 5,
                "slugline": "INT. ST. JUDE'S CATHEDRAL NAVE - DAWN",
                "intExt": "INT",
                "location": "St. Jude's Inner Sanctuary",
                "time": "DAWN",
                "characters": ["Kaelen Vance", "Sister Mara", "Nia"],
                "objective": "Lock the crystal into the Keystone altar to renew the barrier before the outer perimeter falls.",
                "conflict": "The wrist glyph expires at 00:00:00 as Kaelen slams through the inner airlock, proving he brought no infection inside.",
                "action": "Kaelen slides across the marble floor as the cathedral airlock slams shut. Outside the reinforced blast glass, dozens of calm, rain-soaked figures stare through the pane. Kaelen drops the acoustic crystal into the altar well. A resonant gold shockwave explodes outward, recharging the shimmering dome. On his wrist, the glyph burns out into a dead gray ash line.",
                "dialogue": "MARA\n(Tears in eyes)\nIt holds. The city lives.\n\nKAELEN\nFor now. But Elias was standing outside the glass, Mara. And he wasn't looking at the barrier. He was looking at Nia.",
                "emotionalBeat": "Victorious relief undercut by chilling revelation of the next war.",
                "transition": "FADE OUT."
            }
        ]

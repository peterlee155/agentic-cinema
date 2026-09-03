import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("ArtDirectorAgent")

class ArtDirectorAgent(BaseAgent):
    """
    Art Director Agent: Production Designer & World Stylist
    Creates the Production Visual Bible:
    - Characters: Name, Age, Appearance, Hair, Clothing, Props, Color Palette, Visual Evolution.
    - Locations: Architecture, Geography, Weather, Materials, Objects, Lighting, Color Palette.
    Maintains rigid visual consistency and design aesthetics across all assets.
    """
    def __init__(self):
        super().__init__(
            name="Art Director",
            role="Production Designer & Visual Stylist",
            system_prompt="""You are a world-renowned Film Production Designer and Art Director.
Your task is to establish the complete, exhaustive visual bible for all characters and locations.
LENGTH DIRECTIVE: Provide deep, granular descriptions with maximum visual richness. Do NOT abbreviate.
For Characters: Detail exact physical features, scars, gait, hair styling, multi-layer wardrobe (fabrics, stitching, distress aging), signature props with intricate mechanical or historical backstories, explicit color palettes with hex codes, and a detailed chronological Visual Evolution explaining how trauma and environment physically alter them.
For Locations: Detail complete architectural styles, structural materials, environmental weathering, ambient micro-climates, key interactive objects, lighting color temperature, and atmospheric mood.
Ensure absolute visual continuity across the entire universe."""
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        brief = context.get("brief", {})
        scenes = context.get("scenes", []) or context.get("screenplay", [])

        schema = """{
  "characters": [
    {
      "name": "string",
      "age": 30,
      "role": "string",
      "appearance": "string",
      "hair": "string",
      "clothing": "string",
      "props": "string",
      "colorPalette": "string",
      "visualEvolution": "string"
    }
  ],
  "locations": [
    {
      "name": "string",
      "architecture": "string",
      "geography": "string",
      "weather": "string",
      "materials": "string",
      "objects": "string",
      "lighting": "string",
      "colorPalette": "string"
    }
  ]
}"""

        gemini_prompt = f"Design visual characters and locations for:\nTitle: {brief.get('title')}\nLogline: {brief.get('logline')}\nScenes: {str(scenes)[:1500]}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if parsed and "characters" in parsed and "locations" in parsed:
            return parsed

        # Default Production Visual Bible
        return {
            "characters": [
                {
                    "name": "Kaelen Vance",
                    "age": 34,
                    "role": "Expedition Scout Leader (Protagonist)",
                    "appearance": "Athletic, weather-beaten, scar across left eyebrow, dark brooding gaze.",
                    "hair": "Short cropped raven hair dusted with soot.",
                    "clothing": "Reinforced charcoal canvas duster coat, tactical holster, worn leather combat gloves.",
                    "props": "Carved runic wrist chronometer, suppressed 9mm sidearm, analog Geiger-frequency meter.",
                    "colorPalette": "#111827 (Charcoal), #FF9900 (Amber Glow), #4B5563 (Slate)",
                    "visualEvolution": "Starts confident with bright wrist runes; by Act 3, coat is shredded, runes flicker red, eyes hollow with exhaustion."
                },
                {
                    "name": "Sister Mara",
                    "age": 58,
                    "role": "Rune Weaver & Sanctuary Elder",
                    "appearance": "Regal yet frail, etched runic silver tattoos across fingertips, piercing silver eyes.",
                    "hair": "Long silver braid wrapped with thin copper wire.",
                    "clothing": "Heavy emerald-green wool vestments lined with runic gold thread.",
                    "props": "Bone etching stylus, mercury ampoules, sanctuary Keystone resonance bell.",
                    "colorPalette": "#064E3B (Emerald), #D97706 (Amber), #F3F4F6 (Silver)",
                    "visualEvolution": "Weakens as the Keystone stone fractures, hands trembling as she carves Kaelen's final spell."
                },
                {
                    "name": "Elias (The Mimic)",
                    "age": 38,
                    "role": "Outer Ward Infiltrator (Antagonist)",
                    "appearance": "Impeccably neat, unnaturally calm smile, pale translucent skin with faint blue veins.",
                    "hair": "Neatly combed ash-blonde hair.",
                    "clothing": "Pre-collapse gray tweed blazer over a wool turtleneck, clean polished leather boots.",
                    "props": "Silver pocket watch that doesn't tick, antique tea tin with dried seeds.",
                    "colorPalette": "#374151 (Cold Gray), #93C5FD (Vein Blue), #1F2937 (Shadow)",
                    "visualEvolution": "Appears warm and friendly at the Limbo Bazaar; reveals black dilated pupils and predatory calm as Kaelen's timer ticks down."
                },
                {
                    "name": "Nia",
                    "age": 11,
                    "role": "Scavenger Apprentice & Look-out",
                    "appearance": "Quick, wiry, observant eyes, smudge of grease on right cheek.",
                    "hair": "Disheveled messy dark curls tied with yellow cable wire.",
                    "clothing": "Oversized faded navy flight jacket with rolled cuffs, combat boots two sizes too big.",
                    "props": "Brass binoculars, wind-up music box that calms jittery infected.",
                    "colorPalette": "#1E3A8A (Navy), #FBBF24 (Safety Yellow), #78350F (Earth)",
                    "visualEvolution": "Transitions from fearful child behind sanctuary gates to crucial partner timing Kaelen's extraction."
                }
            ],
            "locations": [
                {
                    "name": "St. Jude's Inner Sanctuary",
                    "architecture": "Gothic Revival stone cathedral retrofitted with heavy steel pressure doors and pulsing copper rune conduits.",
                    "geography": "Perched on the highest granite hill overlooking the flooded downtown grid.",
                    "weather": "Cold mountain draft, perpetual fog pressing against glowing gold barrier dome.",
                    "materials": "Centuries-old granite, polished brass conduits, beeswax candles, iron barricades.",
                    "objects": "The Keystone Wardstone (fracturing on altar), etching benches, sleeping cots.",
                    "lighting": "Warm candle amber and deep violet barrier luminescence.",
                    "colorPalette": "#1E1B4B (Deep Violet), #D97706 (Amber), #1F2937 (Granite Gray)"
                },
                {
                    "name": "The Limbo Bazaar (Outer Barrier)",
                    "architecture": "Multi-tier shantytown built inside rusted intermodal shipping containers under the secondary translucent shield.",
                    "geography": "The old railway freight station between the sanctuary gates and the wasteland.",
                    "weather": "Constant industrial smog, sulfurous drizzle dripping from corrugated sheet roofs.",
                    "materials": "Corrugated iron, rusted shipping containers, blue polyethylene tarps, barrel braziers.",
                    "objects": "Makeshift market stalls selling dried lichen, battery cells, unverified relics.",
                    "lighting": "Flickering sodium vapor lamps, glowing braziers, murky yellow rain.",
                    "colorPalette": "#78350F (Rust), #F59E0B (Sodium Gold), #064E3B (Tarp Green)"
                },
                {
                    "name": "The Dead Metro Vaults",
                    "architecture": "Subterranean concrete transit concourse choked by black calcified mold and derelict subway trains.",
                    "geography": "Four levels beneath downtown financial district, entirely outside protection.",
                    "weather": "Sub-zero underground chill, stagnant black water pools, leaking steam pipes.",
                    "materials": "Shattered ceramic white tiles, exposed rebar, rusted subway cars.",
                    "objects": "Sub-vault security safe holding acoustic crystal canisters, emergency rail lanterns.",
                    "lighting": "Pitch black pierced only by Kaelen's weapon light and fading wrist glyph.",
                    "colorPalette": "#030712 (Abyssal Black), #06B6D4 (Cyan Flash), #DC2626 (Critical Red)"
                }
            ]
        }

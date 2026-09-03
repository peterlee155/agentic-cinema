"""
Master Project Bible for Agentic Cinema.
Maintains canonical project state across all AI agents:
{
    project,
    characters,
    locations,
    worldRules,
    timeline,
    scenes,
    screenplay,
    storyboard,
    shots,
    cinematography,
    audio,
    editPlan,
    socialContent,
    danceConcepts
}
Provides default demo project 'AGENTIC CINEMA DEMO' and methods for serialization,
JSON export, Fountain screenplay export, and Hollywood Master Bible rendering.
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Any, Optional

class ProjectBible:
    def __init__(self, project_id: str = "proj_demo"):
        self.project_id = project_id
        self.created_at = datetime.utcnow().isoformat()
        self.updated_at = datetime.utcnow().isoformat()

        # Canonical project state
        self.project: Dict[str, Any] = {
            "id": project_id,
            "title": "UNTITLED FILM",
            "logline": "In a post-apocalyptic world where humanity survives inside two magical protection layers, an expedition leader must venture into the infected ruins with a dying countdown spell while knowing the zombies look entirely human.",
            "genre": "Post-Apocalyptic Supernatural Thriller",
            "tone": "Gritty, tense, visceral, psychologically unsettling",
            "visualStyle": "35mm anamorphic widescreen with amber bioluminescent runes and desaturated cold rain",
            "targetDuration": "115 Minutes",
            "language": "English",
            "format": "Theatrical Feature",
            "platform": "Cinema",
            "episodeCount": 1,
            "episodeDuration": "115 Minutes",
            "productionScale": "Hollywood Studio Tentpole",
            "targetAudience": "Young Adults (18-25) & General (PG-13)",
            "budget": "$12.5M",
            "budgetType": "ESTIMATED",
            "stage": "PRODUCTION_READY",
            "credits_used": 42,
            "credits_total": 250,
            "plan": "PRO"
        }

        self.characters: List[Dict[str, Any]] = []
        self.locations: List[Dict[str, Any]] = []
        self.worldRules: List[Dict[str, Any]] = []
        self.timeline: List[Dict[str, Any]] = []
        self.scenes: List[Dict[str, Any]] = []
        self.screenplay: List[Dict[str, Any]] = []
        self.storyboard: List[Dict[str, Any]] = []
        self.shots: List[Dict[str, Any]] = []
        self.cinematography: List[Dict[str, Any]] = []
        self.audio: List[Dict[str, Any]] = []
        self.editPlan: Dict[str, Any] = {}
        self.socialContent: Dict[str, Any] = {}
        self.danceConcepts: List[Dict[str, Any]] = []
        self.continuityLog: List[Dict[str, Any]] = []
        self.cast: List[Dict[str, Any]] = []

    def to_dict(self) -> Dict[str, Any]:
        """Returns the canonical project dictionary."""
        return {
            "project": self.project,
            "characters": self.characters,
            "locations": self.locations,
            "worldRules": self.worldRules,
            "timeline": self.timeline,
            "scenes": self.scenes,
            "screenplay": self.screenplay,
            "storyboard": self.storyboard,
            "shots": self.shots,
            "cinematography": self.cinematography,
            "audio": self.audio,
            "editPlan": self.editPlan,
            "socialContent": self.socialContent,
            "danceConcepts": self.danceConcepts,
            "continuityLog": self.continuityLog,
            "cast": self.cast,
            "updated_at": self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ProjectBible":
        bible = cls(project_id=data.get("project", {}).get("id", "proj_001"))
        bible.project = data.get("project", bible.project)
        bible.characters = data.get("characters", [])
        bible.locations = data.get("locations", [])
        bible.worldRules = data.get("worldRules", [])
        bible.timeline = data.get("timeline", [])
        bible.scenes = data.get("scenes", [])
        bible.screenplay = data.get("screenplay", bible.scenes)
        bible.storyboard = data.get("storyboard", [])
        bible.shots = data.get("shots", [])
        bible.cinematography = data.get("cinematography", [])
        bible.audio = data.get("audio", [])
        bible.editPlan = data.get("editPlan", {})
        bible.socialContent = data.get("socialContent", {})
        bible.danceConcepts = data.get("danceConcepts", [])
        bible.continuityLog = data.get("continuityLog", [])
        bible.cast = data.get("cast", [])
        bible.updated_at = data.get("updated_at", datetime.utcnow().isoformat())
        return bible

    def save_to_file(self, filepath: str):
        self.updated_at = datetime.utcnow().isoformat()
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=2, ensure_ascii=False)

    @staticmethod
    def calculate_dynamic_budget(format_name: str = "Theatrical Feature", episode_count: int = 1, scale: str = "Hollywood Studio Tentpole") -> str:
        """Calculates dynamic Hollywood or Indie production budget based on format, scale, and episode count."""
        fmt = (format_name or "").lower()
        scl = (scale or "").lower()

        # Scale multiplier
        scale_mult = 1.0
        if "indie" in scl or "small" in scl:
            scale_mult = 0.25
        elif "mid" in scl:
            scale_mult = 0.75
        elif "hollywood" in scl or "tentpole" in scl or "blockbuster" in scl:
            scale_mult = 2.5

        if "tiktok" in fmt or "reels" in fmt or "shorts" in fmt or "vertical" in fmt or "short-form" in fmt or "micro" in fmt:
            cost_per_ep = 450 * scale_mult
            total = cost_per_ep * max(1, int(episode_count or 1))
            return f"${int(total):,}"
        elif "tv" in fmt or "series" in fmt or "web" in fmt or "episodic" in fmt:
            cost_per_ep = 2500000 * scale_mult
            total = cost_per_ep * max(1, int(episode_count or 1))
            return f"${int(total):,}"
        elif "short film" in fmt:
            total = 50000 * scale_mult
            return f"${int(total):,}"
        else: # Theatrical Feature
            total = 48000000 * scale_mult
            return f"${int(total):,}"

    @staticmethod
    def seconds_to_hms(seconds: int) -> str:
        s = max(0, int(seconds))
        h = s // 3600
        m = (s % 3600) // 60
        sec = s % 60
        return f"{h:02d}:{m:02d}:{sec:02d}"

    @classmethod
    def build_canonical_timeline(cls, total_scenes: int = 60, total_duration_seconds: int = 14400) -> List[Dict[str, Any]]:
        """
        Builds a strictly monotonic canonical timeline for the production bible.
        Guarantees:
        1. Elapsed story time strictly increases across every scene.
        2. Remaining runic countdown timer strictly decreases from 04:00:00 down to 00:00:00.
        3. Strict adherence to Rule 04 and Rule 07 (Crimson state under 15m).
        """
        timeline = []
        act_locations = {
            "ACT I": [
                "St. Jude's Inner Sanctuary Perimeter",
                "The Inner Cloister Vault",
                "Sanctuary Gate Threshold",
                "The Limbo Bazaar (Outer Barrier)",
                "The Limbo Bazaar - Sector 4 Stalls"
            ],
            "ACT II-A": [
                "The Dead Expanse - High Rail Viaduct",
                "Flooded Subway Concourse (Line 4)",
                "Subterranean Metro Concourse",
                "Downtown Transit Junction",
                "Downtown Research Vault Approach"
            ],
            "ACT II-B": [
                "The Downtown Research Vault",
                "Research Vault Sub-Level 4 Safe",
                "Flooded Tunnel Breach Point",
                "The High Rail Viaduct Crossing",
                "Flooded Transit Yard"
            ],
            "ACT III": [
                "The Dead Expanse - Shattered Bridge",
                "Outer Barrier Perimeter Scaffolding",
                "The Limbo Bazaar Threshold",
                "St. Jude's Sanctuary Gates",
                "St. Jude's Cathedral Nave Altar"
            ]
        }

        for s in range(1, total_scenes + 1):
            if s <= 15:
                act = "ACT I"
                time_of_day = "DUSK" if s <= 6 else "NIGHT"
            elif s <= 30:
                act = "ACT II-A"
                time_of_day = "NIGHT"
            elif s <= 45:
                act = "ACT II-B"
                time_of_day = "LATE NIGHT" if s <= 40 else "PRE-DAWN"
            else:
                act = "ACT III"
                time_of_day = "PRE-DAWN" if s <= 54 else "DAWN"

            if total_scenes > 1:
                elapsed = int(((s - 1) / (total_scenes - 1)) * total_duration_seconds)
            else:
                elapsed = 0

            remaining = max(0, total_duration_seconds - elapsed)

            if remaining == 0:
                status = "EXPIRED"
            elif remaining <= 900:  # <= 15 minutes (Rule 07: turns crimson & hisses)
                status = "CRITICAL"
            elif remaining <= 3600:  # <= 1 hour
                status = "CAUTION"
            else:
                status = "OPTIMAL"

            loc_list = act_locations[act]
            location = loc_list[(s - 1) % len(loc_list)]

            timeline.append({
                "scene": s,
                "act": act,
                "elapsed_story_seconds": elapsed,
                "elapsed_story_time": cls.seconds_to_hms(elapsed),
                "remaining_timer_seconds": remaining,
                "remaining_timer": cls.seconds_to_hms(remaining),
                "timer_status": status,
                "time_of_day": time_of_day,
                "location": location
            })

        return timeline

    def update_storyboard_media(self, scene_num: int, frame_num: int,
                                image_url: Optional[str] = None,
                                video_url: Optional[str] = None,
                                image_status: Optional[str] = None,
                                video_status: Optional[str] = None,
                                image_error: Optional[str] = None,
                                video_error: Optional[str] = None) -> bool:
        """Updates real generated image and video URLs and statuses on a storyboard frame."""
        updated = False
        for item in self.storyboard:
            if item.get("scene") == scene_num and item.get("frame") == frame_num:
                if image_url is not None:
                    item["imageUrl"] = image_url
                if video_url is not None:
                    item["videoUrl"] = video_url
                if image_status is not None:
                    item["imageStatus"] = image_status
                if video_status is not None:
                    item["videoStatus"] = video_status
                if image_error is not None:
                    item["imageError"] = image_error
                if video_error is not None:
                    item["videoError"] = video_error
                item["updatedAt"] = datetime.utcnow().isoformat()
                updated = True
                break
        return updated

    @classmethod
    def load_from_file(cls, filepath: str) -> "ProjectBible":
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls.from_dict(data)

    @classmethod
    def create_default_demo(cls) -> "ProjectBible":
        """Creates the canonical default demo movie: AGENTIC CINEMA DEMO."""
        bible = cls(project_id="proj_demo")

        bible.project = {
            "id": "proj_demo",
            "title": "UNTITLED FILM",
            "logline": "Inside humanity's last dual-barrier sanctuary, an expedition scout ventures beyond the perimeter with a fading 4-hour protection spell, knowing the outside zombies behave like ordinary humans—and the inner barrier is dying.",
            "genre": "Post-Apocalyptic Supernatural Thriller",
            "tone": "Gritty, tense, visually cinematic, high-stakes",
            "visualStyle": "35mm Anamorphic Widescreen with glowing amber runic glyphs, drenched asphalt, and cold tungsten rain",
            "targetDuration": "112 Minutes",
            "language": "English",
            "stage": "PRODUCTION_READY",
            "credits_used": 48,
            "credits_total": 250,
            "plan": "PRO"
        }

        # Canonical Monotonic Timeline (4 Hours = 14,400s across 60 Scenes)
        bible.timeline = cls.build_canonical_timeline(60, 14400)

        bible.worldRules = [
            {
                "id": "RULE_01",
                "category": "Magic Sanctuary",
                "rule": "The Inner Sanctuary cannot be entered by zombies under any circumstance; any necrotic flesh is incinerated by the barrier.",
                "consequence": "Zombies are physically prevented from breaching the cathedral gates.",
                "strictness": "UNBREAKABLE"
            },
            {
                "id": "RULE_02",
                "category": "Dual Barrier Dynamics",
                "rule": "The Outer Barrier can be entered by zombies. Inside this buffer zone, humans and zombies exist in uneasy proximity.",
                "consequence": "Scavengers inside the outer market can never be sure who is truly human.",
                "strictness": "UNBREAKABLE"
            },
            {
                "id": "RULE_03",
                "category": "Zombie Physiology",
                "rule": "Zombies outside can behave and converse like ordinary humans, retaining cognitive speech and rational disguise until provoked.",
                "consequence": "Visual inspection cannot detect an infected mimic; only blood-frequency tests or expired protection reveals them.",
                "strictness": "UNBREAKABLE"
            },
            {
                "id": "RULE_04",
                "category": "Countdown Spell",
                "rule": "Humans leaving the sanctuary require a carved runic spell on their forearm that counts down in glowing amber embers. When it reaches zero, the human scent mask disappears instantly.",
                "consequence": "Once the countdown hits zero, all surrounding infected immediately identify the human and swarm.",
                "strictness": "UNBREAKABLE"
            },
            {
                "id": "RULE_05",
                "category": "Sanctuary Crisis",
                "rule": "The Inner Sanctuary's central wardstone is fracturing, requiring rare copper-alloy acoustic crystals from the abandoned downtown research vault before total blackout.",
                "consequence": "Humanity has less than 48 hours before the sanctuary collapses completely.",
                "strictness": "UNBREAKABLE"
            }
        ]

        bible.characters = [
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
        ]

        bible.locations = [
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
            },
            {
                "name": "The Dead Expanse (Outside Barrier)",
                "architecture": "Shattered railway bridge and flooded industrial freight yard spanning across the poisoned river.",
                "geography": "Two miles beyond the Outer Ward buffer perimeter, entirely exposed to roaming infected packs.",
                "weather": "Freezing horizontal drizzle and low-hanging sulfurous smog.",
                "materials": "Corroded steel railway girders, submerged ties, broken concrete bridge abutments.",
                "objects": "Derelict rail tankers, emergency perimeter scaffolding ladders.",
                "lighting": "Cold blue dawn twilight, piercing headlights of distant syndicate patrol drones.",
                "colorPalette": "#0F172A (Cold Slate), #DC2626 (Critical Red), #64748B (Fog Gray)"
            }
        ]

        bible.scenes = [
            {
                "sceneNumber": 1,
                "slugline": "EXT. ST. JUDE'S INNER SANCTUARY - DUSK",
                "intExt": "EXT",
                "location": "St. Jude's Inner Sanctuary Perimeter",
                "time": "DUSK",
                "characters": ["Kaelen Vance", "Sister Mara"],
                "objective": "Kaelen must receive the expedition protection spell despite Sister Mara's warning of its rapid decay.",
                "conflict": "The Keystone Wardstone is cracking; Sister Mara can only guarantee four hours instead of the standard twelve.",
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
        bible.screenplay = bible.scenes

        bible.shots = [
            {
                "sceneNumber": 1,
                "shotNumber": 1,
                "shotType": "Extreme Wide Shot",
                "cameraPosition": "High Angle Crane",
                "cameraMovement": "Slow descent through rain toward cathedral gates",
                "lens": "24mm Anamorphic",
                "composition": "Cathedral spire dominates right third; glowing barrier arcs across upper quadrant",
                "blocking": "Sister Mara stands centered before the heavy wooden doors; Kaelen kneels before her",
                "lighting": "Chiaroscuro with glowing violet rim light from the shield",
                "pacing": "Deliberate, ritualistic, reverent",
                "visualEmphasis": "The frailty of human skin against the massive supernatural shield"
            },
            {
                "sceneNumber": 1,
                "shotNumber": 2,
                "shotType": "Extreme Close-Up",
                "cameraPosition": "Eye-level Macro",
                "cameraMovement": "Locked off",
                "lens": "85mm Prime Macro",
                "composition": "Kaelen's forearm filling entire screen",
                "blocking": "Stylus carves into flesh; runic embers flare",
                "lighting": "Self-illuminating amber glyph burning at 04:00:00",
                "pacing": "Intense, tactile, visceral",
                "visualEmphasis": "The tangible, biological cost of survival magic"
            },
            {
                "sceneNumber": 2,
                "shotNumber": 1,
                "shotType": "Medium Tracking Shot",
                "cameraPosition": "Steadicam waist height",
                "cameraMovement": "Continuous lateral track walking with Kaelen",
                "lens": "35mm Prime",
                "composition": "Kaelen framed tight in foreground; background bustling with questionable survivors",
                "blocking": "Elias steps into frame from right side, matching Kaelen's walking pace seamlessly",
                "lighting": "Murky yellow sodium vapor reflections in puddles",
                "pacing": "Restless, paranoid, claustrophobic",
                "visualEmphasis": "The terrifying normalcy of the infected mimics"
            }
        ]

        bible.cinematography = [
            {
                "scene": "Cathedral & Sanctuary",
                "lensChoice": "24mm & 40mm Master Anamorphic",
                "cameraHeight": "Chest Level & Low Angle Hero",
                "depthOfField": "Deep focus on architectural stone, shallow on character portraits",
                "colorTreatment": "Rich gold, beeswax amber, deep indigo shadows",
                "mood": "Sacred, endangered sanctuary"
            },
            {
                "scene": "Limbo Bazaar",
                "lensChoice": "35mm & 50mm Anamorphic",
                "cameraHeight": "Eye Level Steadicam",
                "depthOfField": "Shallow focus to compress paranoia in crowded corridors",
                "colorTreatment": "Sodium vapor yellow, wet asphalt slate, dirty emerald green tarps",
                "mood": "Corrosive distrust, deceptive safety"
            },
            {
                "scene": "Metro Vaults & Ruins",
                "lensChoice": "18mm Ultra-Wide & 85mm Macro",
                "cameraHeight": "Ground Level looking up",
                "depthOfField": "Razor-thin depth of field highlighting the wrist countdown",
                "colorTreatment": "Monochromatic cold steel, pitch shadow, scorching emergency red",
                "mood": "Suffocating dread, relentless urgency"
            }
        ]

        bible.storyboard = [
            {
                "scene": 1,
                "frame": 1,
                "shot": "Wide Exterior Sanctuary",
                "description": "Gothic cathedral glowing behind a translucent violet forcefield under pouring rain.",
                "characterPosition": "Sister Mara in green robes at center steps, Kaelen approaching.",
                "camera": "Low angle 24mm anamorphic looking up at the spire.",
                "lighting": "Bioluminescent violet shield glow with flickering candle torches.",
                "emotion": "Solemn awe and creeping dread.",
                "action": "Kaelen stops before the elder; thunder rumbles in distance.",
                "duration": "4 seconds",
                "imagePrompt": "Google Imagen 3 specification: Cinematic 8k movie still, 16:9 widescreen, 24mm Master Anamorphic, gothic cathedral encased in a shimmering translucent violet protective forcefield dome, heavy dark rainstorm, stone steps, two cloaked figures standing in torchlight, hyperrealistic, volumetric lighting, photorealistic 35mm film grain",
                "videoPrompt": "Google Veo specification: Cinematic 24fps slow push-in crane shot descending through torrential rain toward stone cathedral steps, raindrops refracting against pulsing violet forcefield dome, atmospheric mist curling, authentic handheld inertia"
            },
            {
                "scene": 1,
                "frame": 2,
                "shot": "Extreme Close-Up Wrist Runic Inscription",
                "description": "Burning bone stylus searing a glowing amber countdown chronometer into Kaelen's forearm skin.",
                "characterPosition": "Kaelen's scarred muscular arm held rigid by Sister Mara's runic hands.",
                "camera": "85mm macro lens focused on sizzling embers.",
                "lighting": "Fiery amber light radiating from the freshly carved letters: 04:00:00.",
                "emotion": "Endured agony, irreversible commitment.",
                "action": "Smoke curls up as the numbers begin counting down: 03:59:59.",
                "duration": "3.5 seconds",
                "imagePrompt": "Google Imagen 3 specification: Macro 85mm extreme close-up, glowing magical amber runic countdown clock searing into human skin, glowing digits 04:00:00 with fiery embers and rising vapor, skin pore detail, subsurface scattering, tactile realism, dark cathedral background",
                "videoPrompt": "Google Veo specification: Macro dynamic rack focus from bone stylus tip to sizzling skin as the amber numeral 04:00:00 illuminates and transitions to 03:59:59, rising runic vapor, 24fps ultra-crisp motion"
            },
            {
                "scene": 2,
                "frame": 1,
                "shot": "Medium Two-Shot The Polite Mimic",
                "description": "Elias standing under a rusted umbrella, smiling warmly at Kaelen in a crowded shantytown.",
                "characterPosition": "Elias on the right in gray tweed; Kaelen on the left in wet charcoal coat.",
                "camera": "Eye-level 35mm shallow focus.",
                "lighting": "Grimy yellow sodium streetlights reflecting in black puddles.",
                "emotion": "Uncanny valley, psychological chills.",
                "action": "Elias smiles without blinking as Kaelen's wrist glows faintly beneath his sleeve.",
                "duration": "5 seconds",
                "imagePrompt": "Google Imagen 3 specification: Cinematic film still, 35mm anamorphic, two men confronting each other in a dystopian crowded shantytown market made of shipping containers, yellow streetlamps, wet asphalt, rain, one man in gray tweed blazer smiling unnaturally, one in weathered leather coat, tension, cinematic framing, high contrast",
                "videoPrompt": "Google Veo specification: Slow eerie tracking shot orbiting the two men under the rain, background crowd moving in uncanny unison, water dripping off umbrella edge in slow motion, 24fps atmospheric lighting"
            }
        ]

        bible.audio = [
            {
                "scene": "Scene 1 - Sanctuary Spell",
                "dialogue": "Crisp, dry, close-mic vocal presence with subtle stone cathedral reverb.",
                "ambience": "Heavy torrential rain pounding against the protective forcefield like ocean surf.",
                "foley": "Sizzling skin, leather creak of holster, bone stylus grinding on stone.",
                "soundEffects": "Deep sub-bass hum (40 Hz) pulsing continuously from the Keystone Wardstone.",
                "music": "Sparse mournful solo cello over low drone synthesizers.",
                "silence": "STRATEGIC SILENCE: 3 full seconds of total drop-out right before the stylus touches flesh.",
                "emotionalCue": "The sudden quiet magnifies the agony and gravity of the sacrifice.",
                "transition": "Sudden sharp metallic snap transitioning into the market noise."
            },
            {
                "scene": "Scene 2 - Limbo Bazaar Encounter",
                "dialogue": "Intimate, low-register dialogue. Elias's voice is unnervingly smooth and devoid of breath sounds.",
                "ambience": "Distant vendor cries, sizzling griddles, dripping rainwater into corrugated tin barrels.",
                "foley": "Wet combat boot sloshes, fabric friction of duster coat, umbrella fabric snapping in wind.",
                "soundEffects": "Faint high-pitched metallic ping emitted by Kaelen's wrist chronometer every 60 seconds.",
                "music": "No orchestral music. Unsettling detuned analog string swells rising imperceptibly.",
                "silence": "Sound dips whenever Elias looks directly into Kaelen's eyes.",
                "emotionalCue": "Auditory representation of predatory focus.",
                "transition": "L-Cut: Rain sounds continue into the subterranean tunnel."
            }
        ]

        bible.editPlan = {
            "pacingStrategy": "Gradual acceleration: slow, ceremonial pacing in Act 1 builds to breathless real-time editing in Act 3 as the countdown drops below five minutes.",
            "sceneOrder": [1, 2, 3, 4, 5],
            "estimatedDurations": {
                "scene_1": "14 minutes",
                "scene_2": "18 minutes",
                "scene_3": "22 minutes",
                "scene_4": "25 minutes",
                "scene_5": "16 minutes"
            },
            "keyTransitions": [
                "Scene 1 to 2: Hard cut on the sizzling stylus smoke dissolving into the sodium fog of the Bazaar.",
                "Scene 2 to 3: J-Cut where the underground subway dripping is heard before cutting to black.",
                "Scene 3 to 4: Accelerating cut rate from 6-second takes down to 1.2-second rhythmic cuts.",
                "Scene 4 to 5: Match cut between the digital countdown '00:00:01' and the slam of the airlock hatch."
            ],
            "finalShot": "A slow optical push into Elias's calm face through the cathedral glass as the rain runs down the pane like static."
        }

        bible.socialContent = {
            "video_teasers_veo": [
                {
                    "title": "The 4-Hour Countdown",
                    "format": "9:16 Vertical Video (15s)",
                    "hook": "Extreme macro zoom into human forearm as glowing amber glyph ignites into skin: 04:00:00.",
                    "veo_prompt": "Google Veo prompt: 9:16 vertical cinematography, macro extreme close-up pushing in on human arm, amber runic numerals sizzling into skin with rising vapor, 24fps high-speed camera move pulling back to reveal hooded scout standing before rainstorm and giant shimmering violet forcefield dome, hyperrealistic cinematic motion, physical particle simulation",
                    "audio_sync": "40Hz sub-bass drop syncing to the ticking metronome of the clock",
                    "hashtags": ["#TheLastSpell", "#SciFiThriller", "#MovieTeaser", "#VeoVideo"]
                },
                {
                    "title": "The Smiling Mimic",
                    "format": "9:16 Vertical Video (15s)",
                    "hook": "A smiling gentleman in a tweed jacket stands motionless in the rain under an umbrella.",
                    "veo_prompt": "Google Veo prompt: 9:16 vertical framing, slow eerie dolly forward toward an unnervingly still man in vintage tweed holding an umbrella in torrential rain, neon yellow sodium light reflecting off wet asphalt, lightning strike reveals pitch-black dilated pupils, cinematic horror film motion, 24fps",
                    "audio_sync": "Creepy polite whistle echoing over distorted ambient rain",
                    "hashtags": ["#PsychologicalHorror", "#Mimic", "#ShortFilm", "#MovieTok"]
                }
            ],
            "posters_imagen_3": [
                {
                    "poster_type": "Official Theatrical Teaser Key Art",
                    "title_text": "AGENTIC CINEMA DEMO",
                    "tagline": "The barrier is failing. The countdown begins.",
                    "imagen_prompt": "Google Imagen 3 prompt: High-impact 2:3 vertical theatrical movie poster, wide angle low perspective of a solitary weathered scout in a charcoal duster standing on wet granite steps looking up at a colossal glowing violet magical forcefield dome protecting a gothic cathedral, heavy rainstorm, ominous silhouettes of normal-looking crowds staring from the dark mist, dramatic IMAX typography space, rich cinematic lighting, 8K masterpiece",
                    "color_palette": "#1E1B4B (Deep Violet), #D97706 (Amber Rune), #0F172A (Midnight Slate)"
                },
                {
                    "poster_type": "Character Teaser Poster: The Infiltrator",
                    "title_text": "ELIAS: THE MIMIC",
                    "tagline": "They don't growl. They ask about your family.",
                    "imagen_prompt": "Google Imagen 3 prompt: 2:3 vertical character teaser poster, extreme close-up portrait of a sharp-dressed gentleman with slicked hair holding an umbrella in the rain, polite warm smile contrasting with dead soulless eyes, split-lighting chiaroscuro with warm sodium yellow on one side and cold void black on the other, atmospheric film grain, 8K photorealism",
                    "color_palette": "#78350F (Rust), #F59E0B (Sodium), #000000 (Void)"
                }
            ],
            "tiktok_reels_shorts": [
                {
                    "platform": "TikTok / Instagram Reels",
                    "title": "The Countdown Spell Rule Explained",
                    "format": "9:16 Vertical Video (38s)",
                    "hook": "What if zombies didn't look like zombies... and your survival had a timer seared into your skin?",
                    "script": "Voiceover over glowing wrist visual: 'Rule number one: they don't limp. They don't scream. They wear tweed blazers and ask how your morning was. Rule number two: you have four hours before your smell changes. When that clock hits zero... you are dinner.'",
                    "cta": "Would you survive outside the barrier? Drop your answer below.",
                    "hashtags": ["#TheLastSpell", "#AgenticCinema", "#SciFiHorror", "#ZombieApocalypse", "#Filmmaking"]
                },
                {
                    "platform": "YouTube Shorts",
                    "title": "The Mimic Encounter - Behind the Scenes",
                    "format": "9:16 Vertical Video (45s)",
                    "hook": "How our Director Agent orchestrated the creepiest conversation in the movie.",
                    "script": "Split-screen comparison: Top shows the screenplay's 'Show, Don't Tell' notes; Bottom shows the 35mm camera blocking and eerie frozen smile of Elias.",
                    "cta": "Full production bible available at Agentic Cinema Studio.",
                    "hashtags": ["#FilmmakersOfTikTok", "#DirectingTips", "#AIInFilm", "#IndieFilm"]
                }
            ]
        }

        bible.danceConcepts = [
            {
                "title": "The 4-Minute Countdown Shuffle",
                "duration": "15 seconds",
                "character": "Nia with Kaelen",
                "musicStyle": "Dark Phonk / Industrial Trap with ticking clock metronome",
                "bpm": 135,
                "mood": "Edgy, rhythmic, viral, high-energy",
                "concept": "Dancers sync sharp mechanical isolations to the ticking countdown clock before breaking into fluid evasive street footwork.",
                "beatStructure": {
                    "0_to_3s": "THE HOOK: Close-up check of wrist wrist-timer syncing to heavy bass drop and 3 sharp head tilts.",
                    "3_to_7s": "MAIN MOVEMENT: Step-slide combo miming slipping past frozen mimics in the crowd.",
                    "7_to_11s": "SIGNATURE MOVEMENT: The 'Glyph Flick' - arms trace an amber circle in the air followed by rapid double stomp.",
                    "11_to_15s": "FINAL POSE: Sudden freeze looking over shoulder with finger on lips as the clock rings zero."
                },
                "choreography": "Mix of tutting, liquid dance, and modern street footwork designed for viral replication.",
                "cameraFraming": "Low-angle vertical tracking shot starting waist-up and pulling back to full body on beat 7.",
                "caption": "Can you hit the Glyph Flick before the timer hits 00:00? ⏳🔥 #TheLastSpellDance",
                "hashtags": ["#TheLastSpellDance", "#CountdownShuffle", "#DanceTrend", "#AgenticCinema"]
            }
        ]

        bible.continuityLog = [
            {
                "timestamp": datetime.utcnow().isoformat(),
                "type": "CANON_LOCKED",
                "description": "Core world rules established: Dual barrier sanctuary, 4-hour countdown spell, and cognitive mimic infected.",
                "status": "VERIFIED"
            },
            {
                "timestamp": datetime.utcnow().isoformat(),
                "type": "CHARACTER_AUDIT",
                "description": "Protagonist Kaelen Vance and Antagonist Elias profiles validated across all 5 screenplay scenes.",
                "status": "VERIFIED"
            }
        ]

        return bible

    def generate_100_page_master_bible_markdown(self) -> str:
        """Generates comprehensive 100+ page Hollywood Feature Production Bible & Screenplay."""
        from core.feature_100_pages_builder import build_100_page_production_bible
        return build_100_page_production_bible(
            self.project,
            self.worldRules,
            self.characters,
            self.locations,
            self.scenes
        )

    def generate_momo_markdown(self) -> str:
        """Generates exhaustive Hollywood Master Production Bible markdown document."""
        p = self.project
        lines = [
            f"# 🎬 MASTER CINEMATIC PRODUCTION BIBLE: {p.get('title', 'UNTITLED')}",
            f"> **Project ID:** {p.get('id')} | **Genre:** {p.get('genre')} | **Format:** {p.get('targetDuration')} Feature",
            f"> **Status:** {p.get('stage')} | **Updated:** {self.updated_at}",
            "",
            "---",
            "## 📌 1. EXECUTIVE PRODUCTION BRIEF",
            f"* **Logline:** {p.get('logline')}",
            f"* **Tone & Atmosphere:** {p.get('tone')}",
            f"* **Visual Style:** {p.get('visualStyle')}",
            f"* **Language:** {p.get('language')}",
            "",
            "---",
            "## ⚡ 2. UNBREAKABLE WORLD RULES (CANON)",
        ]
        for r in self.worldRules:
            lines.append(f"### [{r.get('id')}] {r.get('category')}")
            lines.append(f"* **Rule:** {r.get('rule')}")
            lines.append(f"* **Consequence:** {r.get('consequence')}")
            lines.append(f"* **Strictness:** {r.get('strictness')}\n")

        lines.extend([
            "---",
            "## 🎭 3. CHARACTER PROFILES & VISUAL EVOLUTION",
        ])
        for c in self.characters:
            lines.append(f"### {c.get('name')} ({c.get('role')})")
            lines.append(f"* **Age:** {c.get('age')} | **Palette:** `{c.get('colorPalette')}`")
            lines.append(f"* **Appearance:** {c.get('appearance')}")
            lines.append(f"* **Wardrobe & Hair:** {c.get('clothing')} / {c.get('hair')}")
            lines.append(f"* **Signature Props:** {c.get('props')}")
            lines.append(f"* **Visual Evolution:** {c.get('visualEvolution')}\n")

        
        lines.extend([
            "---",
            "## 🎭 3.1 CANONICAL CAST DIRECTORY",
        ])
        if self.cast:
            lines.append("| Performer Name | Character Name | Role Type | Appearances | Dialogue Lines | Status |")
            lines.append("|---|---|---|---|---|---|")
            for c in self.get_cast_with_stats():
                scenes_str = f"{len(c.get('sceneNumbers', []))} scenes"
                lines.append(f"| **{c.get('performerName')}** | {c.get('characterName')} | {c.get('roleType')} | {scenes_str} | {c.get('dialogueCount', 0)} lines | {c.get('status', 'Confirmed').capitalize()} |")
            lines.append("")
        else:
            lines.append("*No performers assigned yet. (Use chat or Cast Studio to assign actors).*\n")

        lines.extend([
            "---",
            "## 📍 4. LOCATION ATLAS & PRODUCTION DESIGN",
        ])
        for l in self.locations:
            lines.append(f"### 📍 {l.get('name')}")
            lines.append(f"* **Architecture & Geography:** {l.get('architecture')} ({l.get('geography')})")
            lines.append(f"* **Lighting & Weather:** {l.get('lighting')} / {l.get('weather')}")
            lines.append(f"* **Materials & Key Objects:** {l.get('materials')} | {l.get('objects')}")
            lines.append(f"* **Color Palette:** `{l.get('colorPalette')}`\n")

        lines.extend([
            "---",
            "## 📜 5. SCREENPLAY SCENES (SHOW, DON'T TELL)",
        ])
        for sc in self.scenes:
            lines.append(f"### SCENE {sc.get('sceneNumber')}: {sc.get('slugline')}")
            lines.append(f"> **Objective:** {sc.get('objective')}")
            lines.append(f"> **Conflict:** {sc.get('conflict')}")
            lines.append(f"> **Emotional Beat:** {sc.get('emotionalBeat')}\n")
            lines.append(f"**ACTION:**\n{sc.get('action')}\n")
            lines.append(f"**DIALOGUE:**\n```\n{sc.get('dialogue')}\n```\n")
            lines.append(f"*Transition: {sc.get('transition')}*\n")

        lines.extend([
            "---",
            "## 🎥 6. DIRECTOR'S VISION & SHOT LIST",
        ])
        for sh in self.shots:
            lines.append(f"* **Scene {sh.get('sceneNumber')}, Shot {sh.get('shotNumber')}:** {sh.get('shotType')} ({sh.get('lens')})")
            lines.append(f"  - **Camera Movement:** {sh.get('cameraMovement')}")
            lines.append(f"  - **Composition & Blocking:** {sh.get('composition')} | {sh.get('blocking')}")
            lines.append(f"  - **Lighting & Pacing:** {sh.get('lighting')} | {sh.get('pacing')}\n")

        lines.extend([
            "---",
            "## 🖼️ 7. STORYBOARD & VISUAL PROMPTS",
        ])
        for sb in self.storyboard:
            lines.append(f"### Frame {sb.get('scene')}.{sb.get('frame')}: {sb.get('shot')}")
            lines.append(f"* **Visual:** {sb.get('description')}")
            lines.append(f"* **Camera & Lighting:** {sb.get('camera')} | {sb.get('lighting')}")
            lines.append(f"* **Action & Emotion:** {sb.get('action')} ({sb.get('emotion')})")
            lines.append(f"* **Prompt:** `{sb.get('imagePrompt')}`\n")

        lines.extend([
            "---",
            "## 🔊 8. SOUND DESIGN & STRATEGIC SILENCE",
        ])
        for a in self.audio:
            lines.append(f"### 🎵 {a.get('scene')}")
            lines.append(f"* **Ambience & Foley:** {a.get('ambience')} | {a.get('foley')}")
            lines.append(f"* **Score & Effects:** {a.get('music')} | {a.get('soundEffects')}")
            lines.append(f"* **Strategic Silence:** {a.get('silence')}")
            lines.append(f"* **Emotional Audio Cue:** {a.get('emotionalCue')}\n")

        lines.extend([
            "---",
            "## ✂️ 9. EDITING & PACING MASTER PLAN",
            f"* **Pacing Strategy:** {self.editPlan.get('pacingStrategy', 'N/A')}",
            f"* **Key Transitions:** {', '.join(self.editPlan.get('keyTransitions', []))}",
            f"* **Final Shot:** {self.editPlan.get('finalShot', 'N/A')}",
            "",
            "---",
            "## 📱 10. SOCIAL & VIRAL CAMPAIGN",
        ])
        for tc in self.socialContent.get("tiktok_reels_shorts", []):
            lines.append(f"### {tc.get('platform')}: {tc.get('title')}")
            lines.append(f"* **Hook:** {tc.get('hook')}")
            lines.append(f"* **Script/Action:** {tc.get('script')}")
            lines.append(f"* **CTA & Tags:** {tc.get('cta')} | {' '.join(tc.get('hashtags', []))}\n")

        lines.extend([
            "---",
            "## 💃 11. VIRAL DANCE CONCEPT",
        ])
        for d in self.danceConcepts:
            lines.append(f"### {d.get('title')} ({d.get('bpm')} BPM - {d.get('musicStyle')})")
            lines.append(f"* **Concept:** {d.get('concept')}")
            lines.append(f"* **0-3s Hook:** {d.get('beatStructure', {}).get('0_to_3s')}")
            lines.append(f"* **3-7s Main:** {d.get('beatStructure', {}).get('3_to_7s')}")
            lines.append(f"* **7-11s Signature:** {d.get('beatStructure', {}).get('7_to_11s')}")
            lines.append(f"* **11-15s Final Pose:** {d.get('beatStructure', {}).get('11_to_15s')}")
            lines.append(f"* **Choreography:** {d.get('choreography')}")
            lines.append(f"* **Camera Framing:** {d.get('cameraFraming')}")
            lines.append(f"* **Caption:** {d.get('caption')}\n")

        return "\n".join(lines)


    def add_or_update_cast(self, performer_name: str, character_name: str, role_type: Optional[str] = None, notes: str = "", status: str = "confirmed") -> Dict[str, Any]:
        """Adds or updates a canonical cast assignment in ProjectBible."""
        p_name = performer_name.strip()
        c_name = character_name.strip()

        # Find existing assignment by characterName
        target = None
        for c in self.cast:
            if c.get("characterName", "").lower() == c_name.lower() or c.get("performerName", "").lower() == p_name.lower():
                target = c
                break

        if not target:
            cast_id = f"cast_{len(self.cast) + 1:03d}"
            target = {
                "id": cast_id,
                "performerName": p_name,
                "characterName": c_name,
                "roleType": role_type or "Actor",
                "status": status,
                "notes": notes,
                "sceneNumbers": [],
                "dialogueCount": 0
            }
            self.cast.append(target)
        else:
            if p_name:
                target["performerName"] = p_name
            if c_name:
                target["characterName"] = c_name
            if role_type:
                target["roleType"] = role_type
            if notes:
                target["notes"] = notes
            if status:
                target["status"] = status

        self.get_cast_with_stats()
        return target

    def remove_cast(self, cast_id: str) -> bool:
        """Removes a cast assignment by ID."""
        initial_len = len(self.cast)
        self.cast = [c for c in self.cast if c.get("id") != cast_id]
        return len(self.cast) < initial_len

    def get_cast_with_stats(self) -> List[Dict[str, Any]]:
        """Calculates dynamic scene appearances and dialogue line counts for every cast member."""
        for entry in self.cast:
            char_name = entry.get("characterName", "").strip()
            if not char_name:
                continue

            matching_scenes = []
            dialogue_count = 0
            c_first_name = char_name.split()[0].lower()

            for sc in self.scenes:
                sc_num = sc.get("sceneNumber", 1)
                dialogue_text = sc.get("dialogue", "")
                action_text = sc.get("action", "")

                # Check if character speaks or acts in scene
                has_dialogue = c_first_name in dialogue_text.lower() or char_name.lower() in dialogue_text.lower()
                has_action = c_first_name in action_text.lower() or char_name.lower() in action_text.lower()

                if has_dialogue or has_action:
                    if sc_num not in matching_scenes:
                        matching_scenes.append(sc_num)

                if has_dialogue:
                    # Count dialogue blocks
                    lines = dialogue_text.split("\n")
                    for line in lines:
                        l_upper = line.strip().upper()
                        if char_name.upper() in l_upper or c_first_name.upper() in l_upper:
                            dialogue_count += 1

            entry["sceneNumbers"] = sorted(matching_scenes)
            entry["dialogueCount"] = dialogue_count

        return self.cast

    def generate_actor_script(self, cast_id: str) -> Dict[str, Any]:
        """Generates a dedicated Actor Script tailored specifically for the assigned performer."""
        # Find cast record
        cast_entry = None
        for c in self.cast:
            if c.get("id") == cast_id or c.get("performerName", "").lower() == cast_id.lower() or c.get("characterName", "").lower() == cast_id.lower():
                cast_entry = c
                break

        if not cast_entry:
            # Fallback mock entry if no cast matches
            cast_entry = {
                "id": "cast_001",
                "performerName": "Actor",
                "characterName": "Protagonist",
                "roleType": "Lead"
            }

        performer = cast_entry.get("performerName", "Unassigned")
        char_name = cast_entry.get("characterName", "Character")
        role_type = cast_entry.get("roleType", "Lead Actor")

        # Find character profile details in self.characters
        char_profile = {}
        for ch in self.characters:
            if ch.get("name", "").lower() == char_name.lower() or char_name.lower() in ch.get("name", "").lower():
                char_profile = ch
                break

        # Filter scenes for this character
        c_first_name = char_name.split()[0].lower()
        actor_scenes = []

        for idx, sc in enumerate(self.scenes):
            dialogue_text = sc.get("dialogue", "")
            action_text = sc.get("action", "")
            has_presence = (c_first_name in dialogue_text.lower() or char_name.lower() in dialogue_text.lower() or
                            c_first_name in action_text.lower() or char_name.lower() in action_text.lower())

            if has_presence:
                # Get previous scene context
                prev_summary = "Opening scene establishing the world."
                if idx > 0:
                    prev_sc = self.scenes[idx - 1]
                    prev_summary = f"Preceding Scene {prev_sc.get('sceneNumber')}: {prev_sc.get('slugline')} - {prev_sc.get('objective', 'Action continues')}"

                # Extract specific dialogue lines for this character
                filtered_dialogue = []
                lines = dialogue_text.split("\n")
                in_char_block = False
                for l in lines:
                    line_str = l.strip()
                    if line_str.isupper() and (char_name.upper() in line_str or c_first_name.upper() in line_str):
                        in_char_block = True
                        filtered_dialogue.append(line_str)
                    elif line_str.isupper() and in_char_block:
                        in_char_block = False
                    elif in_char_block:
                        filtered_dialogue.append(line_str)

                scene_dialogue_str = "\n".join(filtered_dialogue) if filtered_dialogue else dialogue_text

                actor_scenes.append({
                    "sceneNumber": sc.get("sceneNumber", idx + 1),
                    "slugline": sc.get("slugline", f"SCENE {idx + 1}"),
                    "act": sc.get("act", "ACT I"),
                    "objective": sc.get("objective", "Navigate dramatic situation"),
                    "conflict": sc.get("conflict", "Escalating stakes"),
                    "emotionalState": f"Controlled tension ({char_name}'s perspective)",
                    "subtext": f"Unspoken stakes and internal motivation.",
                    "previousContext": prev_summary,
                    "action": sc.get("action", ""),
                    "dialogue": scene_dialogue_str,
                    "performanceNotes": f"Deliver lines with intention. Eye contact focused; maintain posture under pressure."
                })

        return {
            "performerName": performer,
            "characterName": char_name,
            "roleType": role_type,
            "characterSummary": char_profile.get("description") or f"Canonical character profile for {char_name}.",
            "characterArc": f"Flaw: {char_profile.get('flaw', 'Internal struggle')} | Goal: {char_profile.get('goal', 'Dramatic objective')}",
            "performanceStyle": "Grounded, visceral, 35mm cinematic realism.",
            "totalScenes": len(actor_scenes),
            "scenes": actor_scenes
        }

    def generate_dialogue_script(self, cast_id: str) -> Dict[str, Any]:
        """Generates a dialogue-only rehearsal script for an actor."""
        actor_script = self.generate_actor_script(cast_id)
        dialogue_only_scenes = []

        for sc in actor_script.get("scenes", []):
            if sc.get("dialogue"):
                dialogue_only_scenes.append({
                    "sceneNumber": sc["sceneNumber"],
                    "slugline": sc["slugline"],
                    "dialogue": sc["dialogue"]
                })

        return {
            "performerName": actor_script["performerName"],
            "characterName": actor_script["characterName"],
            "scenes": dialogue_only_scenes
        }

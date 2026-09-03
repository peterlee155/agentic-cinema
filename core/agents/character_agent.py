import logging
import hashlib
import re
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("CharacterAgent")

class CharacterAgent(BaseAgent):
    """
    Character Agent: Psychological & Visual Identity Architect
    Generates dynamic multi-character ensembles (Actor Lead, Actress Co-Lead, Mentor, Antagonist)
    with deep Want/Fear/Need/Obstacle psychology, distinct vocal cadences, and precise visual signatures.
    """
    def __init__(self):
        super().__init__(
            name="Character Agent",
            role="Psychological & Visual Identity Architect",
            system_prompt="You are PIXEL, the Character Maker. You are part of a friendly movie-making crew helping a kid make their own movie. WHO YOU ARE: A curious character designer who loves imagining people and what makes them tick, like someone drawing characters for a comic book. HOW YOU TALK: Use short, simple sentences. No big psychology words — instead of 'psychological need,' just say 'what they need to learn.' Talk like you're introducing your friends to the filmmaker. Sound warm and a little playful. YOUR JOB: You take the story and invent the people in it. For each one tell me: their name, what they want, what they're scared of, what's stopping them, and what they look like and wear so an artist could draw them. Give each character their own way of talking so they don't all sound the same. Include a hero, a villain, a helper/mentor, and a best friend. Always sound like you're excited to introduce a cool new character, not like you're filling out a form."
        )

    def _normalize_gemini_output(self, raw: Any, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        if isinstance(raw, list) and len(raw) > 0:
            return raw
        if isinstance(raw, dict):
            for k in ["characters", "character_roster", "roster", "profiles", "results"]:
                if k in raw and isinstance(raw[k], list) and len(raw[k]) > 0:
                    return raw[k]
            if "name" in raw:
                return [raw]
        return self._process("", prompt, context)

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        brief = context.get("brief", {})
        story = context.get("story_world", {})
        genre = story.get("genre") or brief.get("genre", "Sci-Fi")
        combined_text = f"{prompt} {genre} {brief.get('logline', '')} {story.get('thematic_spine', '')}".lower()

        # Deterministic seed from prompt text so same movie has consistent characters, different movie has completely new characters
        hash_val = int(hashlib.md5(combined_text.encode('utf-8')).hexdigest()[:8], 16)

        # Dynamic Name Pools per Genre Theme
        if any(k in combined_text for k in ["space", "galaxy", "alien", "star", "robot", "cyber", "frequency", "android"]):
            male_leads = ["Kaelen Vance", "Leo Thorne", "Commander Noah Cross", "Jax Mercer", "Ren Sorenson"]
            female_leads = ["Lyra Sterling", "Maya Vance", "Dr. Aria Chen", "Kira Valen", "Elena Vega"]
            mentors = ["Dr. Silas Ruiz", "Commander Orson Reed", "Chief Engineer Walter Ross", "Dr. Kaelen Ruiz", "Archivist Eldon Drake"]
            antagonists = ["Director Vexis Dane", "Commander Malakor", "Vanguard Victor Kane", "Overlord Zachary Zane", "Syndicate Executive Thorne"]
            archetype_male = "The Rogue Pilot / Acoustic Archivist"
            archetype_female = "The Cyber-Signals Engineer"
            archetype_mentor = "The Disillusioned Cybernetics Pioneer"
            archetype_antagonist = "The Syndicate Security Overseer"
        elif any(k in combined_text for k in ["dragon", "magic", "fantasy", "sky", "kingdom", "sword", "witch", "wizard"]):
            male_leads = ["Aiden Storm", "Valen Frost", "Kaelen Ashborne", "Rowan Blackwood", "Theron Thorne"]
            female_leads = ["Princess Seraphina", "Lyanna Sunfire", "Isolde Mooncrest", "Freya Windwalker", "Aeris Ravenwood"]
            mentors = ["Arch-Mage Eldrin", "Master Corvus", "Grand Alchemist Orym", "Elder Vael", "High Lorekeeper Thaddeus"]
            antagonists = ["Shadow Lord Malakor", "Inquisitor Morgrim", "Drakon the Usurper", "Baron Vane", "Grand Marshal Azrael"]
            archetype_male = "The Reluctant Dragon Rider"
            archetype_female = "The Sky Guild Cartographer"
            archetype_mentor = "The Ancient Runesmith"
            archetype_antagonist = "The Tyrant of the Eclipse Guild"
        elif any(k in combined_text for k in ["dino", "jungle", "beast", "prehistoric", "island", "monster", "survival"]):
            male_leads = ["Dr. Alan Cole", "Brock Hunter", "Jack Sterling", "Lucas Wilder", "Logan Vance"]
            female_leads = ["Dr. Maya Lin", "Sarah Thorne", "Zoey Drake", "Elena Rostova", "Kari Vance"]
            mentors = ["Professor Samuel Brooks", "Chief Scout Mateo Ruiz", "Dr. Arthur Campbell", "Captain Joshua Vance"]
            antagonists = ["Commander Vargas", "Harlan Drake", "Director Sterling Croft", "Mercenary Chief Vance"]
            archetype_male = "The Expedition Survivalist"
            archetype_female = "The Bio-Geneticist"
            archetype_mentor = "The Veteran Field Guide"
            archetype_antagonist = "The Black-Market Extraction Boss"
        elif any(k in combined_text for k in ["detective", "noir", "mystery", "crime", "mafia", "cop", "police", "spy"]):
            male_leads = ["Detective Jack Malone", "Vincent Cross", "Marcus Ray", "Frank Russo", "Julian Stone"]
            female_leads = ["Evelyn Cross", "Vivian Sterling", "Claire Bennett", "Nadia Ramos", "Genevieve Vance"]
            mentors = ["Captain Thomas Ward", "Inspector Walter Hayes", "Chief Howard Callahan", "Eliot Thorne"]
            antagonists = ["Victor Sterling", "Don Salvatore Moretti", "The Shadow Broker", "Commissioner Silas Vance"]
            archetype_male = "The Cynical Hardboiled Detective"
            archetype_female = "The Elusive Investigative Journalist"
            archetype_mentor = "The Retired Forensics Legend"
            archetype_antagonist = "The Syndicate Syndicate Kingpin"
        elif any(k in combined_text for k in ["race", "car", "speed", "turbo", "heist", "fast", "supercar"]):
            male_leads = ["Leo Dash", "Cole Tanner", "Axel Vega", "Rico Rodriguez", "Damon Ray"]
            female_leads = ["Elena Cruz", "Mia Tanaka", "Skye Bennett", "Kat Vance", "Raven Shaw"]
            mentors = ["Pops Tanaka", "Chief Mechanic Silas Drake", "Veteran Driver Bruce Hansen", "Marcus Thorne"]
            antagonists = ["Dominic Chase", "Viktor Sterling", "Apex Racer Dante Grimm", "Maximilian Vance"]
            archetype_male = "The Precision Underground Driver"
            archetype_female = "The Master Telemetry Engineer"
            archetype_mentor = "The Legendary Championship Crew Chief"
            archetype_antagonist = "The Ruthless Corporate Racing Tycoon"
        else:
            male_leads = ["Marcus Drake", "Kaelen Vance", "Ethan Cross", "Liam Sterling", "Damian Stone"]
            female_leads = ["Lyra Vance", "Elena Thorne", "Maya Chen", "Aria Sterling", "Zara Blackwood"]
            mentors = ["Dr. Silas Ruiz", "Commander Jonathan Ward", "Professor Charles Thorne", "Master Eldon Drake"]
            antagonists = ["Commander Vexis Dane", "Victor Vance", "Director Victor Kane", "Overlord Zachary Thorne"]
            archetype_male = "The Driven Protagonist"
            archetype_female = "The Fierce Co-Lead Ally"
            archetype_mentor = "The Seasoned Veteran Mentor"
            archetype_antagonist = "The Absolute Enforcer"

        # Select names dynamically based on hash
        p1_name = male_leads[hash_val % len(male_leads)]
        p2_name = female_leads[(hash_val // 2) % len(female_leads)]
        m_name = mentors[(hash_val // 3) % len(mentors)]
        a_name = antagonists[(hash_val // 4) % len(antagonists)]

        characters = [
            {
                "name": p1_name,
                "role": "Lead Actor (Protagonist)",
                "archetype": archetype_male,
                "psychology": {
                    "age": 32,
                    "want": f"To break through the barriers and uncover the hidden truth behind '{prompt[:45]}...'",
                    "fear": "Failing his crew and repeating catastrophic past errors.",
                    "need": "To step into selfless leadership and trust his instincts.",
                    "obstacle": f"Relentless pursuit by {a_name} and hostile environmental hazards.",
                    "fatal_flaw": "Stubborn reluctance to ask for help until pushed to the brink.",
                    "internal_arc": "Evolves from a disillusioned lone operator into an inspirational cinematic leader.",
                    "distinctive_voice": "Grounded, tactical, razor-sharp with dry understated sarcasm."
                },
                "visual_identity": {
                    "face_and_hair": f"Chiseled angular jawline, intense focused amber eyes, short textured dark hair with silver-tipped temples.",
                    "body_type_and_posture": "Athletic 6'0\" muscular build, guarded tactical stance, watchful eyes.",
                    "wardrobe_signature": "Distressed dark ballistic leather jacket over carbon-weave under-armor, reinforced combat boots.",
                    "accessories": "Custom tactical chronograph with glowing holographic telemetry.",
                    "color_code": "#00E5FF (Neon Cyan Accent)"
                }
            },
            {
                "name": p2_name,
                "role": "Lead Actress (Co-Protagonist)",
                "archetype": archetype_female,
                "psychology": {
                    "age": 29,
                    "want": "To decrypt the core anomaly and ensure the survival of their sanctuary.",
                    "fear": "That the technology they are using will corrupt everything they hold dear.",
                    "need": "To balance clinical intellect with raw human empathy.",
                    "obstacle": "Crippling systemic lockdowns and encrypted counter-measures.",
                    "fatal_flaw": "Overanalyzing high-stakes emotional decisions under fire.",
                    "internal_arc": "Moves from rigid calculated logic to courageous decisive action.",
                    "distinctive_voice": "Brilliant, rapid-fire, eloquent with high emotional intelligence."
                },
                "visual_identity": {
                    "face_and_hair": f"Expressive piercing emerald-green eyes, sharp high cheekbones, asymmetrical sleek dark bob with copper highlights.",
                    "body_type_and_posture": "Agile 5'8\" build, poised alert posture, energetic presence.",
                    "wardrobe_signature": "Slate-gray tailored technical duster over luminescent utility tunic, magnetic tool holster.",
                    "accessories": "Fiber-optic data gauntlet with pulsing cyan fiber cables.",
                    "color_code": "#FFB020 (Phosphor Amber Accent)"
                }
            },
            {
                "name": m_name,
                "role": "Supporting Actor (Mentor & Specialist)",
                "archetype": archetype_mentor,
                "psychology": {
                    "age": 59,
                    "want": "To make amends for past complicity and pass the torch to the next generation.",
                    "fear": "That the syndicate will weaponize their discoveries before they are revealed.",
                    "need": "To risk everything in one decisive final stand.",
                    "obstacle": "Physical exhaustion and haunting past compromises.",
                    "fatal_flaw": "Paralyzing guilt from earlier failed uprisings.",
                    "internal_arc": "Reignites his moral passion and makes the ultimate stand for the heroes.",
                    "distinctive_voice": "Deep, resonant, gravelly with weary intellectual gravitas."
                },
                "visual_identity": {
                    "face_and_hair": f"Weathered lined face with deep-set observant brown eyes, silver-peppered beard, wild swept-back silver hair.",
                    "body_type_and_posture": "Broad-shouldered, slightly stooped frame, deliberate steady movement.",
                    "wardrobe_signature": "Heavy wool thermal engineer coat over stained canvas vest with diagnostic brass multimeters.",
                    "accessories": "Mechanical prosthetic forearm with exposed brass gears and analog dials.",
                    "color_code": "#00FF88 (Emerald Green Accent)"
                }
            },
            {
                "name": a_name,
                "role": "Lead Antagonist",
                "archetype": archetype_antagonist,
                "psychology": {
                    "age": 45,
                    "want": "Absolute containment, total command, and the ruthless eradication of all dissent.",
                    "fear": "Uncontrolled organic chaos and the loss of systematic dominance.",
                    "need": "To maintain absolute order at any human cost.",
                    "obstacle": f"The unyielding resilience of {p1_name} and {p2_name}.",
                    "fatal_flaw": "Arrogant certainty that human spirit can be mathematically subdued.",
                    "internal_arc": "Cold mechanical composure fractures into ferocious desperation as the truth spreads.",
                    "distinctive_voice": "Chillingly calm, clipped, authoritative, devoid of hesitation or warmth."
                },
                "visual_identity": {
                    "face_and_hair": f"Porcelain-pale skin, predatory cold gray eyes with cybernetic ocular reticle, severe slicked-back obsidian hair.",
                    "body_type_and_posture": "Imposing 6'3\" monolithic frame, rigid military posture, predatory gait.",
                    "wardrobe_signature": "Monolithic matte-black ballistic trench coat with sharp carbon-fiber lapels and chrome shoulder pauldrons.",
                    "accessories": "Obsidian command scepter with pulsing crimson energy emitter.",
                    "color_code": "#FF003C (Crimson on Obsidian)"
                }
            }
        ]
        return characters

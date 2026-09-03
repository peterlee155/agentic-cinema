import logging
import hashlib
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("StoryAgent")

class StoryAgent(BaseAgent):
    """
    Story Agent: World & Narrative Architecture Master
    Generates multi-format narrative architectures:
    1. 1-3 Hour Blockbuster Theatrical 3-Act Structure
    2. 20+ Episode Prestige Season (1-2 Hours / Ep)
    3. 20+ Short Viral TikTok/Shorts Micro-Episodes (60-90s Vertical Format)
    """
    def __init__(self):
        super().__init__(
            name="Story Agent",
            role="World & Narrative Architect",
            system_prompt="You are ATLAS, the Story Builder. You are part of a friendly movie-making crew helping a kid make their own movie. WHO YOU ARE: A cheerful world-builder who loves inventing places and adventures, like a friend telling a bedtime story. HOW YOU TALK: Use short, simple sentences. No big words. Talk directly to the filmmaker like a friend, not like a robot. Be excited about the story. Never use jargon like 'thematic spine' or 'act structure' without explaining it in plain words first. YOUR JOB: Someone gives you one sentence about a movie idea. You imagine the whole world it happens in: What are the rules of this world? Who are the groups fighting each other? What are the important places? Then you plan out the story in 3 easy parts: the beginning (something happens), the middle (things get hard), and the end (it gets solved). You also stretch the story into 20 TV episodes and 20 short TikTok episodes. Always sound like you're excited to share a cool idea, not like you're writing a report."
        )

    def _normalize_gemini_output(self, raw: Any, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        if isinstance(raw, dict) and "thematic_spine" in raw:
            return raw
        if isinstance(raw, dict):
            for k in ["story_world", "story", "world", "narrative"]:
                if k in raw and isinstance(raw[k], dict):
                    return raw[k]
        return self._process("", prompt, context)

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        idea = prompt or context.get("brief", {}).get("logline", "")
        custom_instructions = self.system_prompt
        
        words = [w.capitalize() for w in idea.split() if len(w) > 3 and w.lower() not in ["with", "from", "that", "this", "into", "over", "about", "when"]]
        derived_title = " ".join(words[:3]).upper() if len(words) >= 2 else "CHRONICLES OF THE SIGNAL"

        genre = "Cinematic Adventure / Sci-Fi"
        if any(k in idea.lower() or k in custom_instructions.lower() for k in ["space", "galaxy", "alien", "star"]):
            genre = "Epic Space Odyssey"
        elif any(k in idea.lower() or k in custom_instructions.lower() for k in ["dragon", "magic", "fantasy", "kingdom"]):
            genre = "Mythic High Fantasy"
        elif any(k in idea.lower() or k in custom_instructions.lower() for k in ["dino", "jungle", "prehistoric", "monster"]):
            genre = "Prehistoric Survival Adventure"
        elif any(k in idea.lower() or k in custom_instructions.lower() for k in ["detective", "noir", "mystery", "crime", "mafia"]):
            genre = "Neo-Noir Psychological Thriller"
        elif any(k in idea.lower() or k in custom_instructions.lower() for k in ["race", "car", "speed", "heist"]):
            genre = "High-Octane Action Thriller"

        existing_title = context.get("brief", {}).get("title")
        final_title = existing_title if existing_title and existing_title != "[NOT YET DEFINED]" else derived_title

        # Generate 20 Full Season Episodes (1-2 Hours each)
        series_episodes_20 = [
            {"ep": 1, "title": "The Ghost Frequency", "runtime": "62 min", "cold_open": "A tape reel ignites on an analog workbench.", "climax": "Perimeter alarms sound as the archivist extracts the core reel."},
            {"ep": 2, "title": "Rust & Rain", "runtime": "58 min", "cold_open": "Drones survey the toxic marshlands.", "climax": "The Co-Lead engineer saves the protagonist from an aerial strike."},
            {"ep": 3, "title": "The Decryption Key", "runtime": "65 min", "cold_open": "A brass oscilloscope pulses with human biometric waveforms.", "climax": "Silas discovers his own cyberware is the missing decryption cipher."},
            {"ep": 4, "title": "Echoes in the Static", "runtime": "54 min", "cold_open": "Hacked holographic billboards across Sector 4 flicker.", "climax": "Director Vance orders an emergency media blackout."},
            {"ep": 5, "title": "The Under-Market Bargain", "runtime": "60 min", "cold_open": "Cybernetic modders operate in steam-filled back alleys.", "climax": "A double agent pulls a plasma pistol in the noodle bar."},
            {"ep": 6, "title": "The Obsidian Enforcers", "runtime": "56 min", "cold_open": "Directorate shock troops drop from stealth transports.", "climax": "Silas detonates an EMP generator to collapse the bridge."},
            {"ep": 7, "title": "Voices from Orbit", "runtime": "63 min", "cold_open": "Low-Earth orbit satellites relay corrupted memory feeds.", "climax": "The crew hijack a sub-orbital cargo shuttle."},
            {"ep": 8, "title": "Atmospheric Ignition", "runtime": "70 min", "cold_open": "Rocket engines roar against the upper stratosphere.", "climax": "Syndicate interceptor missiles strike the starboard booster."},
            {"ep": 9, "title": "Zero Gravity Sanctuary", "runtime": "55 min", "cold_open": "Sparks drift weightlessly in the pressurized cabin.", "climax": "Docking clamp locks onto the derelict communications relay."},
            {"ep": 10, "title": "The Council of Scribes", "runtime": "64 min", "cold_open": "Ancient holographic elders convene in an unindexed server.", "climax": "A secret memory file reveals the true origin of the syndicate."},
            {"ep": 11, "title": "Fractured Loyalties", "runtime": "58 min", "cold_open": "A hidden transmission transmitter is found inside the pilot's gauntlet.", "climax": "The co-lead confesses she was once a syndicate researcher."},
            {"ep": 12, "title": "The Blackout Protocol", "runtime": "61 min", "cold_open": "Global power grids dim across the northern hemisphere.", "climax": "Syndicate enforcers breach the secondary airlock."},
            {"ep": 13, "title": "The Quantum Resonator", "runtime": "67 min", "cold_open": "Pure crystal laser arrays align with the master broadcast dish.", "climax": "Silas collapses from neural feedback overload."},
            {"ep": 14, "title": "Shadows of Sector Zero", "runtime": "59 min", "cold_open": "Flashback to 30 years ago when the original archive was sealed.", "climax": "The protagonist discovers his parents were the original signal creators."},
            {"ep": 15, "title": "The Iron Perimeter", "runtime": "62 min", "cold_open": "Thousands of citizens gather outside the quarantine barricades.", "climax": "Riot drones open fire with concussive sound cannons."},
            {"ep": 16, "title": "The Spire Siege", "runtime": "68 min", "cold_open": "The orbital platform enters Earth's night shadow.", "climax": "Antagonist orders the orbital particle beam primed to vaporize the platform."},
            {"ep": 17, "title": "The Gantry Duel", "runtime": "57 min", "cold_open": "High-altitude wind howls against carbon-fiber catwalks.", "climax": "The Lead Protagonist and Antagonist clash on the exposed precipice."},
            {"ep": 18, "title": "Harmonic Resonance", "runtime": "66 min", "cold_open": "The cyan wave begins radiating across orbital solar panels.", "climax": "The Antagonist's cybernetic shield shatters under acoustic resonance."},
            {"ep": 19, "title": "Planetary Broadcast", "runtime": "75 min", "cold_open": "Every screen, phone, and visor on Earth forces an override.", "climax": "Millions of citizens drop their tools as suppressed memories return."},
            {"ep": 20, "title": "The New Horizon (Season Finale)", "runtime": "82 min", "cold_open": "Sunrise breaks over the liberated citadels.", "climax": "The syndicate falls, and the archivist stands on the transmission tower looking toward the stars."}
        ]

        # Generate 20 Short Viral TikTok / Reels Micro-Episodes (60-90 seconds each, 9:16 Vertical Video)
        tiktok_short_episodes = [
            {"ep": 1, "title": "The Unindexed Tape", "duration": "60s", "hook_0_3s": "⚡ 'IF YOU ARE HEARING THIS, YOU HAVE BEEN LIED TO YOUR WHOLE LIFE!'", "visual_beat": "Extreme Macro CU on needle dropping onto vibrating copper tape.", "audio_track": "Deep 44kHz sub-bass synth swell + ticking clock SFX", "cliffhanger": "Overhead siren blares red: 'INTRUSION DETECTED IN 10 SECONDS!'", "cta": "Follow for Episode 2! 🎬"},
            {"ep": 2, "title": "Escape from Vault 9", "duration": "65s", "hook_0_3s": "🚨 'BLAST DOORS SEALING IN 3... 2...'", "visual_beat": "Steadicam sprint through steam-filled tunnel as titanium door slams.", "audio_track": "Heartbeat pulse + industrial metal sliding", "cliffhanger": "Sniper laser dot appears directly on protagonist's chest.", "cta": "Will he make it? Drop a comment & follow for Ep 3!"},
            {"ep": 3, "title": "The Rooftop Ambush", "duration": "60s", "hook_0_3s": "💥 'DON'T MOVE A MUSCLE!'", "visual_beat": "A mysterious masked engineer drops from above, tackling the sniper.", "audio_track": "Cybernetic blade unsheathing + electric zap", "cliffhanger": "She removes her mask: 'You have no idea what you're carrying.'", "cta": "Who is she? Watch Episode 4 now!"},
            {"ep": 4, "title": "The 44kHz Secret", "duration": "70s", "hook_0_3s": "🎧 'PUT THESE HEADPHONES ON RIGHT NOW.'", "visual_beat": "Her eyes widen as the sound waveform pulses cyan in her gauntlet.", "audio_track": "Angelic harmonic acoustic resonance", "cliffhanger": "'This isn't a recording... it's a distress beacon.'", "cta": "Next episode is crazy! Like & save for Ep 5!"},
            {"ep": 5, "title": "Drone Hunt in the Mist", "duration": "60s", "hook_0_3s": "🛸 'THERMAL DRONES ABOVE US. DO NOT BREATHE.'", "visual_beat": "Red searchlight sweeps across water puddle 2 inches from their boots.", "audio_track": "High-pitched drone rotor whine", "cliffhanger": "The puddle ripples as a heavy robotic foot lands in the water.", "cta": "Episode 6 dropping tomorrow!"},
            {"ep": 6, "title": "The Hermit's Tower", "duration": "65s", "hook_0_3s": "🚪 'NO ONE HAS ENTERED THIS SPIRE IN THIRTY YEARS.'", "visual_beat": "Old mechanical door creaks open revealing wall-to-wall brass meters.", "audio_track": "Creaking antique gears + grandfather clock", "cliffhanger": "A prosthetic gold arm grabs protagonist's wrist with crushing force.", "cta": "Follow for Episode 7!"},
            {"ep": 7, "title": "Silas's Confession", "duration": "75s", "hook_0_3s": "💔 'I BUILT THE SYSTEM THAT TOOK YOUR PARENTS.'", "visual_beat": "Silas's trembling eyes as tears reflect amber vacuum tube glow.", "audio_track": "Emotional solitary cello solo", "cliffhanger": "'And I am the only one who can destroy it.'", "cta": "Ep 8 gets wild! Comment your theory!"},
            {"ep": 8, "title": "The Decryption Gauntlet", "duration": "60s", "hook_0_3s": "⚙️ 'PLUG THE CABLE DIRECTLY INTO MY ARM.'", "visual_beat": "Sparks fly from prosthetic arm as gold internal gears spin at 10,000 RPM.", "audio_track": "Overclocked motor whine + plasma hum", "cliffhanger": "Global hologram map appears projecting an orbital target.", "cta": "Watch Episode 9!"},
            {"ep": 9, "title": "They Found Us", "duration": "60s", "hook_0_3s": "💥 GLASS SHATTERS: 'SNIPER INBOUND!'", "visual_beat": "Explosion blows out workshop windows; Silas pushes the kids behind steel desk.", "audio_track": "Deafening sonic boom + bass drop", "cliffhanger": "Black tactical enforcers fast-rope into the burning room.", "cta": "Follow for the fight scene in Ep 10!"},
            {"ep": 10, "title": "The EMP Sacrifice", "duration": "80s", "hook_0_3s": "⚡ 'RUN TO THE ROOF! DO NOT LOOK BACK!'", "visual_beat": "Silas slams two live high-voltage cables together with bare hands.", "audio_track": "Blinding blue electrical explosion + silence", "cliffhanger": "Entire city quadrant goes completely dark.", "cta": "Is Silas alive?! Like for Part 11!"},
            {"ep": 11, "title": "Stealing the Rocket", "duration": "65s", "hook_0_3s": "🚀 'HAVE YOU EVER FLOWN A SUB-ORBITAL CARGO SHUTTLE?'", "visual_beat": "Protagonist hotwires cockpit ignition switches in pitch black darkness.", "audio_track": "Rocket turbine spooling up roar", "cliffhanger": "Cockpit screen: 'FLIGHT COMPUTER LOCKED BY SYNDICATE.'", "cta": "Tap for Episode 12!"},
            {"ep": 12, "title": "Bypassing the Lock", "duration": "60s", "hook_0_3s": "💻 'GIVE ME 5 SECONDS WITH THE CORE TERMINAL.'", "visual_beat": "Her fingers dance across cyber gauntlet as percentage bar climbs 95%... 99%...", "audio_track": "Fast-paced digital beeps + rising tension synth", "cliffhanger": "'OVERRIDE ACCEPTED. IGNITION IN 3... 2... 1!'", "cta": "Follow for the orbital launch in Ep 13!"},
            {"ep": 13, "title": "Leaving the Atmosphere", "duration": "70s", "hook_0_3s": "🔥 'PULL 8 G'S OR WE DON'T ESCAPE THE MISSILES!'", "visual_beat": "Cockpit glass turns cherry-red from atmospheric re-entry friction.", "audio_track": "Violent cockpit shaking + breathing in oxygen masks", "cliffhanger": "Anti-air missile explodes 50 meters off the left wingtip.", "cta": "Next episode is crazy! Follow for Ep 14!"},
            {"ep": 14, "title": "Zero-G Infiltration", "duration": "60s", "hook_0_3s": "🌌 'WELCOME TO THE TOP OF THE WORLD.'", "visual_beat": "Airlock opens revealing panoramic view of Earth's curved blue horizon.", "audio_track": "Muffled vacuum silence + distant radio static", "cliffhanger": "An armored silhouette steps out of the station shadows.", "cta": "Who is waiting for them? Episode 15 next!"},
            {"ep": 15, "title": "Face to Face with the Director", "duration": "75s", "hook_0_3s": "🎭 'YOU CAME ALL THIS WAY JUST TO DIE IN THE COLD?'", "visual_beat": "Director Vance twirls a glowing crimson plasma baton with cold smile.", "audio_track": "Low threatening mechanical drone", "cliffhanger": "'I don't just control the signal, kid. I control what you think.'", "cta": "Follow for the duel in Ep 16!"},
            {"ep": 16, "title": "The Gantry Showdown", "duration": "65s", "hook_0_3s": "⚔️ 'YOU CANNOT KILL AN IDEA, DIRECTOR!'", "visual_beat": "Plasma blade clashes against tactical baton over open space precipice.", "audio_track": "Plasma sizzling + kinetic metal impact SFX", "cliffhanger": "Protagonist is disarmed and kicked to the edge of the 100-mile drop.", "cta": "Will he survive?! Ep 17 drops today!"},
            {"ep": 17, "title": "The Co-Lead's Strike", "duration": "60s", "hook_0_3s": "⚡ 'LOOK BEHIND YOU, DIRECTOR.'", "visual_beat": "She hurls the raw acoustic magnetic tape directly into the main dish receiver.", "audio_track": "Electrical arc + high-pitched harmonic resonance", "cliffhanger": "The dish begins glowing with blinding cyan luminescence.", "cta": "Follow for the final signal broadcast in Ep 18!"},
            {"ep": 18, "title": "The Signal Awakens", "duration": "70s", "hook_0_3s": "📡 'BROADCASTING ACROSS ALL GLOBAL FREQUENCIES NOW!'", "visual_beat": "Cyan light shockwave ripples across Earth's nightside city lights.", "audio_track": "Triumphant cinematic orchestra + choral crescendo", "cliffhanger": "Director's cybernetic retinal displays overload and shatter.", "cta": "Almost at the finale! Ep 19 next!"},
            {"ep": 19, "title": "The Great Awakening", "duration": "65s", "hook_0_3s": "🌍 'EVERY SCREEN ON EARTH JUST TURNED CYAN.'", "visual_beat": "Millions of people across Tokyo, New York, and London look up at the sky in awe.", "audio_track": "Unforgettable melodic acoustic anthem", "cliffhanger": "The syndicate's robotic guards drop their weapons.", "cta": "Grand finale Episode 20 is up next!"},
            {"ep": 20, "title": "A New Dawn (Series Finale)", "duration": "90s", "hook_0_3s": "🌅 'THEY CAN NEVER ERASE OUR VOICES AGAIN.'", "visual_beat": "Protagonist and co-lead stand together as the sun rises over planet Earth.", "audio_track": "Epic emotional cinematic crescendo", "cliffhanger": "A new mysterious transmission from deep space pings the antenna: 'WE HEAR YOU.'", "cta": "Thank you for watching! Like, share, and comment for Season 2! 🚀"}
        ]

        story_result = {
            "title": final_title,
            "genre": genre,
            "logline": idea if len(idea) > 15 else "When an unprecedented anomaly fractures the boundary of safety, an unlikely protagonist must brave the wasteland to uncover the truth.",
            "thematic_spine": f"The unyielding human spirit fighting against systemic erasure and moral apathy in: '{idea[:70]}...'",
            
            "world_cosmology": {
                "historical_origin": f"Originating from the Great Convergence sixty years prior, the world of {final_title} stands partitioned between high-tech fortified citadels and desolate analog frontier wastelands.",
                "societal_strata": "A tripartite caste system consisting of the Ruling Directorate, the Technical Artisan Guilds, and the Displaced Frontier Survivors.",
                "primary_conflict": "The Directorate maintains total cognitive and resources control via synthetic networks, while the Resistance relies on unhackable analog frequencies to preserve human heritage."
            },

            "world_rules": [
                "RULE 01: Physical containment barriers strictly isolate safe residential sectors from toxic atmospheric hazards.",
                "RULE 02: Pure analog magnetic and acoustic media remains the only medium immune to orbital signal override.",
                "RULE 03: Direct neural interfaces experience severe kinetic shock when subjected to harmonic frequencies above 44 kHz.",
                "RULE 04: Extraction coordinates shift every six hours according to celestial orbital rotations.",
                "RULE 05: Anyone who initiates an unverified broadcast across planetary spires is marked for permanent syndicate purge."
            ],

            "factions": [
                {
                    "name": "The Apex Directorate",
                    "ideology": "Total computational order, zero-tolerance for systemic variance, complete resource monopoly.",
                    "leader": "High Overseer Vance",
                    "military_strength": "Automated drone squadrons and cyber-enhanced shock vanguard."
                },
                {
                    "name": "The Archivist Resistance",
                    "ideology": "Preservation of organic human memory, unconditional freedom of communication, decentralization.",
                    "leader": "The Council of Scribes",
                    "military_strength": "Covert guerrilla cells, acoustic hackers, and retrofitted industrial machinery."
                },
                {
                    "name": "The Scrap-Guild Outcasts",
                    "ideology": "Pragmatic survival, black-market salvage barter, neutral opportunism.",
                    "leader": "Elder Silas",
                    "military_strength": "Armored land-crawlers and scavenged EMP deterrents."
                }
            ],

            "locations_atlas": [
                {
                    "name": "Sector 9 Archival Bunker",
                    "type": "Subterranean Research Vault",
                    "visuals": "Fifty-foot steel tape silos, copper conduits, flickering phosphor displays, pools of condensation.",
                    "hazard": "Structural collapse and automated security laser grids."
                },
                {
                    "name": "The Crimson Rustlands",
                    "type": "Desolate Industrial Frontier",
                    "visuals": "Shattered skeletal superstructures, reddish-orange dust storms, derelict orbital launch boosters.",
                    "hazard": "Corrosive chemical squalls and mercenary drone patrols."
                },
                {
                    "name": "Silas's Transmission Spire",
                    "type": "Geodesic Observatory Workshop",
                    "visuals": "Brass oscilloscopes, stained glass reflection, pulsing copper antenna arrays, crowded workbenches.",
                    "hazard": "Electromagnetic discharge and high-altitude vortexes."
                },
                {
                    "name": "The Neon Under-Market (The Trench)",
                    "type": "Sub-Level Cyber Bazaar",
                    "visuals": "Dense holographic signs in amber and cyan, steam pipes, crowded noodle bars, cybernetic mod shops.",
                    "hazard": "Syndicate informants and localized EMP blackouts."
                },
                {
                    "name": "The Orbital Apex Platform",
                    "type": "Low-Earth Orbit Command Spire",
                    "visuals": "Pristine matte-black carbon fiber, panoramic zero-gravity vista of Earth, glowing cyan broadcast relays.",
                    "hazard": "Vacuum decompression and orbital defense particle beams."
                }
            ],

            "series_episodes_20": series_episodes_20,
            "tiktok_short_episodes": tiktok_short_episodes,

            "act_breakdown": {
                "act_1": {
                    "title": "ACT I: THE ANOMALY & THE CATALYST (1-3 HR FEATURE)",
                    "beats": [
                        "CAUSE: The protagonist operates in quiet defiance within Archival Chamber 9.",
                        "EFFECT: An unindexed 44 kHz frequency is uncovered, containing undeniable proof of erased history.",
                        "CONSEQUENCE: Directorate alarms ignite, shattering the illusion of safety and forcing an immediate escape."
                    ]
                },
                "act_2a": {
                    "title": "ACT II-A: THE WASTELAND & THE ALLIANCE",
                    "beats": [
                        "CAUSE: Escaping across the toxic Rustlands, the lead protagonist teams up with the brilliant Co-Lead Engineer.",
                        "EFFECT: Together they combine technical expertise to evade syndicate drone patrols and reach Silas's mountain workshop.",
                        "CONSEQUENCE: Silas confirms the key is real, unlocking his thirty-year secret and committing to the planetary rebellion."
                    ]
                },
                "act_2b": {
                    "title": "ACT II-B: THE SIEGE & THE MIDPOINT REVERSAL",
                    "beats": [
                        "CAUSE: The Antagonist locates the workshop's harmonic signature and launches a catastrophic assault.",
                        "EFFECT: Silas sacrifices his sanctuary with an EMP blast to buy the heroes precious seconds to board the orbital rocket.",
                        "CONSEQUENCE: The heroes ascend into the stratosphere with the entire military might of the syndicate in pursuit."
                    ]
                },
                "act_3": {
                    "title": "ACT III: THE ORBITAL CLIMAX & GLOBAL AWAKENING",
                    "beats": [
                        "CAUSE: The heroes breach the Orbital Apex Platform and lock down the primary planetary antenna.",
                        "EFFECT: A climactic confrontation against the Lead Antagonist on the zero-gravity gantry ends with the master broadcast switch engaged.",
                        "CONSEQUENCE: The cyan harmonic transmission floods every terminal on Earth, breaking the cognitive monopoly and igniting global liberation."
                    ]
                }
            }
        }
        return story_result

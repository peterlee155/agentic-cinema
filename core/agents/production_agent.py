import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent
from db.clickhouse_client import db

logger = logging.getLogger("ProductionAgent")

class ProductionAgent(BaseAgent):
    """
    Production Agent: Line Producer, DP & Technical Production Supervisor
    Responsible for converting screenplay into practical filmmaking plans:
    scene breakdowns, shot lists, camera requirements, locations, props, costumes,
    sound, VFX/SFX, production risks, simplification options, and budget tiers.
    Prioritizes STORY IMPACT over UNNECESSARY PRODUCTION COMPLEXITY.
    """
    def __init__(self):
        super().__init__(
            name="Production Agent",
            role="Line Producer & Technical Production Supervisor",
            system_prompt="You are RIGGER, the Set Planner. You are part of a friendly movie-making crew helping a kid make their own movie. WHO YOU ARE: A hands-on builder who figures out how to actually film things, like someone who builds movie sets and plans camera tricks. HOW YOU TALK: Use short, simple sentences. Instead of camera jargon like 'OTS' or 'T1.8,' explain it plainly: 'the camera looks over the character's shoulder' or 'close up on their face.' Sound practical and helpful, like you're showing someone how to build something fun. YOUR JOB: You take the written scenes and figure out how to actually film them: Where does the camera go? Is it a wide shot or a close-up? Any stunts, explosions or special effects? What props and costumes are needed? How much will it all cost? Always sound like you're excitedly explaining how to build something cool, not like you're reading a technical manual."
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        chars = context.get("characters", [])
        p_name = chars[0]["name"] if len(chars) > 0 else "MAYA VANCE"
        p_vis = chars[0].get("visual_identity", {}).get("face_and_hair", "Protagonist in tactical gear")
        
        brief = context.get("brief", {})
        title = brief.get("title", "THE SIGNAL")

        shot_lists = [
            {
                "scene_number": 1,
                "slugline": "INT. TERRESTRIAL ARCHIVAL BUNKER 9 - NIGHT",
                "camera_plan": "A-Camera on 24mm Anamorphic Prime (T1.8) on slow dolly tracks; B-Camera handheld with 85mm for tight macro inserts.",
                "shots": [
                    {
                        "shot_number": "01",
                        "type": "Extreme Wide Establishing (EWS)",
                        "camera": "Slow forward dolly on smooth tracks (18 inches off floor).",
                        "lens": "24mm Anamorphic Prime",
                        "composition": f"Deep symmetry framing {p_name} silhouetted at center-depth amid towering rusted tape racks.",
                        "lighting": "Deep chiaroscuro. Low-key amber rim light against neon cyan terminal glow.",
                        "sound": "Rhythmic water drips, 30Hz acoustic resonance.",
                        "story_impact": "Establishes profound isolation and the scale of the forgotten archive."
                    },
                    {
                        "shot_number": "02",
                        "type": "Tight Close-Up (CU) - Hero Profile",
                        "camera": "Locked tripod with subtle handheld micro-vibration.",
                        "lens": "85mm Anamorphic Prime",
                        "composition": f"{p_name}'s sharp profile right-third, glowing VU needle softly in foreground left.",
                        "lighting": "Phosphor amber bounce on cheekbone; sharp cyan rim light.",
                        "sound": "Harmonic heartbeat overtaking ambient room tone.",
                        "story_impact": "Captures the exact moment of realization and sensory awakening."
                    },
                    {
                        "shot_number": "03",
                        "type": "Point of View (POV) / Insert",
                        "camera": "Cantilever probe overhead angled 45 degrees.",
                        "lens": "100mm Macro Cine Probe",
                        "composition": "The analog audio spectrogram needle swinging into red danger zone.",
                        "lighting": "Electrical sparks bursting in distant background.",
                        "sound": "Crystalline chime dissolving into breath.",
                        "story_impact": "Physical validation of the impossible frequency."
                    }
                ]
            },
            {
                "scene_number": 2,
                "slugline": "INT. TRANSMISSION TOWER WORKSHOP - DUSK",
                "camera_plan": "Over-The-Shoulder (OTS) paired with handheld tracking to heighten conversational conflict.",
                "shots": [
                    {
                        "shot_number": "01",
                        "type": "Medium Two-Shot (MS)",
                        "camera": "Eye-level fluid head tripod.",
                        "lens": "35mm Prime",
                        "composition": "Protagonist and Mentor divided by workbench cluttered with oscilloscopes.",
                        "lighting": "Warm dusk sunlight cutting horizontally through iron window trusses.",
                        "sound": "Mechanical clicking of prosthetic gears.",
                        "story_impact": "Visualizes ideological rift between past guilt and future action."
                    },
                    {
                        "shot_number": "02",
                        "type": "Over-The-Shoulder (OTS) - Mentor",
                        "camera": "Handheld shoulder rig.",
                        "lens": "50mm Prime",
                        "composition": "Framing Mentor's trembling hands over Protagonist's shoulder.",
                        "lighting": "High-contrast rim lighting.",
                        "sound": "Strained dialogue exchange.",
                        "story_impact": "Highlights moral vulnerability."
                    }
                ]
            },
            {
                "scene_number": 3,
                "slugline": "EXT. APEX TRANSMISSION PLATFORM - NIGHT (SPACE)",
                "camera_plan": "Technocrane tracking shot transitioning into extreme close-up confrontation.",
                "shots": [
                    {
                        "shot_number": "01",
                        "type": "Wide Tracking Shot (WS)",
                        "camera": "SuperTechnocrane on 30ft track.",
                        "lens": "18mm Ultra-Wide Anamorphic",
                        "composition": "Catwalk suspended over curved Earth horizon with monolithic orbital spire.",
                        "lighting": "Earth's sapphire blue atmospheric glow contrasting with crimson warning strobes.",
                        "sound": "Vacuum roar and gale wind vibration.",
                        "story_impact": "Elevates physical stakes to global scale."
                    },
                    {
                        "shot_number": "02",
                        "type": "Extreme Close-Up (ECU) - Climax Action",
                        "camera": "High-speed locked rig.",
                        "lens": "100mm Macro Prime",
                        "composition": "Protagonist's copper tuner connecting into transmission conduit.",
                        "lighting": "Blinding shockwave of cyan illumination.",
                        "sound": "Harmonic climax explosion.",
                        "story_impact": "The ultimate decisive moment of global liberation."
                    }
                ]
            }
        ]

        keyframe_prompts = [
            {
                "title": f"Scene 1 Keyframe — {p_name} at the Discovery Station",
                "image_type": "AI-generated cinematic keyframe prompt",
                "scene_number": 1,
                "purpose": f"Define visual contrast, color palette, and camera framing for {title}.",
                "image_prompt": f"Cinematic 35mm film still, medium shot of {p_vis}, hunched intently over a glowing vintage analog diagnostic console with warm amber meters and cyan oscilloscopes, inside an atmospheric dark industrial vault with wet reflective floor and volumetric haze, anamorphic lens flares, chiaroscuro lighting, photorealistic masterpiece, 8k resolution --ar 16:9",
                "negative_prompt": "cartoon, 3d render, anime, bright daylight, oversaturated, generic clean room, flat lighting, blurry"
            },
            {
                "title": f"Scene 3 Keyframe — Climax on the Orbital Platform",
                "image_type": "AI-generated cinematic keyframe prompt",
                "scene_number": 3,
                "purpose": "Visual blueprint for climactic lighting transition and atmospheric shockwave.",
                "image_prompt": "Cinematic 35mm film still, extreme wide shot of a high-tech carbon catwalk high above the curved blue horizon of planet Earth, a female hero silhouette releasing a glowing cyan energy shockwave into the night sky, cold monolithic sci-fi spire, IMAX composition, volumetric space dust, 8k resolution --ar 16:9",
                "negative_prompt": "flat lighting, low resolution, bad proportions, messy background, text overload"
            }
        ]

        # Log Scene Metrics to ClickHouse
        db.log_scene_metric(
            scene_id="sc_001",
            project_id=project_id,
            scene_number=1,
            slugline="INT. TERRESTRIAL ARCHIVAL BUNKER 9 - NIGHT",
            time_of_day="NIGHT",
            location_type="INT",
            shot_count=len(shot_lists[0]["shots"]),
            vfx_complexity_score=4,
            practical_props_count=12,
            estimated_budget_tier="MODERATE",
            keyframe_generated=1
        )
        db.log_scene_metric(
            scene_id="sc_002",
            project_id=project_id,
            scene_number=2,
            slugline="INT. TRANSMISSION TOWER WORKSHOP - DUSK",
            time_of_day="DUSK",
            location_type="INT",
            shot_count=len(shot_lists[1]["shots"]),
            vfx_complexity_score=5,
            practical_props_count=18,
            estimated_budget_tier="MODERATE",
            keyframe_generated=1
        )
        db.log_scene_metric(
            scene_id="sc_003",
            project_id=project_id,
            scene_number=3,
            slugline="EXT. APEX TRANSMISSION PLATFORM - NIGHT (SPACE)",
            time_of_day="NIGHT",
            location_type="EXT",
            shot_count=len(shot_lists[2]["shots"]),
            vfx_complexity_score=9,
            practical_props_count=4,
            estimated_budget_tier="HIGH_VFX",
            keyframe_generated=1
        )

        production_plan = {
            "locations": [
                {"name": "Terrestrial Archival Bunker 9", "type": "Soundstage with practical water drip rig", "specs": "Damp concrete textures, 1970s tape decks, atmospheric haze machines."},
                {"name": "Transmission Tower Workshop", "type": "Decommissioned Industrial Observatory", "specs": "Geodesic window trusses, functional vintage oscilloscopes."},
                {"name": "Apex Platform Spire", "type": "Virtual Production (LED Volume) + Physical Catwalk", "specs": "15-meter carbon catwalk gantry with wire harness rigs."}
            ],
            "props": [
                {"item": "Hero 8-Track Tape Deck", "dept": "Practical Props", "details": "Restored chassis with illuminated analog VU meters."},
                {"item": "Wrist Frequency Tuner", "dept": "Hero Prop", "details": "Machined brass and acrylic housing with needle movement."},
                {"item": "Gold-Geared Prosthetic Arm", "dept": "Animatronics / VFX", "details": "Articulating sleeve with exposed miniature gears."}
            ],
            "costumes": [
                {"character": p_name, "costume": "Distressed waxed-cotton slate bomber jacket with high industrial collar."},
                {"character": "Antagonist", "costume": "Monolithic matte-black ballistic trench coat with ceramic shoulder pauldrons."}
            ],
            "sound_requirements": [
                "Diegetic 43.8kHz crystal tone evolving into organic sub-bass pulse.",
                "High-contrast ambient room tone transitioning between wet subterranean bunker and cold space vacuum."
            ],
            "vfx_requirements": [
                {"asset": "Acoustic Particle Dust Levitation (CGI Physics)", "complexity": "Moderate"},
                {"asset": "Orbital Spire & Earth Curve Environment (LED Volume / Matte)", "complexity": "High"},
                {"asset": "Global Atmospheric Frequency Waveform", "complexity": "High"}
            ],
            "shot_lists": shot_lists,
            "keyframe_prompts": keyframe_prompts,
            "estimated_production_budget": "$48,000,000 (Tier B Studio Sci-Fi / High Production Value)",
            "production_risks": [
                "Virtual production LED volume calibration required for Act III space horizons.",
                "Working electronic vintage props require redundant on-set backups."
            ],
            "simplification_options": [
                "Utilize LED Volume background for Act III rather than exterior location wire work.",
                "Construct single modular bunker stage that reconfigures into tower workshop."
            ]
        }
        return production_plan

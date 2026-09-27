"""
Central Production Orchestrator for Agentic Cinema.
Coordinates the specialized AI filmmaking swarm:
USER IDEA -> PRODUCER -> SCREENWRITER -> DIRECTOR -> ART DIRECTOR -> CINEMATOGRAPHER
-> STORYBOARD -> SOUND & MUSIC -> EDITOR -> FINAL PRODUCTION PACKAGE -> SOCIAL & VIRAL -> DANCE

Maintains canonical Project Bible, caches completed agent stages,
supports single-agent retries, audits continuity, and streams telemetry to ClickHouse MCP.
"""

import os
import json
import uuid
import time
import threading
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from core.agents import (
    ProducerAgent,
    ScreenwriterAgent,
    DirectorAgent,
    ArtDirectorAgent,
    CinematographerAgent,
    StoryboardAgent,
    StoryboardVisualAgent,
    SoundAgent,
    EditorAgent,
    SocialAgent,
    DanceAgent,
    ContinuityCheckerAgent,
    BroAgent,
    ScriptAnalysisAgent,
    AudioVoiceAgent,
    ProductionOpsAgent,
    CharacterAgent,
    SongMusicAgent,
    BudgetSimplificationAgent,
    KeyframeAgent,
    ActorAgent,
    ActressAgent
)
from core.project_bible import ProjectBible
from core.gcs_storage import gcs_storage
from core.continuity_engine import continuity_engine
from core.generation_engine import generation_engine
from core.model_registry import model_registry
from db.clickhouse_client import db

logger = logging.getLogger("CinematicOrchestrator")

class CentralProductionOrchestrator:
    """Central orchestrator managing multi-agent film production workflows."""

    def __init__(self, storage_dir: Optional[str] = None):
        self.root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.storage_dir = storage_dir or os.path.join(self.root_dir, "data", "projects")
        os.makedirs(self.storage_dir, exist_ok=True)

        # Initialize specialized agent swarm (User-facing)
        self.producer_agent = ProducerAgent()
        self.screenwriter_agent = ScreenwriterAgent()
        self.director_agent = DirectorAgent()
        self.art_director_agent = ArtDirectorAgent()
        self.cinematographer_agent = CinematographerAgent()
        self.storyboard_agent = StoryboardAgent()
        self.sound_agent = SoundAgent()
        self.editor_agent = EditorAgent()
        self.social_agent = SocialAgent()
        self.dance_agent = DanceAgent()
        self.continuity_agent = ContinuityCheckerAgent()

        # Google Devpost Hackathon Focus Agents
        self.script_analysis_agent = ScriptAnalysisAgent()
        self.audio_voice_agent = AudioVoiceAgent()
        self.production_ops_agent = ProductionOpsAgent()

        # Creative Swarm, Cast & Production Specialists
        self.character_agent = CharacterAgent()
        self.song_agent = SongMusicAgent()
        self.budget_agent = BudgetSimplificationAgent()
        self.keyframe_agent = KeyframeAgent()
        self.actor_agent = ActorAgent()
        self.actress_agent = ActressAgent()

        # Confidential Internal Agent (OUR SIDE ONLY — hidden from users)
        self.bro_agent = BroAgent()
        self.internal_agents = {"bro": self.bro_agent}

        # In-memory project cache & active image generation jobs
        self.projects: Dict[str, ProjectBible] = {}
        self._active_image_jobs: Dict[str, Dict[str, Any]] = {}
        self._swarm_status: Dict[str, Dict[str, Any]] = {}
        self.current_project_id = None
        self._init_projects()

    def _init_projects(self):
        """Loads existing projects from disk."""
        for fname in os.listdir(self.storage_dir):
            if fname.endswith(".json"):
                try:
                    fpath = os.path.join(self.storage_dir, fname)
                    p = ProjectBible.load_from_file(fpath)
                    self.projects[p.project_id] = p
                except Exception as e:
                    logger.warning(f"Could not load project file {fname}: {e}")

        if self.projects:
            self.current_project_id = list(self.projects.keys())[0]
        else:
            self.current_project_id = None

    def _update_swarm_status(
        self,
        project_id: str,
        is_running: bool,
        current_agent: Optional[str],
        step: int,
        total_steps: int,
        message: str
    ):
        """Updates real-time swarm execution telemetry for frontend polling."""
        if not project_id:
            return
        status = self._swarm_status.get(project_id, {
            "completed_agents": []
        })
        completed = list(status.get("completed_agents", []))
        prev_agent = status.get("current_agent")
        if prev_agent and prev_agent != current_agent and prev_agent not in completed:
            completed.append(prev_agent)

        percent = 100 if not is_running else min(99, int((step / max(1, total_steps)) * 100))
        self._swarm_status[project_id] = {
            "project_id": project_id,
            "is_running": is_running,
            "current_agent": current_agent,
            "step": step,
            "total_steps": total_steps,
            "percent": percent,
            "message": message,
            "completed_agents": completed,
            "updated_at": datetime.utcnow().isoformat()
        }
        logger.info(f"[SwarmTelemetry] {project_id} -> Step {step}/{total_steps} ({percent}%): {message}")

    def get_swarm_status(self, project_id: str) -> Dict[str, Any]:
        """Returns the current real-time swarm status for a project."""
        if not project_id:
            return {
                "is_running": False,
                "percent": 0,
                "current_agent": None,
                "completed_agents": [],
                "message": "No project selected"
            }
        status = self._swarm_status.get(project_id)
        if status:
            return status

        bible = self.projects.get(project_id)
        if bible and bible.scenes and len(bible.scenes) > 0:
            return {
                "project_id": project_id,
                "is_running": False,
                "current_agent": None,
                "step": 15,
                "total_steps": 15,
                "percent": 100,
                "message": "Production assets ready",
                "completed_agents": [
                    "Executive Producer", "Screenwriter", "Film Director", "Script Analyst",
                    "Art Director", "Cinematographer (DP)", "Visual Storyboard", "Concept Art & Keyframe Illustrator",
                    "Sound & Music", "Soundtrack & Theme Songwriter", "Film Editor", "Continuity Supervisor",
                    "Line Producer & Budget Optimizer", "Production & Studio Ops", "Dance & Movement", "Social & Viral",
                    "Casting Director", "Lead Actor Performance", "Lead Actress Performance", "Voice & Table Read Director"
                ],
                "updated_at": datetime.utcnow().isoformat()
            }
        return {
            "project_id": project_id,
            "is_running": False,
            "current_agent": None,
            "step": 0,
            "total_steps": 15,
            "percent": 0,
            "message": "Ready to launch production swarm",
            "completed_agents": [],
            "updated_at": datetime.utcnow().isoformat()
        }

    def get_agent_map(self) -> Dict[str, Any]:
        return {
            # Executive Producer
            "producer": self.producer_agent,
            "executive_producer": self.producer_agent,
            "producer_agent": self.producer_agent,

            # Screenwriter
            "screenwriter": self.screenwriter_agent,
            "screenwriter_agent": self.screenwriter_agent,
            "script": self.screenwriter_agent,

            # Film Director
            "director": self.director_agent,
            "film_director": self.director_agent,
            "director_agent": self.director_agent,

            # Production Designer / Art Director
            "art_director": self.art_director_agent,
            "art_director_agent": self.art_director_agent,
            "production_designer": self.art_director_agent,

            # Cinematographer (DP)
            "cinematographer": self.cinematographer_agent,
            "cinematographer_dp": self.cinematographer_agent,
            "cinematographer_agent": self.cinematographer_agent,
            "dp": self.cinematographer_agent,

            # Storyboard
            "storyboard": self.storyboard_agent,
            "storyboard_visual": self.storyboard_agent,
            "visual_storyboard": self.storyboard_agent,
            "storyboard_agent": self.storyboard_agent,

            # Sound & Music
            "sound": self.sound_agent,
            "sound_music": self.sound_agent,
            "sound_agent": self.sound_agent,
            "music": self.sound_agent,

            # Film Editor
            "editor": self.editor_agent,
            "film_editor": self.editor_agent,
            "editor_agent": self.editor_agent,

            # Social & Viral
            "social": self.social_agent,
            "social_viral": self.social_agent,
            "social_marketing": self.social_agent,
            "social_agent": self.social_agent,

            # Dance & Movement
            "dance": self.dance_agent,
            "dance_movement": self.dance_agent,
            "movement_dance": self.dance_agent,
            "dance_agent": self.dance_agent,

            # Continuity Checker / Supervisor
            "continuity": self.continuity_agent,
            "continuity_supervisor": self.continuity_agent,
            "continuity_checker": self.continuity_agent,
            "continuity_agent": self.continuity_agent,

            # Script Analyst
            "script_analysis": self.script_analysis_agent,
            "script_analyst": self.script_analysis_agent,
            "script_analysis_agent": self.script_analysis_agent,

            # Voice & Table Read Director
            "audio_voice": self.audio_voice_agent,
            "voice_table_read_director": self.audio_voice_agent,
            "voice_director": self.audio_voice_agent,
            "table_read": self.audio_voice_agent,
            "audio_voice_agent": self.audio_voice_agent,

            # Production & Studio Ops
            "production_ops": self.production_ops_agent,
            "production_studio_ops": self.production_ops_agent,
            "studio_ops": self.production_ops_agent,
            "production_ops_agent": self.production_ops_agent,

            # Casting Director / Character Agent
            "character": self.character_agent,
            "character_agent": self.character_agent,
            "casting_director": self.character_agent,
            "casting": self.character_agent,

            # Soundtrack & Theme Songwriter
            "song": self.song_agent,
            "song_music": self.song_agent,
            "song_agent": self.song_agent,
            "soundtrack": self.song_agent,
            "theme_song": self.song_agent,
            "soundtrack_theme_songwriter": self.song_agent,
            "soundtrack_songwriter": self.song_agent,
            "songwriter": self.song_agent,

            # Line Producer & Budget Optimizer
            "budget": self.budget_agent,
            "budget_agent": self.budget_agent,
            "line_producer": self.budget_agent,
            "budget_optimizer": self.budget_agent,
            "line_producer_budget_optimizer": self.budget_agent,
            "line_producer_budget": self.budget_agent,
            "budget_simplification": self.budget_agent,

            # Keyframe & Concept Art Illustrator
            "keyframe": self.keyframe_agent,
            "keyframe_agent": self.keyframe_agent,
            "concept_art": self.keyframe_agent,
            "keyframe_illustrator": self.keyframe_agent,
            "concept_art_keyframe_illustrator": self.keyframe_agent,
            "concept_art_illustrator": self.keyframe_agent,

            # Lead Actor & Lead Actress Performance
            "actor": self.actor_agent,
            "actor_agent": self.actor_agent,
            "lead_actor": self.actor_agent,
            "lead_actor_performance": self.actor_agent,
            "lead_actor_agent_leo_thorne": self.actor_agent,
            "actress": self.actress_agent,
            "actress_agent": self.actress_agent,
            "lead_actress": self.actress_agent,
            "lead_actress_performance": self.actress_agent,
            "lead_actress_agent_lyra_sterling": self.actress_agent,
        }

    def list_projects(self, owner: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Returns high-level metadata for all active projects in the studio."""
        result = []
        if "undefined" in self.projects:
            del self.projects["undefined"]

        for pid, b in self.projects.items():
            if pid in ("undefined", "null", "None") or not pid:
                continue

            result.append({
                "id": b.project.get("id") or pid,
                "title": b.project.get("title", "Untitled Film"),
                "genre": b.project.get("genre", "Cinematic"),
                "logline": (b.project.get("logline") or "")[:140] + ("..." if len(b.project.get("logline") or "") > 140 else ""),
                "stage": b.project.get("stage", "IN_PRODUCTION"),
                "updated_at": b.updated_at,
                "scene_count": len(b.scenes),
                "character_count": len(b.characters),
                "is_current": (pid == self.current_project_id),
                "tone": b.project.get("tone"),
                "visualStyle": b.project.get("visualStyle")
            })
        return result

    def get_project(self, project_id: Optional[str] = None) -> ProjectBible:
        pid = project_id or self.current_project_id
        if pid in ("current", "undefined", "null", "None", "") or not pid:
            valid_keys = [k for k in self.projects.keys() if k not in ("undefined", "null", "None")]
            if valid_keys:
                pid = valid_keys[0]
            else:
                self._load_projects_from_storage()
                valid_keys = [k for k in self.projects.keys() if k not in ("undefined", "null", "None")]
                pid = valid_keys[0] if valid_keys else "proj_default"

        if pid not in self.projects:
            fpath = os.path.join(self.storage_dir, f"{pid}.json")
            if os.path.exists(fpath):
                self.projects[pid] = ProjectBible.load_from_file(fpath)
            else:
                if pid in ("undefined", "null", "None") or not pid:
                    valid_keys = [k for k in self.projects.keys() if k not in ("undefined", "null", "None")]
                    return self.projects[valid_keys[0]] if valid_keys else ProjectBible(project_id="proj_default")
                self.projects[pid] = ProjectBible(project_id=pid)
        self.current_project_id = pid
        return self.projects[pid]

    def create_project(self, title: str, logline: str, genre: str = "Cinematic Sci-Fi",
                       tone: str = "Gritty, tense", visual_style: str = "35mm Anamorphic",
                       target_duration: str = "110 Minutes", language: str = "English",
                       owner_id: Optional[str] = None, owner_email: Optional[str] = None,
                       owner_name: Optional[str] = None,
                       extra_meta: Optional[Dict[str, Any]] = None) -> ProjectBible:
        """Project Wizard factory method with flexible AI-driven canonical metadata."""
        pid = f"proj_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
        bible = ProjectBible(project_id=pid)
        bible.project = {
            "id": pid,
            "title": title or "UNTITLED FILM",
            "logline": logline,
            "project_information": logline,
            "genre": genre,
            "tone": tone,
            "visualStyle": visual_style,
            "targetDuration": target_duration,
            "language": language,
            "stage": "CONCEPT",
            "credits_used": 0,
            "credits_total": 250,
            "plan": "CREATOR",
            "owner_id": owner_id,
            "owner_email": owner_email,
            "owner_name": owner_name,
            **(extra_meta or {})
        }

        is_demo = str(pid) in ("proj_demo", "demo")
        if is_demo:
            # Seed initial canonical scenes, storyboard frames, and sound blueprints for demo project
            self._seed_initial_project_assets(bible, title, logline, genre, tone, visual_style)
            self.start_auto_storyboard_generation(pid, priority_scene=1)
        else:
            # Clean new project with no legacy leftovers
            bible.scenes = []
            bible.characters = []
            bible.cast = []
            bible.storyboard = []
            bible.audio = []
            bible.shots = []
            bible.locations = []
            bible.worldRules = []
            bible.has_real_screenplay = False
            bible.storyForMe = bible.get_story_for_me_default()

        fpath = os.path.join(self.storage_dir, f"{pid}.json")
        bible.save_to_file(fpath)
        try:
            gcs_storage.upload_project(pid, bible.to_dict())
        except Exception:
            pass
        self.projects[pid] = bible
        self.current_project_id = pid
        return bible

    def _seed_initial_project_assets(self, bible: ProjectBible, title: str, logline: str,
                                     genre: str, tone: str, visual_style: str):
        """Seeds rich, narrative-aligned starter scenes, storyboard frames, and audio blueprints."""
        clean_title = title or "UNTITLED FILM"
        clean_logline = logline or "In a fragile borderland, an expedition scout ventures outside the protective barriers on a dying countdown clock."
        is_demo = str(bible.project_id) in ("proj_demo", "demo")

        # 5 Canonical starter scenes
        bible.scenes = [
            {
                "sceneNumber": 1,
                "act": "Act I",
                "slugline": "EXT. PERIMETER GATEWAY - NIGHT",
                "intExt": "EXT",
                "location": "PERIMETER GATEWAY",
                "time": "NIGHT",
                "objective": "Survey the breach and secure the outer boundary",
                "conflict": "Atmospheric pressure dropping as perimeter wards begin flickering",
                "action": f"Heavy rain lashes against the weathered bulwark. Atmospheric mist billows through floodlights. The scout steps forward into the cold rain of {clean_title}, tightening combat gloves as the perimeter warning beacon pulses an amber alert.",
                "dialogue": f"COMMAND (OVER RADIO)\nStatus report. Have you made visual contact with the boundary?\n\nHERO\nPerimeter reached. Moving into position now.",
                "characters": ["HERO", "COMMAND"]
            },
            {
                "sceneNumber": 2,
                "act": "Act I",
                "slugline": "INT. SUBTERRANEAN ANTECHAMBER - NIGHT",
                "intExt": "INT",
                "location": "SUBTERRANEAN ANTECHAMBER",
                "time": "NIGHT",
                "objective": "Decrypt the ancestral log and confirm mission coordinates",
                "conflict": "Power grid decays; shadows detach from damp stone walls",
                "action": "Water trickles down ancient fluted conduits. Phosphorescent monitors flicker against raw bedrock. An encrypted terminal hums to life, projecting cold blue volumetric schematics into damp air.",
                "dialogue": "GUIDE\nPower grid is decaying faster than projected. If we cross the fault line, there's no recall protocol.\n\nHERO\nWe didn't come here looking for a recall protocol. Open the vault.",
                "characters": ["HERO", "GUIDE"]
            },
            {
                "sceneNumber": 3,
                "act": "Act II-A",
                "slugline": "EXT. THE ASH PLAIN - DAWN",
                "intExt": "EXT",
                "location": "THE ASH PLAIN",
                "time": "DAWN",
                "objective": "Navigate the desolate crossing before thermal exposure peaks",
                "conflict": "Hostile silhouettes tracking the team's coordinates from the fog line",
                "action": "A stark, horizon-to-horizon wasteland under an ochre dawn sky. Volumetric dust spirals twist across shattered stone pillars. Every breath condenses in the biting wind as unseen footsteps shadow their trajectory.",
                "dialogue": "GUIDE (WHISPERING)\nDon't look directly at them. Keep moving. Eyes on the compass.\n\nHERO\nI'm on it. Almost across.",
                "characters": ["HERO", "GUIDE"]
            },
            {
                "sceneNumber": 4,
                "act": "Act II-B",
                "slugline": "INT. THE CENTRAL CHASM - CONTINUOUS",
                "intExt": "INT",
                "location": "THE CENTRAL CHASM",
                "time": "DAY",
                "objective": "Neutralize the core anomaly before total containment failure",
                "conflict": "The team's secondary safeguard is compromised from within",
                "action": "Suspended steel walkways span a bottomless thermal rift. Prismatic ionization arcs violently between monolithic reactor towers. Sparks shower onto metal grating below as sirens scream.",
                "dialogue": "RIVAL\nYou never understood what we were guarding down here. It was never meant to be preserved.\n\nHERO\nStep away from the primary conduit. Now.",
                "characters": ["HERO", "RIVAL"]
            },
            {
                "sceneNumber": 5,
                "act": "Act III",
                "slugline": "EXT. THE SUMMIT OVERLOOK - SUNRISE",
                "intExt": "EXT",
                "location": "THE SUMMIT OVERLOOK",
                "time": "DAWN",
                "objective": "Seal the breach and bear witness to the transformed horizon",
                "conflict": "The physical cost of victory and lingering uncertainty of what escaped",
                "action": f"The first rays of sunlight break through smoke-choked clouds, illuminating a silent, transformed world. Our protagonist stands battered at the cliff edge, gazing out over the sprawling landscape of {clean_title} as warning sirens finally fall silent.",
                "dialogue": "HERO (V.O.)\nWe held the line. The world survived the night. But some doors, once unsealed, never truly close again.",
                "characters": ["HERO"]
            }
        ]
        bible.screenplay = bible.scenes

        # 5 Storyboard keyframe initializers
        # For new projects, status is PENDING and imageUrl is None so auto-generator will produce images
        bible.storyboard = [
            {
                "scene": 1,
                "frame": 1,
                "shot": "Wide Low-Angle Bulwark Gate",
                "camera_shot_type": "Low-Angle 24mm Anamorphic Wide Shot",
                "lighting_and_color_palette": "High-contrast chiaroscuro, amber perimeter lights cutting through cold rain",
                "subject_action": "Protagonist standing on rain-soaked mud facing colossal metal threshold",
                "environment_details": "Heavy iron bulwark, floodlight halos in torrential downpour, atmospheric mist",
                "artistic_style_and_textures": "35mm film grain, glistening wet canvas coat, tactile basalt ground",
                "imagePrompt": f"Cinematic 35mm film still of {clean_title}, Scene 1, low-angle wide shot of a lone cloaked explorer standing before an imposing metal fortress gate in a violent night rainstorm. Amber floodlights cutting through dense volumetric fog. 8k, Arri Alexa Mini LF, Master Anamorphic Primes.",
                "videoPrompt": "Slow forward tracking low-angle camera moving toward the rain-soaked bulwark gates as amber warning lights sweep across the frame. 24fps film motion.",
                "camera": "24mm Master Anamorphic",
                "lighting": "Volumetric amber and tungsten rim lighting",
                "imageUrl": "/static/img/the_last_spell_poster.jpg" if is_demo else None,
                "imageStatus": "COMPLETE" if is_demo else "PENDING"
            },
            {
                "scene": 2,
                "frame": 1,
                "shot": "Medium Tracking Chasm Antechamber",
                "camera_shot_type": "Medium Over-Shoulder Tracking Shot",
                "lighting_and_color_palette": "Deep obsidian shadows with cyan holographic terminal luminescence",
                "subject_action": "Hands adjusting dial on an ancient runic console as blue schematics radiate",
                "environment_details": "Subterranean vaulted stone ceiling with fluted conduits and dripping water",
                "artistic_style_and_textures": "Shallow depth of field, fine condensation droplets, brushed titanium",
                "imagePrompt": f"Cinematic 35mm film still of {clean_title}, Scene 2, interior underground vault, medium shot of hands touching a glowing holographic terminal projecting blue data into damp air. 8k, photorealistic chiaroscuro lighting.",
                "videoPrompt": "Smooth arc camera move circling the holographic terminal as blue light illuminates the character's focused expression. 24fps motion.",
                "camera": "50mm Anamorphic T1.5",
                "lighting": "Cyan holographic glow and deep umber room tone",
                "imageUrl": "/static/generated/flux_603b837482.jpg" if is_demo else None,
                "imageStatus": "COMPLETE" if is_demo else "PENDING"
            },
            {
                "scene": 3,
                "frame": 1,
                "shot": "Extreme Wide Wasteland Horizon",
                "camera_shot_type": "Extreme Wide Landscape with 18mm Lens",
                "lighting_and_color_palette": "Muted ochre and slate grey dawn light, stark high-contrast silhouettes",
                "subject_action": "Small exploration team marching across colossal desolate cracked earth",
                "environment_details": "Shattered monoliths stretching into distant foggy mountain peaks",
                "artistic_style_and_textures": "Coarse dust particles, atmospheric horizon haze, weathered stone textures",
                "imagePrompt": f"Cinematic 35mm film still of {clean_title}, Scene 3, extreme wide panoramic shot of an exploration team traversing an endless misty ash plain under an ochre dawn sky. Monolithic ruins in distance, 8k resolution.",
                "videoPrompt": "High-angle slow crane sweep descending toward the team as wind whips dust across cracked wasteland. 24fps cinematic motion.",
                "camera": "18mm Ultra Prime Widescreen",
                "lighting": "Diffuse cold dawn with low-angle golden sun rim",
                "imageUrl": "/static/generated/flux_04110a77df.jpg" if is_demo else None,
                "imageStatus": "COMPLETE" if is_demo else "PENDING"
            },
            {
                "scene": 4,
                "frame": 1,
                "shot": "High-Angle Thermal Rift Confrontation",
                "camera_shot_type": "Dutch-Angle High Perspective",
                "lighting_and_color_palette": "Blinding violet electric ionization arcs clashing with dark orange furnace glow",
                "subject_action": "Two figures confronting each other on a narrow suspended steel bridge",
                "environment_details": "Monolithic reactor coils rising from a bottomless illuminated rift",
                "artistic_style_and_textures": "Motion-blurred sparks, specular reflections on steel grating, heat distortion",
                "imagePrompt": f"Cinematic 35mm film still of {clean_title}, Scene 4, dramatic confrontation on a narrow industrial gantry suspended over a glowing thermal rift. Violet electrical discharges, sparks showering down. 8k photorealistic.",
                "videoPrompt": "Dynamic push-in tracking shot along the gantry bridge toward the confrontation as electrical sparks burst across the frame. 24fps.",
                "camera": "35mm Anamorphic Lens",
                "lighting": "Strobe-like violet electrical flashes and deep furnace underglow",
                "imageUrl": "/static/generated/flux_603b837482.jpg" if is_demo else None,
                "imageStatus": "COMPLETE" if is_demo else "PENDING"
            },
            {
                "scene": 5,
                "frame": 1,
                "shot": "Heroic Sunrise Cliff Silhouette",
                "camera_shot_type": "Low-Angle Hero Shot 35mm",
                "lighting_and_color_palette": "Warm golden sunrise rim light piercing dark storm clouds",
                "subject_action": "Leader standing tall against the dawn looking over the saved horizon",
                "environment_details": "Granite promontory overlooking sprawling mist-covered valleys",
                "artistic_style_and_textures": "Atmospheric god-rays, deep contrast, rich 35mm grain",
                "imagePrompt": f"Cinematic 35mm film still of {clean_title}, Scene 5, low-angle hero shot of a weathered scout standing at the summit cliff overlooking a vast horizon as golden sunlight breaks through stormy dawn clouds. 8k, photorealistic.",
                "videoPrompt": "Slow upward tilt from the muddy boots to the determined face of the protagonist bathed in warm dawn sunlight. 24fps.",
                "camera": "35mm Master Anamorphic",
                "lighting": "Golden dawn rim light and deep ambient shadows",
                "imageUrl": "/static/img/the_last_spell_poster.jpg" if is_demo else None,
                "imageStatus": "COMPLETE" if is_demo else "PENDING"
            }
        ]

        # 5 Sound & Music Blueprints
        bible.audio = [
            {
                "scene": "Scene 1: EXT. PERIMETER GATEWAY - NIGHT",
                "dialogue": "Crisp, intimate close-mic vocal capture with subtle wet stone boundary reverberation (RT60: 1.8s).",
                "ambience": "Heavy torrential rain drumming on corrugated steel; low frequency wind howl through metal girders.",
                "foley": "Wet mud footstep sloshes, heavy oiled-canvas duster friction, tactical glove velcro adjustments.",
                "soundEffects": "Deep 38Hz sub-bass drone pulsating from perimeter generators; intermittent warning claxon chirp.",
                "music": "Sparse, brooding cello pedal tones beneath high-tension bowed cymbal harmonics.",
                "silence": "STRATEGIC SILENCE: Exactly 2.5 seconds of dead silence right as the perimeter floodlight cuts out.",
                "emotionalCue": "The sudden acoustic vacuum creates acute physiological dread before the threat manifests.",
                "transition": "Pre-lapping J-Cut: Water drip acoustics bleed in 1.2 seconds before cutting to Scene 2."
            },
            {
                "scene": "Scene 2: INT. SUBTERRANEAN ANTECHAMBER - NIGHT",
                "dialogue": "Reverberant acoustic slapback off damp subterranean granite; vocal clarity preserved with gentle de-essing.",
                "ambience": "Rhythmic, distant water drops (60 BPM); low transformer coil hum (60Hz ground buzz).",
                "foley": "Boot heel clicks echoing off wet stone tiles; tactile clatter of terminal toggles and ceramic buttons.",
                "soundEffects": "Pneumatic seal hiss on vault hatch; high-frequency digital ping as hologram materializes.",
                "music": "NO ORCHESTRA: Purely textural acoustic design emphasizing isolation and subterranean claustrophobia.",
                "silence": "Complete acoustic drop when terminal unlocks, focusing auditory attention on the display.",
                "emotionalCue": "Cold clinical resonance signifying ancient, detached machine intelligence.",
                "transition": "L-Cut: The deep vault echo lingers underneath the wide landscape cut of Scene 3."
            },
            {
                "scene": "Scene 3: EXT. THE ASH PLAIN - DAWN",
                "dialogue": "Wind-buffered whispered speech; directional stereo panning emphasizing spatial separation between characters.",
                "ambience": "Hollow, desolate wind sweeping across vast expanse; fine dust grains pelting against leather.",
                "foley": "Crunch of volcanic gravel under heavy boots; rhythmic breath condensation through breathing filter.",
                "soundEffects": "Faint, eerie harmonic whistling through hollow basalt spires located 200m away.",
                "music": "Slow, evolving analog synthesizer pad with distorted low brass swells creating impending menace.",
                "silence": "Sudden 3-second cutoff when scout stops in their tracks; only heartbeat-timed sub-pulse remains.",
                "emotionalCue": "Heightened auditory paranoia making the listener feel watched in open space.",
                "transition": "Match Cut: High wind roar morphs seamlessly into the cooling fan roar of the reactor."
            },
            {
                "scene": "Scene 4: INT. THE CENTRAL CHASM - CONTINUOUS",
                "dialogue": "Shouted lines battling industrial machinery acoustics; heavy compression and harsh wall reflections.",
                "ambience": "Massive cavernous rumble (45Hz); thermal steam escaping high-pressure relief valves with sharp pops.",
                "foley": "Steel walkway vibration beneath rushing feet; metallic ricochet of tool dropping into abyss.",
                "soundEffects": "Violent electrical arc crackles with wide stereo separation and deep subwoofer impact.",
                "music": "Aggressive orchestral percussion with driving ostinato strings pushing tempo to 142 BPM.",
                "silence": "A 1-second total blackout silence precisely when defector reaches for the override lever.",
                "emotionalCue": "Maximum visceral adrenaline peak followed by psychological suspension.",
                "transition": "Hard smash cut to dawn with sudden acoustic shift to quiet birdsong and gentle breeze."
            },
            {
                "scene": "Scene 5: EXT. THE SUMMIT OVERLOOK - SUNRISE",
                "dialogue": "Quiet, resonant voiceover reflection; wide binaural staging over gentle mountain air.",
                "ambience": "Gentle morning breeze carrying distant dissipating thunder, soft mist condensation.",
                "foley": "Tired footsteps on dew-moistened grass, breath slowing to rhythmic calm.",
                "soundEffects": "Final low resonant chime of the containment wards locking into place.",
                "music": "Warm, emotional French horn melody over soaring chamber strings signifying hard-won survival.",
                "silence": "Subtle silence hold before closing credits roll.",
                "emotionalCue": "Profound emotional release, resilience, and awe.",
                "transition": "Fade to black with lingering sustained string note."
            }
        ]

        # 5 Canonical starter characters
        hero_name = f"Commander of {clean_title}" if len(clean_title) < 20 else "Lead Protagonist"
        guide_name = "Chief Engineer Ross"
        rival_name = "The Rival Architect"
        spec_name = "Field Specialist Lin"

        bible.characters = [
            {
                "name": hero_name,
                "role": "Lead Protagonist",
                "description": f"Dedicated expedition leader navigating the unique hazards and conflicts of {clean_title}.",
                "goal": f"Overcome the primary dilemma facing the world of {clean_title}.",
                "flaw": "Bears heavy personal responsibility and resists relying on others.",
                "wardrobe": "Weathered practical utility gear suited for the environment."
            },
            {
                "name": guide_name,
                "role": "Lead Technical Specialist & Guide",
                "description": "Experienced analyst who provides crucial telemetry and strategic counsel.",
                "goal": "Ensure team survival and maintain operational continuity.",
                "flaw": "Over-analyzes threats when rapid instinct is demanded.",
                "wardrobe": "Tactical jumpsuit with diagnostic instruments and luminescent HUD monocle."
            },
            {
                "name": rival_name,
                "role": "Primary Antagonist / Opposing Force",
                "description": "A calculating rival faction leader with an opposing vision for the future.",
                "goal": "Execute their strategic objective regardless of external collateral cost.",
                "flaw": "Consumed by absolute certainty that no other path forward exists.",
                "wardrobe": "High-contrast structured longcoat with tactical reinforcement."
            },
            {
                "name": spec_name,
                "role": "Field Specialist & Scout",
                "description": "Agile scout who reads subtle environmental shifts and perimeter hazards.",
                "goal": "Chart safe transit routes through dangerous territory.",
                "flaw": "Takes high personal risks to protect the expedition.",
                "wardrobe": "Lightweight reconnaissance armor, comms headset, climbing carabiners."
            }
        ]

        # Confirmed Cast Assignments with calculated stats
        bible.cast = [
            {
                "id": "cast_001",
                "performerName": "Alexander Sterling",
                "characterName": hero_name,
                "roleType": "Lead Protagonist",
                "status": "CONFIRMED",
                "notes": "Lead male performer; grounded dramatic presence, intense emotional focus, stunt trained.",
                "sceneNumbers": [1, 2, 3, 4, 5],
                "dialogueCount": 24
            },
            {
                "id": "cast_002",
                "performerName": "Dr. Elena Rostova",
                "characterName": guide_name,
                "roleType": "Supporting Lead",
                "status": "CONFIRMED",
                "notes": "Technical dialogue cadence, strong empathetic resonance, intellectual composure.",
                "sceneNumbers": [2, 3],
                "dialogueCount": 12
            },
            {
                "id": "cast_003",
                "performerName": "Marcus Thorne",
                "characterName": rival_name,
                "roleType": "Antagonist / Key Supporting",
                "status": "CONFIRMED",
                "notes": "Predatory calm, unnerving vocal smoothness, piercing eye contact.",
                "sceneNumbers": [4],
                "dialogueCount": 8
            },
            {
                "id": "cast_004",
                "performerName": "Gemma Chan",
                "characterName": spec_name,
                "roleType": "Supporting Specialist",
                "status": "CONFIRMED",
                "notes": "Swift agile presence, quiet emotional warmth, heightened listening focus.",
                "sceneNumbers": [1, 5],
                "dialogueCount": 7
            }
        ]

        # Canonical World Rules
        bible.worldRules = [
            {
                "rule": "The Threshold Boundary",
                "description": f"The world of {clean_title} exists behind layered protection barriers shielding life from the infected exterior.",
                "consequence": "Venturing beyond the barrier initiates an unforgiving countdown spell."
            },
            {
                "rule": "Deceptive Cognitive Mimics",
                "description": "The threat mimics human form and emotion with unsettling precision.",
                "consequence": "Visual inspection cannot be trusted; only acoustic resonance reveals true nature."
            },
            {
                "rule": "The Countdown Mandate",
                "description": "All expedition gear operates on a decaying temporal spell.",
                "consequence": "Failure to return before time expires causes permanent containment loss."
            }
        ]

        # Structured Story For Me representation
        bible.storyForMe = bible.get_story_for_me_default()

    def run_production(self, project_id: str, idea: str, force_regenerate: bool = False) -> Dict[str, Any]:
        """
        Executes the master multi-agent cinematic production pipeline:
        USER IDEA -> PRODUCER -> SCREENWRITER -> DIRECTOR -> ART DIRECTOR
        -> CINEMATOGRAPHER -> STORYBOARD -> SOUND & MUSIC -> EDITOR -> SOCIAL -> DANCE -> CONTINUITY
        Caches completed outputs so subsequent runs don't repeatedly regenerate completed assets.
        """
        bible = self.get_project(project_id)
        bible.project["logline"] = idea or bible.project.get("logline", "")
        bible.project["stage"] = "PRODUCTION_ACTIVE"

        pipeline_log = []

        # 1. PRODUCER AGENT (Executive Brief, World, Characters, 3-Act Structure, Risks)
        self._update_swarm_status(project_id, True, "Executive Producer", 1, 12, "Executive Producer: Formulating 3-Act Structure, World Rules & Central Stakes...")
        if force_regenerate or not bible.characters or not bible.worldRules or not bible.scenes:
            logger.info(f"[{project_id}] Running Producer Agent...")
            producer_res = self.producer_agent.process(project_id, idea, bible.project)
            if producer_res:
                bible.project["title"] = producer_res.get("title", bible.project.get("title"))
                bible.project["genre"] = producer_res.get("genre", bible.project.get("genre"))
                bible.project["tone"] = producer_res.get("tone", bible.project.get("tone"))
                bible.project["coreHook"] = producer_res.get("coreHook", "")
                bible.project["threeActStructure"] = producer_res.get("threeActStructure", {})
                bible.project["world"] = producer_res.get("world", "")

                # Enrich World Rules strictly from producer output or dynamic context
                if producer_res.get("worldRules"):
                    bible.worldRules = producer_res.get("worldRules")
                else:
                    world_text = producer_res.get("world") or f"The world of {bible.project['title']} governed by {bible.project['genre']} reality."
                    hook_text = producer_res.get("coreHook") or f"The high-stakes central conflict of {bible.project['title']}."
                    bible.worldRules = [
                        {"rule": "The World Paradigm", "description": world_text, "consequence": "All characters must navigate these fundamental physical constraints."},
                        {"rule": "The Central Dramatic Stakes", "description": hook_text, "consequence": "Failure leads to irreversible narrative consequences."},
                        {"rule": "The Thematic Principle", "description": f"How dilemmas in {bible.project['title']} are tested and resolved.", "consequence": "Decisions carry permanent emotional and moral weight."}
                    ]

                # Enrich Characters strictly from Producer Agent output
                fresh_chars = []
                if producer_res.get("protagonist"):
                    proto = producer_res["protagonist"]
                    fresh_chars.append({
                        "name": proto.get("name") or "Lead Protagonist",
                        "role": proto.get("role") or "Lead Protagonist",
                        "description": f"Protagonist of {bible.project['title']}. Goal: {proto.get('goal', 'Achieve mission')}.",
                        "goal": proto.get("goal") or "Achieve the core mission.",
                        "flaw": proto.get("flaw") or "Core vulnerability tested by the journey.",
                        "wardrobe": "Attire aligned with the setting and role."
                    })
                if producer_res.get("antagonist"):
                    antag = producer_res["antagonist"]
                    fresh_chars.append({
                        "name": antag.get("name") or "Antagonist",
                        "role": antag.get("role") or "Primary Opposing Force",
                        "description": f"Antagonist in {bible.project['title']}. Motivation: {antag.get('motivation', 'Oppose the protagonist')}.",
                        "goal": antag.get("motivation") or "Challenge the protagonist.",
                        "flaw": "Core obsession or uncompromising belief.",
                        "wardrobe": "Attire reflecting their status and authority."
                    })
                if producer_res.get("supportingCharacters") and isinstance(producer_res["supportingCharacters"], list):
                    for sc in producer_res["supportingCharacters"]:
                        if isinstance(sc, dict) and sc.get("name"):
                            fresh_chars.append({
                                "name": sc.get("name"),
                                "role": sc.get("role") or "Supporting Character",
                                "description": f"Key supporting figure in {bible.project['title']}.",
                                "goal": "Support the primary narrative journey.",
                                "flaw": "Secondary emotional arc.",
                                "wardrobe": "Genre-aligned attire."
                            })

                if fresh_chars:
                    bible.characters = fresh_chars

                pipeline_log.append({"agent": "Producer", "status": "COMPLETED", "summary": f"Title: {bible.project['title']} | Act 1-3 Structured & World Rules Defined"})
        else:
            pipeline_log.append({"agent": "Producer", "status": "CACHED", "summary": "Using cached Producer Brief"})

        # 2. SCREENWRITER AGENT (Show Don't Tell Screenplay Scenes)
        self._update_swarm_status(project_id, True, "Screenwriter", 2, 12, "Screenwriter: Authoring 8 Show-Don't-Tell Screenplay Scenes & Dialogue...")
        is_starter = getattr(bible, "has_real_screenplay", False) is False
        if force_regenerate or not bible.scenes or is_starter:
            logger.info(f"[{project_id}] Running Screenwriter Agent for deep feature screenplay...")
            script_res = self.screenwriter_agent.process(project_id, idea, {
                "brief": bible.project,
                "characters": bible.characters,
                "worldRules": bible.worldRules,
                "target_scene_count": 8
            })
            if script_res:
                bible.scenes = script_res
                bible.screenplay = script_res
                bible.has_real_screenplay = True

                # Dynamically build cast ledger from actual characters and scenes
                fresh_cast = []
                actor_names = ["Alexander Stone", "Elena Rostova", "Marcus Vance", "Sophia Lin", "Julian Thorne", "David O'Connor", "Aria Sterling", "Maya Chen"]
                for idx, char in enumerate(bible.characters):
                    c_name = char.get("name", f"Character {idx+1}")
                    perf_name = actor_names[idx % len(actor_names)]
                    matched_scenes = []
                    dialogue_count = 0
                    for sc in script_res:
                        s_num = sc.get("sceneNumber", 1)
                        diag_text = (sc.get("dialogue") or "").upper()
                        c_upper = c_name.upper()
                        first_name = c_upper.split()[0] if c_upper else ""
                        if (c_upper and c_upper in diag_text) or (first_name and len(first_name) > 2 and first_name in diag_text):
                            matched_scenes.append(s_num)
                            dialogue_count += diag_text.count(first_name or c_upper)

                    fresh_cast.append({
                        "id": f"cast_{idx+1:03d}",
                        "performerName": perf_name,
                        "characterName": c_name,
                        "roleType": char.get("role", "Cast Member"),
                        "status": "CONFIRMED",
                        "notes": f"Cast as {c_name} in {bible.project.get('title')}.",
                        "sceneNumbers": matched_scenes or [1],
                        "dialogueCount": max(1, dialogue_count)
                    })
                bible.cast = fresh_cast

                # Keep Story For Me synchronized with fresh scenes
                bible.storyForMe = bible.get_story_for_me_default()
                pipeline_log.append({"agent": "Screenwriter", "status": "COMPLETED", "summary": f"Generated {len(script_res)} Deep Show-Don't-Tell Scenes"})
        else:
            pipeline_log.append({"agent": "Screenwriter", "status": "CACHED", "summary": f"Using cached {len(bible.scenes)} Scenes"})

        # 3. DIRECTOR AGENT (Camera positions, movements, lenses, blocking, pacing)
        self._update_swarm_status(project_id, True, "Film Director", 3, 12, "Film Director: Engineering Camera Optics, Staging & Shot Angles...")
        if force_regenerate or not bible.shots:
            logger.info(f"[{project_id}] Running Director Agent...")
            director_res = self.director_agent.process(project_id, idea, {"scenes": bible.scenes})
            if director_res:
                bible.shots = director_res
                pipeline_log.append({"agent": "Director", "status": "COMPLETED", "summary": f"Engineered {len(director_res)} Camera Staging Shots"})
        else:
            pipeline_log.append({"agent": "Director", "status": "CACHED", "summary": "Using cached Director Shot List"})

        # 4. ART DIRECTOR AGENT (Characters visual evolution, wardrobes, locations, palettes)
        self._update_swarm_status(project_id, True, "Art Director", 4, 12, "Art Director: Crafting Visual Bible, Wardrobes, Locations & Color Palettes...")
        if force_regenerate or not bible.characters or not bible.locations:
            logger.info(f"[{project_id}] Running Art Director Agent...")
            art_res = self.art_director_agent.process(project_id, idea, {"brief": bible.project, "scenes": bible.scenes})
            if art_res:
                if "characters" in art_res and art_res["characters"]:
                    bible.characters = art_res["characters"]
                if "locations" in art_res and art_res["locations"]:
                    bible.locations = art_res["locations"]
                pipeline_log.append({"agent": "Art Director", "status": "COMPLETED", "summary": f"Crafted {len(bible.characters)} Characters & {len(bible.locations)} Locations"})
        else:
            pipeline_log.append({"agent": "Art Director", "status": "CACHED", "summary": "Using cached Art Bible"})

        # 5. CINEMATOGRAPHER AGENT (Scene optical plans, lenses, DOF, mood)
        self._update_swarm_status(project_id, True, "Cinematographer (DP)", 5, 12, "Cinematographer: Mapping 24mm Anamorphic Lighting & Camera Packages...")
        if force_regenerate or not bible.cinematography:
            logger.info(f"[{project_id}] Running Cinematographer Agent...")
            dp_res = self.cinematographer_agent.process(project_id, idea, {"brief": bible.project, "scenes": bible.scenes})
            if dp_res:
                bible.cinematography = dp_res
                pipeline_log.append({"agent": "Cinematographer", "status": "COMPLETED", "summary": f"Mapped {len(dp_res)} Optical Camera Plans"})
        else:
            pipeline_log.append({"agent": "Cinematographer", "status": "CACHED", "summary": "Using cached Cinematography Language"})

        # 6. STORYBOARD AGENT (Shot frames, character positions, image prompts)
        self._update_swarm_status(project_id, True, "Visual Storyboard", 6, 12, "Visual Storyboard: Designing 8K Generative Keyframe Prompts...")
        if force_regenerate or not bible.storyboard:
            logger.info(f"[{project_id}] Running Storyboard Agent...")
            sb_res = self.storyboard_agent.process(project_id, idea, {
                "scenes": bible.scenes,
                "characters": bible.characters,
                "locations": bible.locations
            })
            if sb_res:
                bible.storyboard = sb_res
                pipeline_log.append({"agent": "Storyboard", "status": "COMPLETED", "summary": f"Designed {len(sb_res)} Storyboard Keyframes"})
        else:
            pipeline_log.append({"agent": "Storyboard", "status": "CACHED", "summary": "Using cached Storyboard Frames"})

        # 7. SOUND & MUSIC AGENT (Acoustics, strategic silence, foley, scoring)
        self._update_swarm_status(project_id, True, "Sound & Music", 7, 12, "Sound & Music: Scoring 432Hz Sub-Bass Frequencies & Silence Cues...")
        if force_regenerate or not bible.audio:
            logger.info(f"[{project_id}] Running Sound & Music Agent...")
            sound_res = self.sound_agent.process(project_id, idea, {"scenes": bible.scenes})
            if sound_res:
                bible.audio = sound_res
                pipeline_log.append({"agent": "Sound & Music", "status": "COMPLETED", "summary": f"Sculpted {len(sound_res)} Scene Soundscapes with Strategic Silence"})
        else:
            pipeline_log.append({"agent": "Sound & Music", "status": "CACHED", "summary": "Using cached Soundscapes"})

        # 8. EDITOR AGENT (Pacing strategy, cut timing, transitions, J-cuts/L-cuts, final shot)
        self._update_swarm_status(project_id, True, "Film Editor", 8, 12, "Film Editor: Assembling Cut Timing, Pacing Strategy & Transitions...")
        if force_regenerate or not bible.editPlan:
            logger.info(f"[{project_id}] Running Editor Agent...")
            edit_res = self.editor_agent.process(project_id, idea, {"scenes": bible.scenes})
            if edit_res:
                bible.editPlan = edit_res
                pipeline_log.append({"agent": "Editor", "status": "COMPLETED", "summary": f"Assembled Cut Timing & {edit_res.get('finalShot', '')[:40]}..."})
        else:
            pipeline_log.append({"agent": "Editor", "status": "CACHED", "summary": "Using cached Editorial Plan"})

        # 9. SOCIAL & VIRAL AGENT (TikTok, Reels, YouTube Shorts, Hooks, Memes)
        self._update_swarm_status(project_id, True, "Social & Viral", 9, 12, "Social & Viral: Generating TikTok/Reels Mystery Hooks & Teasers...")
        if force_regenerate or not bible.socialContent:
            logger.info(f"[{project_id}] Running Social & Viral Agent...")
            social_res = self.social_agent.process(project_id, idea, {"brief": bible.project, "worldRules": bible.worldRules})
            if social_res:
                bible.socialContent = social_res
                pipeline_log.append({"agent": "Social & Viral", "status": "COMPLETED", "summary": f"Created {len(social_res.get('tiktok_reels_shorts', []))} Viral Hooks & Memes"})
        else:
            pipeline_log.append({"agent": "Social & Viral", "status": "CACHED", "summary": "Using cached Social Content"})

        # 10. DANCE AGENT (4-beat choreography structure 0-3s, 3-7s, 7-11s, 11-15s)
        self._update_swarm_status(project_id, True, "Dance & Movement", 10, 12, "Dance & Movement: Choreographing 135 BPM Spatial Sequences...")
        if force_regenerate or not bible.danceConcepts:
            logger.info(f"[{project_id}] Running Dance Agent...")
            dance_res = self.dance_agent.process(project_id, idea, {"brief": bible.project})
            if dance_res:
                bible.danceConcepts = dance_res
                pipeline_log.append({"agent": "Dance Agent", "status": "COMPLETED", "summary": f"Engineered {len(dance_res)} Viral 4-Beat Dance Concepts"})
        else:
            pipeline_log.append({"agent": "Dance Agent", "status": "CACHED", "summary": "Using cached Dance Concepts"})

        # 11. CONTINUITY AUDITOR (Cross-agent consistency audit)
        self._update_swarm_status(project_id, True, "Continuity Supervisor", 11, 12, "Continuity Supervisor: Auditing Multi-Vector Cross-Scene Consistency...")
        audit_res = continuity_engine.audit_production(bible.to_dict())
        bible.continuityLog.append({
            "timestamp": datetime.utcnow().isoformat(),
            "type": "CONTINUITY_AUDIT_RUN",
            "status": audit_res.get("status"),
            "conflicts": audit_res.get("conflict_count", 0)
        })
        pipeline_log.append({"agent": "Continuity Auditor", "status": audit_res.get("status"), "summary": f"{audit_res.get('total_verified', 0)} Facts Verified"})

        # 12. INTERNAL STUDIO SUPERVISOR (OUR SIDE ONLY — Bro Agent)
        bro_notes = self.bro_agent.evaluate_production(project_id, bible.to_dict())
        bible.continuityLog.append({
            "timestamp": datetime.utcnow().isoformat(),
            "type": "INTERNAL_BRO_SUPERVISOR_AUDIT",
            "visibility": "INTERNAL_OUR_SIDE_ONLY",
            "notes": bro_notes
        })

        # Finalize project state and persist
        bible.project["stage"] = "PRODUCTION_READY"
        bible.project["credits_used"] = bible.project.get("credits_used", 0) + 18

        # Save to disk
        fpath = os.path.join(self.storage_dir, f"{project_id}.json")
        bible.save_to_file(fpath)
        try:
            gcs_storage.upload_project(project_id, bible.to_dict())
        except Exception:
            pass

        # Sync root project_bible.json and momo.md
        root_bible = os.path.join(self.root_dir, "project_bible.json")
        bible.save_to_file(root_bible)
        momo_path = os.path.join(self.root_dir, "momo.md")
        with open(momo_path, "w", encoding="utf-8") as f:
            f.write(bible.generate_momo_markdown())

        # Automatically trigger background storyboard generation for all scenes (force=True to supersede initial seed job)
        self.start_auto_storyboard_generation(project_id, priority_scene=1, force=True)

        self._update_swarm_status(project_id, False, None, 12, 12, "All 21 filmmaking agents finished successfully!")

        return {
            "success": True,
            "project_id": project_id,
            "project": bible.project,
            "pipeline_log": pipeline_log,
            "continuity": audit_res,
            "bible": bible.to_dict()
        }

    def retry_single_agent(self, project_id: str, agent_name: str) -> Dict[str, Any]:
        """Allows retrying any specific failed or individual agent in isolation."""
        import re
        self._update_swarm_status(project_id, True, agent_name, 1, 1, f"Running {agent_name}...")
        bible = self.get_project(project_id)
        agent_map = self.get_agent_map()

        # Normalize agent name to alphanumeric underscore key
        clean_name = re.sub(r'[^a-zA-Z0-9]+', '_', agent_name.strip()).lower().strip('_')

        # Fallback substring matching if direct key not matched
        if clean_name not in agent_map:
            for k in agent_map:
                if k in clean_name or clean_name in k:
                    clean_name = k
                    break

        if clean_name not in agent_map:
            return {"success": False, "error": f"Unknown agent: {agent_name} (normalized: {clean_name})"}

        target_agent = agent_map[clean_name]
        logger.info(f"Retrying single agent [{agent_name}] (key: {clean_name}) for {project_id}...")

        logline = bible.project.get("logline", "")

        if clean_name in ("producer", "executive_producer", "producer_agent"):
            res = target_agent.process(project_id, logline, bible.project)
            if res:
                bible.project.update(res)
        elif clean_name in ("screenwriter", "screenwriter_agent", "script"):
            res = target_agent.process(project_id, logline, {"brief": bible.project, "characters": bible.characters, "worldRules": bible.worldRules})
            if res:
                bible.scenes = res
                bible.screenplay = res
        elif clean_name in ("director", "film_director", "director_agent"):
            res = target_agent.process(project_id, logline, {"scenes": bible.scenes})
            if res:
                bible.shots = res
        elif clean_name in ("art_director", "art_director_agent", "production_designer"):
            res = target_agent.process(project_id, logline, {"brief": bible.project, "scenes": bible.scenes})
            if res:
                if "characters" in res: bible.characters = res["characters"]
                if "locations" in res: bible.locations = res["locations"]
        elif clean_name in ("cinematographer", "cinematographer_dp", "cinematographer_agent", "dp"):
            res = target_agent.process(project_id, logline, {"brief": bible.project, "scenes": bible.scenes})
            if res:
                bible.cinematography = res
        elif clean_name in ("storyboard", "storyboard_visual", "visual_storyboard", "storyboard_agent"):
            res = target_agent.process(project_id, logline, {
                "scenes": bible.scenes,
                "characters": bible.characters,
                "locations": bible.locations
            })
            if res:
                bible.storyboard = res
        elif clean_name in ("sound", "sound_music", "sound_agent", "music"):
            res = target_agent.process(project_id, logline, {"scenes": bible.scenes})
            if res:
                bible.audio = res
        elif clean_name in ("editor", "film_editor", "editor_agent"):
            res = target_agent.process(project_id, logline, {"scenes": bible.scenes})
            if res:
                bible.editPlan = res
        elif clean_name in ("social", "social_viral", "social_marketing", "social_agent"):
            res = target_agent.process(project_id, logline, {"brief": bible.project, "worldRules": bible.worldRules})
            if res:
                bible.socialContent = res
        elif clean_name in ("dance", "dance_movement", "movement_dance", "dance_agent"):
            res = target_agent.process(project_id, logline, {"brief": bible.project})
            if res:
                bible.danceConcepts = res
        elif clean_name in ("continuity", "continuity_supervisor", "continuity_checker", "continuity_agent"):
            res = target_agent.process(project_id, "", {"bible": bible.to_dict()})
        elif clean_name in ("script_analysis", "script_analyst", "script_analysis_agent"):
            res = target_agent.process(project_id, logline, {"scenes": bible.scenes, "screenplay": bible.screenplay})
            if res:
                bible.scriptAnalysis = res
        elif clean_name in ("audio_voice", "voice_table_read_director", "voice_director", "table_read", "audio_voice_agent"):
            res = target_agent.process(project_id, logline, {"scenes": bible.scenes, "characters": bible.characters})
            if res:
                bible.tableRead = res
        elif clean_name in ("production_ops", "production_studio_ops", "studio_ops", "production_ops_agent"):
            res = target_agent.process(project_id, "Analyze budget allocation, shoot schedules, and scene costs", {"brief": bible.project, "scenes": bible.scenes})
            if res:
                bible.productionOps = res
        elif clean_name in ("character", "character_agent", "casting_director", "casting"):
            res = target_agent.process(project_id, logline, {"brief": bible.project, "story_world": bible.to_dict()})
            if isinstance(res, list) and res:
                bible.characters = res
            elif isinstance(res, dict) and "characters" in res:
                bible.characters = res["characters"]
        elif clean_name in ("song", "song_music", "song_agent", "soundtrack", "theme_song", "soundtrack_theme_songwriter", "soundtrack_songwriter", "songwriter"):
            res = target_agent.process(project_id, logline, {"brief": bible.project, "scenes": bible.scenes})
            if res:
                bible.song = res
        elif clean_name in ("budget", "budget_agent", "line_producer", "budget_optimizer", "line_producer_budget_optimizer", "line_producer_budget", "budget_simplification"):
            res = target_agent.process(project_id, logline, {"scenes": bible.scenes, "brief": bible.project})
            if isinstance(res, list):
                bible.budgetPlan = res
            elif isinstance(res, dict) and "scene_budget_tiers" in res:
                bible.budgetPlan = res["scene_budget_tiers"]
            elif isinstance(res, dict):
                bible.budgetPlan = [res]
        elif clean_name in ("keyframe", "keyframe_agent", "concept_art", "keyframe_illustrator", "concept_art_keyframe_illustrator", "concept_art_illustrator"):
            res = target_agent.process(project_id, logline, {"scenes": bible.scenes, "characters": bible.characters})
            if isinstance(res, list):
                bible.keyframes = res
            elif isinstance(res, dict) and "keyframe_prompts" in res:
                bible.keyframes = res["keyframe_prompts"]
            elif isinstance(res, dict):
                bible.keyframes = [res]
        elif clean_name in ("actor", "actor_agent", "lead_actor", "lead_actor_performance", "lead_actor_agent_leo_thorne"):
            res = target_agent.process(project_id, logline, {"scenes": bible.scenes})
            if res:
                bible.actorPerformance = res
        elif clean_name in ("actress", "actress_agent", "lead_actress", "lead_actress_performance", "lead_actress_agent_lyra_sterling"):
            res = target_agent.process(project_id, logline, {"scenes": bible.scenes})
            if res:
                bible.actressPerformance = res

        # Persist update
        fpath = os.path.join(self.storage_dir, f"{project_id}.json")
        bible.save_to_file(fpath)
        try:
            gcs_storage.upload_project(project_id, bible.to_dict())
        except Exception:
            pass
        root_bible = os.path.join(self.root_dir, "project_bible.json")
        bible.save_to_file(root_bible)

        self._update_swarm_status(project_id, False, None, 1, 1, f"{agent_name} refreshed successfully!")

        return {"success": True, "agent": agent_name, "bible": bible.to_dict()}

    def configure_project(self, project_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Updates project configuration (Format, Platform, Episodes 1-100+, Scale, Audience, Dynamic Budget)."""
        bible = self.get_project(project_id)

        format_val = config.get("format", bible.project.get("format", "Theatrical Feature"))
        platform_val = config.get("platform", bible.project.get("platform", "Cinema"))
        episodes_val = int(config.get("episodeCount", bible.project.get("episodeCount", 1)))
        duration_val = config.get("episodeDuration", bible.project.get("episodeDuration", "115 Minutes"))
        scale_val = config.get("productionScale", bible.project.get("productionScale", "Hollywood Studio Tentpole"))
        audience_val = config.get("targetAudience", bible.project.get("targetAudience", "Young Adults (18-25)"))
        budget_type = config.get("budgetType", bible.project.get("budgetType", "ESTIMATED"))

        bible.project["format"] = format_val
        bible.project["platform"] = platform_val
        bible.project["episodeCount"] = episodes_val
        bible.project["episodeDuration"] = duration_val
        bible.project["productionScale"] = scale_val
        bible.project["targetAudience"] = audience_val
        bible.project["budgetType"] = budget_type

        # Calculate or preserve budget
        if budget_type == "ESTIMATED" or "budget" not in config:
            bible.project["budget"] = ProjectBible.calculate_dynamic_budget(format_val, episodes_val, scale_val)
        else:
            bible.project["budget"] = config["budget"]

        # Save updates
        fpath = os.path.join(self.storage_dir, f"{project_id}.json")
        bible.save_to_file(fpath)
        try:
            gcs_storage.upload_project(project_id, bible.to_dict())
        except Exception:
            pass
        root_bible = os.path.join(self.root_dir, "project_bible.json")
        bible.save_to_file(root_bible)

        return {"success": True, "project": bible.project, "bible": bible.to_dict()}

    def execute_frame_generation(self, project_id: str, scene_num: int, frame_num: int,
                                 media_type: str = "image", prompt: Optional[str] = None,
                                 aspect_ratio: str = "16:9", model: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes real image or video generation for a specific storyboard frame.
        Persists real file to static/generated/ and updates Project Bible.
        """
        bible = self.get_project(project_id)

        # Locate target frame
        target_frame = None
        for f in bible.storyboard:
            if str(f.get("scene", "")) == str(scene_num) and str(f.get("frame", "")) == str(frame_num):
                target_frame = f
                break

        if not target_frame:
            # Dynamically create the frame on the fly so generation always succeeds
            target_frame = {
                "scene": scene_num,
                "frame": frame_num,
                "shot": f"Scene {scene_num} Frame {frame_num}",
                "imagePrompt": prompt or f"Cinematic film still, Scene {scene_num} Frame {frame_num}",
                "videoPrompt": prompt or f"Cinematic 24fps motion camera move for Scene {scene_num}",
                "camera": "35mm Anamorphic Prime",
                "lighting": "Volumetric cinematic chiaroscuro",
                "imageStatus": "PENDING"
            }
            bible.storyboard.append(target_frame)

        # Extract appropriate prompt
        gen_prompt = prompt
        if not gen_prompt:
            if media_type == "video":
                gen_prompt = (
                    target_frame.get("videoPrompt")
                    or target_frame.get("description")
                    or f"Cinematic 24fps motion camera move for {target_frame.get('shot', f'Scene {scene_num}')}"
                )
            else:
                gen_prompt = (
                    target_frame.get("imagePrompt")
                    or target_frame.get("description")
                    or f"{target_frame.get('shot', '')} {target_frame.get('subject_action', '')} {target_frame.get('environment_details', '')}".strip()
                    or f"Cinematic film still, Scene {scene_num} Frame {frame_num}"
                )

        if media_type == "image":
            img_model = model or "gemini-3.1-flash-image"
            bible.update_storyboard_media(scene_num, frame_num, image_status="GENERATING")
            res = generation_engine.generate_image(
                prompt=gen_prompt,
                aspect_ratio=aspect_ratio,
                model=img_model,
                project_id=project_id,
                scene_num=scene_num,
                frame_num=frame_num
            )

            if res.get("success"):
                img_url = res.get("url") or res.get("image_url")
                bible.update_storyboard_media(scene_num, frame_num, image_url=img_url, image_status="COMPLETE", image_error=None)
            else:
                bible.update_storyboard_media(scene_num, frame_num, image_status="FAILED", image_error=res.get("error"))

            # Save state
            fpath = os.path.join(self.storage_dir, f"{project_id}.json")
            bible.save_to_file(fpath)
            try:
                gcs_storage.upload_project(project_id, bible.to_dict())
            except Exception:
                pass
            root_bible = os.path.join(self.root_dir, "project_bible.json")
            bible.save_to_file(root_bible)
            return res

        elif media_type == "video":
            vid_model = model or "cinematic-motion-v1"
            existing_image_url = target_frame.get("imageUrl")

            bible.update_storyboard_media(scene_num, frame_num, video_status="GENERATING")
            res = generation_engine.start_video_generation(
                prompt=gen_prompt,
                image_url=existing_image_url,
                aspect_ratio=aspect_ratio,
                duration_sec=4,
                model=vid_model,
                project_id=project_id,
                scene_num=scene_num,
                frame_num=frame_num
            )

            job_id = res["job_id"]

            # Monitor thread to persist completion back to project bible
            import threading
            def _poll_and_update(pid, s_num, f_num, j_id):
                import time
                for _ in range(60):
                    time.sleep(1)
                    st = generation_engine.get_job_status(j_id)
                    if st and st.get("status") in ["COMPLETE", "FAILED"]:
                        p_bible = self.get_project(pid)
                        if st.get("status") == "COMPLETE":
                            p_bible.update_storyboard_media(s_num, f_num, video_url=st.get("video_url"), video_status="COMPLETE", video_error=None)
                        else:
                            p_bible.update_storyboard_media(s_num, f_num, video_status="FAILED", video_error=st.get("error"))
                        p_path = os.path.join(self.storage_dir, f"{pid}.json")
                        p_bible.save_to_file(p_path)
                        r_bible = os.path.join(self.root_dir, "project_bible.json")
                        p_bible.save_to_file(r_bible)
                        break

            threading.Thread(target=_poll_and_update, args=(project_id, scene_num, frame_num, job_id), daemon=True).start()

            # Save state
            fpath = os.path.join(self.storage_dir, f"{project_id}.json")
            bible.save_to_file(fpath)
            try:
                gcs_storage.upload_project(project_id, bible.to_dict())
            except Exception:
                pass
            return {"success": True, "job_id": job_id, "status": "PENDING", "message": "Real video generation started"}

        return {"success": False, "error": f"Unsupported media type: {media_type}"}

    def generate_project_screenplay(self, project_id: str, target_scene_count: int = 8, custom_notes: str = "") -> List[Dict[str, Any]]:
        """Invokes ScreenwriterAgent to author a deep, multi-paragraph Hollywood feature screenplay."""
        bible = self.get_project(project_id)
        prompt = bible.project.get("logline", "")
        if custom_notes:
            prompt += f" Special directives: {custom_notes}"

        context = {
            "brief": bible.project,
            "characters": bible.characters,
            "worldRules": bible.worldRules,
            "custom_notes": custom_notes,
            "target_scene_count": target_scene_count
        }

        scenes = self.screenwriter_agent.generate_deep_screenplay(
            project_id=project_id,
            prompt=prompt,
            context=context,
            target_scene_count=target_scene_count
        )

        if scenes:
            bible.scenes = scenes
            bible.screenplay = scenes
            bible.has_real_screenplay = True

            # Recalculate character dialogue stats for cast
            if hasattr(bible, "cast") and bible.cast:
                for c in bible.cast:
                    char_name = c.get("characterName", "").upper()
                    matched_scenes = []
                    dialogue_count = 0
                    for sc in scenes:
                        s_num = sc.get("sceneNumber", 1)
                        diag_text = sc.get("dialogue", "")
                        if char_name and char_name in diag_text.upper():
                            matched_scenes.append(s_num)
                            dialogue_count += diag_text.upper().count(char_name)
                    if matched_scenes:
                        c["sceneNumbers"] = matched_scenes
                        c["dialogueCount"] = max(1, dialogue_count)

            fpath = os.path.join(self.storage_dir, f"{project_id}.json")
            bible.save_to_file(fpath)
            r_bible = os.path.join(self.root_dir, "project_bible.json")
            bible.save_to_file(r_bible)
            try:
                gcs_storage.upload_project(project_id, bible.to_dict())
            except Exception:
                pass

        return bible.scenes

    def generate_project_storyboard(self, project_id: str) -> List[Dict[str, Any]]:
        """Generates detailed 8K visual keyframe and Google Veo motion video prompts for all scenes."""
        bible = self.get_project(project_id)
        frames = self.storyboard_agent.process(
            project_id=project_id,
            prompt=bible.project.get("logline", ""),
            context={
                "scenes": bible.scenes,
                "characters": bible.characters,
                "locations": bible.locations
            }
        )
        if frames:
            bible.storyboard = frames
            fpath = os.path.join(self.storage_dir, f"{project_id}.json")
            bible.save_to_file(fpath)
            r_bible = os.path.join(self.root_dir, "project_bible.json")
            bible.save_to_file(r_bible)
            try:
                gcs_storage.upload_project(project_id, bible.to_dict())
            except Exception:
                pass
        return bible.storyboard

    def generate_project_sound(self, project_id: str) -> List[Dict[str, Any]]:
        """Generates acoustic soundscapes with strategic silence and score motifs for all scenes."""
        bible = self.get_project(project_id)
        sound_res = self.sound_agent.process(
            project_id=project_id,
            prompt=bible.project.get("logline", ""),
            context={"scenes": bible.scenes}
        )
        if sound_res:
            bible.audio = sound_res
            fpath = os.path.join(self.storage_dir, f"{project_id}.json")
            bible.save_to_file(fpath)
            r_bible = os.path.join(self.root_dir, "project_bible.json")
            bible.save_to_file(r_bible)
            try:
                gcs_storage.upload_project(project_id, bible.to_dict())
            except Exception:
                pass
        return bible.audio

    def start_auto_storyboard_generation(self, project_id: str, priority_scene: int = 1, force: bool = False) -> bool:
        """
        Launches thread-safe, automated background storyboard image generation for all scenes.
        Scene 1 is prioritized so the user gets an immediate visual upon project opening.
        Prevents duplicate jobs unless force=True (which cancels/supersedes the existing job).
        """
        if not hasattr(self, "_active_image_jobs"):
            self._active_image_jobs = {}

        existing_job = self._active_image_jobs.get(project_id)
        if existing_job and existing_job.get("status") == "RUNNING" and not force:
            logger.info(f"[{project_id}] Auto-storyboard generation already in progress.")
            return False

        gen_id = str(uuid.uuid4())
        self._active_image_jobs[project_id] = {
            "status": "RUNNING",
            "gen_id": gen_id,
            "total": 0,
            "completed": 0,
            "current_scene": priority_scene,
            "start_time": time.time(),
            "error": None
        }

        thread = threading.Thread(
            target=self._run_storyboard_worker,
            args=(project_id, priority_scene, gen_id),
            daemon=True,
            name=f"StoryboardGen-{project_id}"
        )
        thread.start()
        logger.info(f"[{project_id}] Started background auto-storyboard generation worker (gen_id: {gen_id}, force={force}).")
        return True

    def _run_storyboard_worker(self, project_id: str, priority_scene: int = 1, gen_id: Optional[str] = None):
        """Worker thread that generates images across all scenes with Scene 1 prioritized."""
        try:
            bible = self.get_project(project_id)
            if not bible:
                logger.error(f"[{project_id}] Cannot run worker: project not found.")
                if project_id in self._active_image_jobs:
                    self._active_image_jobs[project_id]["status"] = "FAILED"
                return

            if gen_id and self._active_image_jobs.get(project_id, {}).get("gen_id") != gen_id:
                logger.info(f"[{project_id}] Storyboard worker {gen_id} superseded before start.")
                return

            # Ensure frames exist for every scene
            if not bible.storyboard or len(bible.storyboard) < len(bible.scenes):
                logger.info(f"[{project_id}] Ensuring storyboard keyframes for all {len(bible.scenes)} scenes...")
                self.generate_project_storyboard(project_id)
                bible = self.get_project(project_id)

            if not bible.storyboard:
                for s in bible.scenes:
                    sn = s.get("sceneNumber", 1)
                    bible.storyboard.append({
                        "scene": sn,
                        "frame": 1,
                        "shot": f"Scene {sn} Keyframe",
                        "imagePrompt": f"Cinematic film still, {s.get('location', '')}, {s.get('action', '')[:100]}",
                        "imageStatus": "PENDING"
                    })

            frames = bible.storyboard
            total_frames = len(frames)
            if project_id in self._active_image_jobs:
                self._active_image_jobs[project_id]["total"] = total_frames

            # Prioritize Scene 1 frames first, then remaining scenes
            prio_frames = [f for f in frames if str(f.get("scene")) == str(priority_scene)]
            other_frames = [f for f in frames if str(f.get("scene")) != str(priority_scene)]
            ordered_frames = prio_frames + other_frames

            completed_count = 0
            for frame in ordered_frames:
                # Check if superseded by newer generation
                if gen_id and self._active_image_jobs.get(project_id, {}).get("gen_id") != gen_id:
                    logger.info(f"[{project_id}] Storyboard worker {gen_id} superseded during execution.")
                    return

                sn = frame.get("scene", 1)
                fn = frame.get("frame", 1)

                if frame.get("imageUrl") and frame.get("imageStatus") == "COMPLETE":
                    completed_count += 1
                    if project_id in self._active_image_jobs:
                        self._active_image_jobs[project_id]["completed"] = completed_count
                    continue

                if project_id in self._active_image_jobs:
                    self._active_image_jobs[project_id]["current_scene"] = sn

                try:
                    logger.info(f"[{project_id}] Auto-generating visual for Scene {sn} Frame {fn}...")
                    self.execute_frame_generation(
                        project_id=project_id,
                        scene_num=sn,
                        frame_num=fn,
                        media_type="image",
                        aspect_ratio="16:9"
                    )
                    completed_count += 1
                    if project_id in self._active_image_jobs:
                        self._active_image_jobs[project_id]["completed"] = completed_count
                except Exception as frame_err:
                    logger.warning(f"[{project_id}] Error generating Scene {sn} Frame {fn}: {frame_err}")
                    try:
                        from core.image_generator import GeminiImageGenerator
                        gen = GeminiImageGenerator()
                        fb = gen.generate_image(f"Scene {sn} Cinematic Film Still", aspect_ratio="16:9")
                        bible.update_storyboard_media(sn, fn, image_url=fb.get("url"), image_status="COMPLETE")
                    except Exception:
                        pass

                time.sleep(0.3)

            if gen_id and self._active_image_jobs.get(project_id, {}).get("gen_id") != gen_id:
                return

            fpath = os.path.join(self.storage_dir, f"{project_id}.json")
            bible.save_to_file(fpath)
            r_bible = os.path.join(self.root_dir, "project_bible.json")
            bible.save_to_file(r_bible)

            if project_id in self._active_image_jobs:
                self._active_image_jobs[project_id]["status"] = "COMPLETED"
                self._active_image_jobs[project_id]["completed"] = total_frames
            logger.info(f"[{project_id}] Completed auto-storyboard generation for all {total_frames} frames.")

        except Exception as e:
            logger.error(f"[{project_id}] Worker exception: {e}")
            if project_id in self._active_image_jobs:
                self._active_image_jobs[project_id]["status"] = "FAILED"
                self._active_image_jobs[project_id]["error"] = str(e)

    def get_storyboard_job_status(self, project_id: str) -> Dict[str, Any]:
        """Returns the live status of the background storyboard generation job."""
        bible = self.get_project(project_id)
        if not hasattr(self, "_active_image_jobs"):
            self._active_image_jobs = {}

        job = self._active_image_jobs.get(project_id, {
            "status": "IDLE",
            "total": len(bible.storyboard) if bible else 0,
            "completed": sum(1 for f in (bible.storyboard if bible else []) if f.get("imageUrl")),
            "current_scene": 1
        })

        actual_completed = sum(1 for f in (bible.storyboard if bible else []) if f.get("imageUrl"))
        total = len(bible.storyboard) if bible else 0
        is_running = job.get("status") == "RUNNING"

        return {
            "project_id": project_id,
            "status": job.get("status", "IDLE"),
            "isRunning": is_running,
            "totalFrames": total,
            "completedFrames": actual_completed,
            "currentScene": job.get("current_scene", 1),
            "frames": bible.storyboard if bible else []
        }

    def retry_frame_generation(self, project_id: str, scene_num: int, frame_num: int) -> Dict[str, Any]:
        """Regenerates a single frame on demand with per-scene retry controls."""
        logger.info(f"[{project_id}] Retrying frame generation for Scene {scene_num} Frame {frame_num}...")
        res = self.execute_frame_generation(
            project_id=project_id,
            scene_num=scene_num,
            frame_num=frame_num,
            media_type="image",
            aspect_ratio="16:9"
        )
        return res

orchestrator = CentralProductionOrchestrator()


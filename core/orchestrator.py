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
    SoundAgent,
    EditorAgent,
    SocialAgent,
    DanceAgent,
    ContinuityCheckerAgent
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

        # Initialize specialized agent swarm
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

        # In-memory project cache
        self.projects: Dict[str, ProjectBible] = {}
        self.current_project_id = "proj_last_spell"
        self._init_projects()

    def _init_projects(self):
        """Loads existing projects from GCS and disk."""
        # 1. Sync with Google Cloud Storage
        try:
            gcs_storage.download_all_projects(self.storage_dir)
        except Exception:
            pass

        # 2. Load all saved projects from disk
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

    def get_agent_map(self) -> Dict[str, Any]:
        return {
            "producer": self.producer_agent,
            "screenwriter": self.screenwriter_agent,
            "director": self.director_agent,
            "art_director": self.art_director_agent,
            "cinematographer": self.cinematographer_agent,
            "storyboard": self.storyboard_agent,
            "sound": self.sound_agent,
            "editor": self.editor_agent,
            "social": self.social_agent,
            "dance": self.dance_agent,
            "continuity": self.continuity_agent
        }

    def list_projects(self) -> List[Dict[str, Any]]:
        """Returns high-level metadata for all active projects."""
        result = []
        if "undefined" in self.projects:
            del self.projects["undefined"]
        for pid, b in self.projects.items():
            if pid in ("undefined", "null", "None") or not pid:
                continue
            result.append({
                "id": b.project.get("id") or pid,
                "title": b.project.get("title", "Untitled"),
                "genre": b.project.get("genre"),
                "logline": b.project.get("logline", "")[:120] + "...",
                "stage": b.project.get("stage", "IN_PRODUCTION"),
                "updated_at": b.updated_at,
                "scene_count": len(b.scenes),
                "character_count": len(b.characters),
                "is_current": (pid == self.current_project_id)
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
                       target_duration: str = "110 Minutes", language: str = "English") -> ProjectBible:
        """Project Wizard factory method."""
        pid = f"proj_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        bible = ProjectBible(project_id=pid)
        bible.project = {
            "id": pid,
            "title": title or "UNTITLED FILM",
            "logline": logline,
            "genre": genre,
            "tone": tone,
            "visualStyle": visual_style,
            "targetDuration": target_duration,
            "language": language,
            "stage": "CONCEPT",
            "credits_used": 0,
            "credits_total": 250,
            "plan": "CREATOR"
        }
        fpath = os.path.join(self.storage_dir, f"{pid}.json")
        bible.save_to_file(fpath)
        try:
            gcs_storage.upload_project(pid, bible.to_dict())
        except Exception:
            pass
        self.projects[pid] = bible
        self.current_project_id = pid
        return bible

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
        if force_regenerate or not bible.characters or not bible.worldRules:
            logger.info(f"[{project_id}] Running Producer Agent...")
            producer_res = self.producer_agent.process(project_id, idea, bible.project)
            if producer_res:
                bible.project["title"] = producer_res.get("title", bible.project.get("title"))
                bible.project["genre"] = producer_res.get("genre", bible.project.get("genre"))
                bible.project["tone"] = producer_res.get("tone", bible.project.get("tone"))
                bible.project["coreHook"] = producer_res.get("coreHook", "")
                bible.project["threeActStructure"] = producer_res.get("threeActStructure", {})
                pipeline_log.append({"agent": "Producer", "status": "COMPLETED", "summary": f"Title: {bible.project['title']} | Act 1-3 Structured"})
        else:
            pipeline_log.append({"agent": "Producer", "status": "CACHED", "summary": "Using cached Producer Brief"})

        # 2. SCREENWRITER AGENT (Show Don't Tell Screenplay Scenes)
        if force_regenerate or not bible.scenes:
            logger.info(f"[{project_id}] Running Screenwriter Agent...")
            script_res = self.screenwriter_agent.process(project_id, idea, {"brief": bible.project})
            if script_res:
                bible.scenes = script_res
                bible.screenplay = script_res
                pipeline_log.append({"agent": "Screenwriter", "status": "COMPLETED", "summary": f"Generated {len(script_res)} Show-Don't-Tell Scenes"})
        else:
            pipeline_log.append({"agent": "Screenwriter", "status": "CACHED", "summary": f"Using cached {len(bible.scenes)} Scenes"})

        # 3. DIRECTOR AGENT (Camera positions, movements, lenses, blocking, pacing)
        if force_regenerate or not bible.shots:
            logger.info(f"[{project_id}] Running Director Agent...")
            director_res = self.director_agent.process(project_id, idea, {"scenes": bible.scenes})
            if director_res:
                bible.shots = director_res
                pipeline_log.append({"agent": "Director", "status": "COMPLETED", "summary": f"Engineered {len(director_res)} Camera Staging Shots"})
        else:
            pipeline_log.append({"agent": "Director", "status": "CACHED", "summary": "Using cached Director Shot List"})

        # 4. ART DIRECTOR AGENT (Characters visual evolution, wardrobes, locations, palettes)
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
        if force_regenerate or not bible.cinematography:
            logger.info(f"[{project_id}] Running Cinematographer Agent...")
            dp_res = self.cinematographer_agent.process(project_id, idea, {"brief": bible.project, "scenes": bible.scenes})
            if dp_res:
                bible.cinematography = dp_res
                pipeline_log.append({"agent": "Cinematographer", "status": "COMPLETED", "summary": f"Mapped {len(dp_res)} Optical Camera Plans"})
        else:
            pipeline_log.append({"agent": "Cinematographer", "status": "CACHED", "summary": "Using cached Cinematography Language"})

        # 6. STORYBOARD AGENT (Shot frames, character positions, image prompts)
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
        if force_regenerate or not bible.audio:
            logger.info(f"[{project_id}] Running Sound & Music Agent...")
            sound_res = self.sound_agent.process(project_id, idea, {"scenes": bible.scenes})
            if sound_res:
                bible.audio = sound_res
                pipeline_log.append({"agent": "Sound & Music", "status": "COMPLETED", "summary": f"Sculpted {len(sound_res)} Scene Soundscapes with Strategic Silence"})
        else:
            pipeline_log.append({"agent": "Sound & Music", "status": "CACHED", "summary": "Using cached Soundscapes"})

        # 8. EDITOR AGENT (Pacing strategy, cut timing, transitions, J-cuts/L-cuts, final shot)
        if force_regenerate or not bible.editPlan:
            logger.info(f"[{project_id}] Running Editor Agent...")
            edit_res = self.editor_agent.process(project_id, idea, {"scenes": bible.scenes})
            if edit_res:
                bible.editPlan = edit_res
                pipeline_log.append({"agent": "Editor", "status": "COMPLETED", "summary": f"Assembled Cut Timing & {edit_res.get('finalShot', '')[:40]}..."})
        else:
            pipeline_log.append({"agent": "Editor", "status": "CACHED", "summary": "Using cached Editorial Plan"})

        # 9. SOCIAL & VIRAL AGENT (TikTok, Reels, YouTube Shorts, Hooks, Memes)
        if force_regenerate or not bible.socialContent:
            logger.info(f"[{project_id}] Running Social & Viral Agent...")
            social_res = self.social_agent.process(project_id, idea, {"brief": bible.project, "worldRules": bible.worldRules})
            if social_res:
                bible.socialContent = social_res
                pipeline_log.append({"agent": "Social & Viral", "status": "COMPLETED", "summary": f"Created {len(social_res.get('tiktok_reels_shorts', []))} Viral Hooks & Memes"})
        else:
            pipeline_log.append({"agent": "Social & Viral", "status": "CACHED", "summary": "Using cached Social Content"})

        # 10. DANCE AGENT (4-beat choreography structure 0-3s, 3-7s, 7-11s, 11-15s)
        if force_regenerate or not bible.danceConcepts:
            logger.info(f"[{project_id}] Running Dance Agent...")
            dance_res = self.dance_agent.process(project_id, idea, {"brief": bible.project})
            if dance_res:
                bible.danceConcepts = dance_res
                pipeline_log.append({"agent": "Dance Agent", "status": "COMPLETED", "summary": f"Engineered {len(dance_res)} Viral 4-Beat Dance Concepts"})
        else:
            pipeline_log.append({"agent": "Dance Agent", "status": "CACHED", "summary": "Using cached Dance Concepts"})

        # 11. CONTINUITY AUDITOR (Cross-agent consistency audit)
        audit_res = continuity_engine.audit_production(bible.to_dict())
        bible.continuityLog.append({
            "timestamp": datetime.utcnow().isoformat(),
            "type": "CONTINUITY_AUDIT_RUN",
            "status": audit_res.get("status"),
            "conflicts": audit_res.get("conflict_count", 0)
        })
        pipeline_log.append({"agent": "Continuity Auditor", "status": audit_res.get("status"), "summary": f"{audit_res.get('total_verified', 0)} Facts Verified"})

        # Finalize project state and persist
        bible.project["stage"] = "PRODUCTION_READY"
        bible.project["credits_used"] = bible.project.get("credits_used", 0) + 18

        # Save to disk
        fpath = os.path.join(self.storage_dir, f"{project_id}.json")
        bible.save_to_file(fpath)
        try:
            gcs_storage.upload_project(pid, bible.to_dict())
        except Exception:
            pass

        # Sync root project_bible.json and momo.md
        root_bible = os.path.join(self.root_dir, "project_bible.json")
        bible.save_to_file(root_bible)
        momo_path = os.path.join(self.root_dir, "momo.md")
        with open(momo_path, "w", encoding="utf-8") as f:
            f.write(bible.generate_momo_markdown())

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
        bible = self.get_project(project_id)
        agent_map = self.get_agent_map()
        clean_name = agent_name.lower().replace(" ", "_")

        if clean_name not in agent_map:
            return {"success": False, "error": f"Unknown agent: {agent_name}"}

        target_agent = agent_map[clean_name]
        logger.info(f"Retrying single agent [{agent_name}] for {project_id}...")

        if clean_name == "producer":
            res = target_agent.process(project_id, bible.project.get("logline", ""), bible.project)
            bible.project.update(res)
        elif clean_name == "screenwriter":
            res = target_agent.process(project_id, bible.project.get("logline", ""), {"brief": bible.project})
            bible.scenes = res
            bible.screenplay = res
        elif clean_name == "director":
            res = target_agent.process(project_id, bible.project.get("logline", ""), {"scenes": bible.scenes})
            bible.shots = res
        elif clean_name == "art_director":
            res = target_agent.process(project_id, bible.project.get("logline", ""), {"brief": bible.project, "scenes": bible.scenes})
            if "characters" in res: bible.characters = res["characters"]
            if "locations" in res: bible.locations = res["locations"]
        elif clean_name == "cinematographer":
            res = target_agent.process(project_id, bible.project.get("logline", ""), {"brief": bible.project, "scenes": bible.scenes})
            bible.cinematography = res
        elif clean_name == "storyboard":
            res = target_agent.process(project_id, bible.project.get("logline", ""), {
                "scenes": bible.scenes,
                "characters": bible.characters,
                "locations": bible.locations
            })
            bible.storyboard = res
        elif clean_name == "sound":
            res = target_agent.process(project_id, bible.project.get("logline", ""), {"scenes": bible.scenes})
            bible.audio = res
        elif clean_name == "editor":
            res = target_agent.process(project_id, bible.project.get("logline", ""), {"scenes": bible.scenes})
            bible.editPlan = res
        elif clean_name == "social":
            res = target_agent.process(project_id, bible.project.get("logline", ""), {"brief": bible.project, "worldRules": bible.worldRules})
            bible.socialContent = res
        elif clean_name == "dance":
            res = target_agent.process(project_id, bible.project.get("logline", ""), {"brief": bible.project})
            bible.danceConcepts = res
        elif clean_name == "continuity":
            res = target_agent.process(project_id, "", {"bible": bible.to_dict()})

        # Persist update
        fpath = os.path.join(self.storage_dir, f"{project_id}.json")
        bible.save_to_file(fpath)
        try:
            gcs_storage.upload_project(pid, bible.to_dict())
        except Exception:
            pass
        root_bible = os.path.join(self.root_dir, "project_bible.json")
        bible.save_to_file(root_bible)

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
            gcs_storage.upload_project(pid, bible.to_dict())
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
            if f.get("scene") == scene_num and f.get("frame") == frame_num:
                target_frame = f
                break

        if not target_frame:
            return {"success": False, "error": f"Storyboard frame Scene {scene_num} Frame {frame_num} not found"}

        # Extract appropriate prompt
        gen_prompt = prompt
        if not gen_prompt:
            if media_type == "video":
                gen_prompt = target_frame.get("videoPrompt") or target_frame.get("description", "")
            else:
                gen_prompt = target_frame.get("imagePrompt") or target_frame.get("description", "")

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
                bible.update_storyboard_media(scene_num, frame_num, image_url=res["url"], image_status="COMPLETE", image_error=None)
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
            gcs_storage.upload_project(pid, bible.to_dict())
        except Exception:
            pass
            return {"success": True, "job_id": job_id, "status": "PENDING", "message": "Real video generation started"}

        return {"success": False, "error": f"Unsupported media type: {media_type}"}

orchestrator = CentralProductionOrchestrator()


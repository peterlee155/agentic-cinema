import os
import json
import uuid
import time
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

logger = logging.getLogger("ClickHouseClient")

class ClickHouseStudioDB:
    def __init__(self, host: str = "localhost", port: int = 8123, username: str = "default", password: str = "", database: str = "cinema"):
        self.host = os.getenv("CLICKHOUSE_HOST", host)
        self.port = int(os.getenv("CLICKHOUSE_PORT", port))
        self.username = os.getenv("CLICKHOUSE_USER", username)
        self.password = os.getenv("CLICKHOUSE_PASSWORD", password)
        self.database = os.getenv("CLICKHOUSE_DB", database)
        self.secure = os.getenv("CLICKHOUSE_SECURE", "false").lower() == "true" or self.port == 8443 or "clickhouse.cloud" in self.host
        self.client = None
        self.is_connected = False
        self.last_error = None
        
        # Local fallback in-memory/JSON buffer for offline resilience
        self.local_telemetry: List[Dict[str, Any]] = []
        self.local_characters: List[Dict[str, Any]] = []
        self.local_scenes: List[Dict[str, Any]] = []
        self.local_simulations: List[Dict[str, Any]] = []
        
        self.connect()

    def connect(self):
        try:
            import clickhouse_connect
            connect_kwargs = {
                "host": self.host,
                "port": self.port,
                "username": self.username,
                "password": self.password,
            }
            if self.secure or self.port == 8443 or "clickhouse.cloud" in self.host:
                connect_kwargs["secure"] = True
                self.secure = True

            self.client = clickhouse_connect.get_client(**connect_kwargs)
            # Create database if not exists
            self.client.command(f"CREATE DATABASE IF NOT EXISTS {self.database}")
            self.client.database = self.database
            self.init_schemas()
            self.is_connected = True
            self.last_error = None
            logger.info(f"Connected to ClickHouse at {self.host}:{self.port}/{self.database} (secure={self.secure})")
            # Sync buffered records to ClickHouse Cloud
            self._sync_buffered_to_remote()
        except Exception as e:
            self.is_connected = False
            self.last_error = str(e)
            logger.warning(f"ClickHouse direct connection unavailable ({e}). Using telemetry buffer fallback.")
        self.seed_demo_telemetry()

    def update_credentials(self, host: str, port: int = 8443, username: str = "default", password: str = "", database: str = "cinema", secure: Optional[bool] = None) -> bool:
        self.host = host
        self.port = int(port)
        self.username = username
        self.password = password
        self.database = database
        if secure is not None:
            self.secure = secure
        else:
            self.secure = (self.port == 8443 or "clickhouse.cloud" in self.host)
        self.connect()
        return self.is_connected

    def _sync_buffered_to_remote(self):
        """Synchronizes buffered telemetry to remote ClickHouse Cloud upon successful connection."""
        if not self.client or not self.is_connected:
            return
        try:
            if self.local_telemetry:
                rows = []
                for e in self.local_telemetry:
                    rows.append([
                        e["event_id"], e["project_id"],
                        datetime.fromisoformat(e["timestamp"]) if isinstance(e["timestamp"], str) else e["timestamp"],
                        e["agent_name"], e["pipeline_stage"], e["prompt_tokens"],
                        e["completion_tokens"], e["latency_ms"], e["status"], e["summary"]
                    ])
                self.client.insert(f"{self.database}.production_telemetry", rows)
                logger.info(f"Synced {len(rows)} telemetry rows to ClickHouse Cloud.")
        except Exception as e:
            logger.warning(f"Failed to sync buffered telemetry: {e}")

    def init_schemas(self):
        if not self.client:
            return
        
        # 1. Production Telemetry
        self.client.command(f"""
        CREATE TABLE IF NOT EXISTS {self.database}.production_telemetry (
            event_id UUID,
            project_id String,
            timestamp DateTime64(3),
            agent_name LowCardinality(String),
            pipeline_stage LowCardinality(String),
            prompt_tokens UInt32,
            completion_tokens UInt32,
            latency_ms UInt32,
            status LowCardinality(String),
            summary String
        ) ENGINE = MergeTree()
        ORDER BY (project_id, timestamp, agent_name);
        """)

        # 2. Character Dialogue & Screen-time Analytics
        self.client.command(f"""
        CREATE TABLE IF NOT EXISTS {self.database}.character_analytics (
            event_id UUID,
            project_id String,
            scene_number UInt16,
            character_name LowCardinality(String),
            dialogue_lines UInt16,
            word_count UInt32,
            sentiment_score Float32,
            emotional_state LowCardinality(String),
            screen_time_seconds Float32
        ) ENGINE = MergeTree()
        ORDER BY (project_id, scene_number, character_name);
        """)

        # 3. Scene Breakdown & Complexity Metrics
        self.client.command(f"""
        CREATE TABLE IF NOT EXISTS {self.database}.scene_metrics (
            scene_id String,
            project_id String,
            scene_number UInt16,
            slugline String,
            time_of_day LowCardinality(String),
            location_type LowCardinality(String),
            shot_count UInt16,
            vfx_complexity_score UInt8,
            practical_props_count UInt16,
            estimated_budget_tier LowCardinality(String),
            keyframe_generated UInt8
        ) ENGINE = MergeTree()
        ORDER BY (project_id, scene_number);
        """)

        # 4. Box Office & Audience Demographics Simulation
        self.client.command(f"""
        CREATE TABLE IF NOT EXISTS {self.database}.box_office_simulation (
            simulation_id UUID,
            project_id String,
            target_demographic LowCardinality(String),
            projected_gross_m Float32,
            audience_sentiment Float32,
            virality_index Float32,
            risk_tier LowCardinality(String),
            timestamp DateTime64(3)
        ) ENGINE = MergeTree()
        ORDER BY (project_id, timestamp);
        """)

    def log_telemetry(self, project_id: str, agent_name: str, pipeline_stage: str, prompt_tokens: int, completion_tokens: int, latency_ms: int, status: str = "SUCCESS", summary: str = ""):
        event = {
            "event_id": str(uuid.uuid4()),
            "project_id": project_id,
            "timestamp": datetime.utcnow(),
            "agent_name": agent_name,
            "pipeline_stage": pipeline_stage,
            "prompt_tokens": int(prompt_tokens),
            "completion_tokens": int(completion_tokens),
            "latency_ms": int(latency_ms),
            "status": status,
            "summary": summary
        }
        self.local_telemetry.append(event)
        
        if self.is_connected and self.client:
            try:
                row = [
                    uuid.UUID(event["event_id"]),
                    event["project_id"],
                    event["timestamp"],
                    event["agent_name"],
                    event["pipeline_stage"],
                    event["prompt_tokens"],
                    event["completion_tokens"],
                    event["latency_ms"],
                    event["status"],
                    event["summary"]
                ]
                self.client.insert(f"{self.database}.production_telemetry", [row])
            except Exception as e:
                logger.error(f"ClickHouse insert error: {e}")

    def log_character_metric(self, project_id: str, scene_number: int, character_name: str, dialogue_lines: int, word_count: int, sentiment_score: float, emotional_state: str, screen_time_seconds: float):
        record = {
            "event_id": str(uuid.uuid4()),
            "project_id": project_id,
            "scene_number": int(scene_number),
            "character_name": character_name,
            "dialogue_lines": int(dialogue_lines),
            "word_count": int(word_count),
            "sentiment_score": float(sentiment_score),
            "emotional_state": emotional_state,
            "screen_time_seconds": float(screen_time_seconds)
        }
        self.local_characters.append(record)
        
        if self.is_connected and self.client:
            try:
                row = [
                    uuid.UUID(record["event_id"]),
                    record["project_id"],
                    record["scene_number"],
                    record["character_name"],
                    record["dialogue_lines"],
                    record["word_count"],
                    record["sentiment_score"],
                    record["emotional_state"],
                    record["screen_time_seconds"]
                ]
                self.client.insert(f"{self.database}.character_analytics", [row])
            except Exception as e:
                logger.error(f"ClickHouse character metric insert error: {e}")

    def log_scene_metric(self, scene_id: str, project_id: str, scene_number: int, slugline: str, time_of_day: str, location_type: str, shot_count: int, vfx_complexity_score: int, practical_props_count: int, estimated_budget_tier: str, keyframe_generated: int = 1):
        record = {
            "scene_id": scene_id,
            "project_id": project_id,
            "scene_number": int(scene_number),
            "slugline": slugline,
            "time_of_day": time_of_day,
            "location_type": location_type,
            "shot_count": int(shot_count),
            "vfx_complexity_score": int(vfx_complexity_score),
            "practical_props_count": int(practical_props_count),
            "estimated_budget_tier": estimated_budget_tier,
            "keyframe_generated": int(keyframe_generated)
        }
        self.local_scenes.append(record)
        
        if self.is_connected and self.client:
            try:
                row = [
                    record["scene_id"],
                    record["project_id"],
                    record["scene_number"],
                    record["slugline"],
                    record["time_of_day"],
                    record["location_type"],
                    record["shot_count"],
                    record["vfx_complexity_score"],
                    record["practical_props_count"],
                    record["estimated_budget_tier"],
                    record["keyframe_generated"]
                ]
                self.client.insert(f"{self.database}.scene_metrics", [row])
            except Exception as e:
                logger.error(f"ClickHouse scene metric insert error: {e}")

    def seed_demo_telemetry(self):
        """Pre-seeds initial telemetry for default demo project 'proj_last_spell'."""
        if any(t["project_id"] == "proj_last_spell" for t in self.local_telemetry):
            return

        demo_agents = [
            ("Producer", "Executive Brief & 3-Act Structure", 320, 840, 112),
            ("Screenwriter", "5 Structured Screenplay Scenes", 980, 2450, 245),
            ("Director", "Camera Staging & Shot Lists", 740, 1620, 178),
            ("Art Director", "Character & Location Visual Bible", 620, 1480, 154),
            ("Cinematographer", "35mm Anamorphic Optical Plans", 510, 980, 120),
            ("Storyboard", "Keyframe Prompts & Visual Frames", 890, 2100, 210),
            ("Sound & Music", "Acoustics & Strategic Silence", 430, 890, 98),
            ("Editor", "Pacing Strategy & Cut Timings", 510, 1150, 115),
            ("Social & Viral", "TikTok / Shorts Teaser Hooks", 410, 820, 85),
            ("Dance Agent", "4-Beat Movement Choreography", 380, 760, 78)
        ]
        for name, stage, p_tok, c_tok, lat in demo_agents:
            self.log_telemetry("proj_last_spell", name, stage, p_tok, c_tok, lat, "SUCCESS", f"{name} executed successfully")

        # Seed character metrics
        demo_chars = [
            (1, "Kaelen Vance", 42, 680, 0.45, "Grim Determination", 280.0),
            (1, "Sister Mara", 28, 410, -0.20, "Sacred Somberness", 160.0),
            (2, "Elias (The Mimic)", 34, 520, 0.70, "Uncanny Calm", 210.0),
            (2, "Nia", 18, 230, 0.15, "Cautious Alertness", 140.0)
        ]
        for sc, name, lines, words, sent, emo, dur in demo_chars:
            self.log_character_metric("proj_last_spell", sc, name, lines, words, sent, emo, dur)

        # Seed scene metrics
        demo_scenes = [
            ("sc_01", "proj_last_spell", 1, "EXT. ST. JUDE'S INNER SANCTUARY - DUSK", "Dusk", "Sanctuary", 12, 8, 14, "Tier B"),
            ("sc_02", "proj_last_spell", 2, "EXT. THE LIMBO BAZAAR - NIGHT", "Night", "Market", 16, 6, 28, "Tier A"),
            ("sc_03", "proj_last_spell", 3, "INT. DEAD METRO CONCOURSE - NIGHT", "Night", "Underground", 14, 9, 12, "Tier A"),
            ("sc_04", "proj_last_spell", 4, "EXT. FLOODED TRANSIT YARD - DAWN", "Dawn", "Ruins", 18, 10, 19, "Tier S"),
            ("sc_05", "proj_last_spell", 5, "INT. ST. JUDE'S CATHEDRAL NAVE - DAWN", "Dawn", "Sanctuary", 10, 7, 8, "Tier B")
        ]
        for sid, pid, sc, slug, tod, loc_t, shots, vfx, props, b_tier in demo_scenes:
            self.log_scene_metric(sid, pid, sc, slug, tod, loc_t, shots, vfx, props, b_tier, 1)

    def get_dashboard_metrics(self, project_id: str) -> Dict[str, Any]:
        """Aggregate all real-time stats for the cinematic control panel."""
        if self.is_connected and self.client:
            try:
                # Query ClickHouse columnar data
                telemetry_res = self.client.query(f"""
                    SELECT agent_name, count(), avg(latency_ms), sum(prompt_tokens + completion_tokens)
                    FROM {self.database}.production_telemetry
                    WHERE project_id = '{project_id}'
                    GROUP BY agent_name
                """).result_rows
                
                char_res = self.client.query(f"""
                    SELECT character_name, sum(dialogue_lines), sum(word_count), avg(sentiment_score), sum(screen_time_seconds)
                    FROM {self.database}.character_analytics
                    WHERE project_id = '{project_id}'
                    GROUP BY character_name
                    ORDER BY sum(screen_time_seconds) DESC
                """).result_rows
                
                scene_res = self.client.query(f"""
                    SELECT scene_number, slugline, shot_count, vfx_complexity_score, estimated_budget_tier, time_of_day, location_type
                    FROM {self.database}.scene_metrics
                    WHERE project_id = '{project_id}'
                    ORDER BY scene_number ASC
                """).result_rows
                
                return {
                    "source": "clickhouse_engine",
                    "telemetry": [
                        {"agent": r[0], "invocations": r[1], "avg_latency_ms": round(r[2], 1), "total_tokens": r[3]}
                        for r in telemetry_res
                    ],
                    "character_metrics": [
                        {"name": r[0], "lines": r[1], "words": r[2], "avg_sentiment": round(r[3], 2), "screen_time_sec": round(r[4], 1)}
                        for r in char_res
                    ],
                    "scene_metrics": [
                        {"scene": r[0], "slugline": r[1], "shots": r[2], "vfx_score": r[3], "budget_tier": r[4], "time": r[5], "type": r[6]}
                        for r in scene_res
                    ]
                }
            except Exception as e:
                logger.error(f"ClickHouse query error: {e}")

        # Fallback to local buffer aggregations
        proj_telemetry = [t for t in self.local_telemetry if t["project_id"] == project_id]
        proj_characters = [c for c in self.local_characters if c["project_id"] == project_id]
        proj_scenes = [s for s in self.local_scenes if s["project_id"] == project_id]
        
        # Telemetry aggregations
        agent_stats = {}
        for t in proj_telemetry:
            a = t["agent_name"]
            if a not in agent_stats:
                agent_stats[a] = {"invocations": 0, "total_latency": 0, "total_tokens": 0}
            agent_stats[a]["invocations"] += 1
            agent_stats[a]["total_latency"] += t["latency_ms"]
            agent_stats[a]["total_tokens"] += (t["prompt_tokens"] + t["completion_tokens"])
            
        telemetry_summary = [
            {
                "agent": k,
                "invocations": v["invocations"],
                "avg_latency_ms": round(v["total_latency"] / max(1, v["invocations"]), 1),
                "total_tokens": v["total_tokens"]
            }
            for k, v in agent_stats.items()
        ]
        
        # Character aggregations
        char_stats = {}
        for c in proj_characters:
            name = c["character_name"]
            if name not in char_stats:
                char_stats[name] = {"lines": 0, "words": 0, "sentiment_sum": 0, "count": 0, "screen_time": 0}
            char_stats[name]["lines"] += c["dialogue_lines"]
            char_stats[name]["words"] += c["word_count"]
            char_stats[name]["sentiment_sum"] += c["sentiment_score"]
            char_stats[name]["count"] += 1
            char_stats[name]["screen_time"] += c["screen_time_seconds"]
            
        character_summary = [
            {
                "name": k,
                "lines": v["lines"],
                "words": v["words"],
                "avg_sentiment": round(v["sentiment_sum"] / max(1, v["count"]), 2),
                "screen_time_sec": round(v["screen_time"], 1)
            }
            for k, v in char_stats.items()
        ]
        character_summary.sort(key=lambda x: x["screen_time_sec"], reverse=True)
        
        # Scene summary
        scene_summary = [
            {
                "scene": s["scene_number"],
                "slugline": s["slugline"],
                "shots": s["shot_count"],
                "vfx_score": s["vfx_complexity_score"],
                "budget_tier": s["estimated_budget_tier"],
                "time": s["time_of_day"],
                "type": s["location_type"]
            }
            for s in sorted(proj_scenes, key=lambda x: x["scene_number"])
        ]
        
        return {
            "source": "clickhouse_local_buffer",
            "telemetry": telemetry_summary,
            "character_metrics": character_summary,
            "scene_metrics": scene_summary
        }

# Global DB instance
ClickHouseClient = ClickHouseStudioDB
db = ClickHouseStudioDB()

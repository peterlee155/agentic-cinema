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
        self.local_budget: List[Dict[str, Any]] = []
        self.local_schedules: List[Dict[str, Any]] = []
        self.local_scene_costs: List[Dict[str, Any]] = []
        
        self.connect()

    def connect(self):
        try:
            import clickhouse_connect
            connect_kwargs = {
                "host": self.host,
                "port": self.port,
                "username": self.username,
                "password": self.password,
                "connect_timeout": 10,
                "send_receive_timeout": 15,
                "compress": False,
            }
            if self.secure or self.port == 8443 or "clickhouse.cloud" in self.host:
                connect_kwargs["secure"] = True
                self.secure = True

            try:
                self.client = clickhouse_connect.get_client(**connect_kwargs)
                self.client.command(f"CREATE DATABASE IF NOT EXISTS {self.database}")
            except Exception as first_err:
                if self.host == "localhost":
                    logger.info("Attempting fallback to 127.0.0.1 for ClickHouse...")
                    fallback_kwargs = dict(connect_kwargs)
                    fallback_kwargs["host"] = "127.0.0.1"
                    self.client = clickhouse_connect.get_client(**fallback_kwargs)
                    self.client.command(f"CREATE DATABASE IF NOT EXISTS {self.database}")
                    self.host = "127.0.0.1"
                else:
                    raise first_err

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

    def ensure_connected(self) -> bool:
        """Verifies active connection and reconnects dynamically if needed."""
        if self.is_connected and self.client:
            try:
                self.client.command("SELECT 1")
                return True
            except Exception:
                self.is_connected = False
                self.client = None
        self.connect()
        return self.is_connected

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

        # 5. Production Budget Allocation & Spending Tracking
        self.client.command(f"""
        CREATE TABLE IF NOT EXISTS {self.database}.budget_allocation (
            project_id String,
            department LowCardinality(String),
            allocated_amount Float64,
            spent_amount Float64,
            remaining_amount Float64,
            currency LowCardinality(String),
            notes String
        ) ENGINE = MergeTree()
        ORDER BY (project_id, department);
        """)

        # 6. Production Shoot Schedules & Timeline Logistics
        self.client.command(f"""
        CREATE TABLE IF NOT EXISTS {self.database}.shoot_schedules (
            project_id String,
            scene_number UInt16,
            shoot_day UInt16,
            location String,
            cast_required String,
            estimated_hours Float32,
            status LowCardinality(String),
            vfx_supervisor String
        ) ENGINE = MergeTree()
        ORDER BY (project_id, shoot_day, scene_number);
        """)

        # 7. Scene Costs & Optimization Ledger
        self.client.command(f"""
        CREATE TABLE IF NOT EXISTS {self.database}.scene_costs (
            project_id String,
            scene_number UInt16,
            slugline String,
            base_location_cost Float64,
            cast_cost Float64,
            vfx_cost Float64,
            stunt_cost Float64,
            total_scene_cost Float64,
            optimization_savings_potential Float64
        ) ENGINE = MergeTree()
        ORDER BY (project_id, scene_number);
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

    def log_budget_item(self, project_id: str, department: str, allocated: float, spent: float, remaining: float, currency: str = "USD", notes: str = ""):
        record = {
            "project_id": project_id,
            "department": department,
            "allocated_amount": float(allocated),
            "spent_amount": float(spent),
            "remaining_amount": float(remaining),
            "currency": currency,
            "notes": notes
        }
        self.local_budget.append(record)
        if self.is_connected and self.client:
            try:
                row = [project_id, department, float(allocated), float(spent), float(remaining), currency, notes]
                self.client.insert(f"{self.database}.budget_allocation", [row])
            except Exception as e:
                logger.error(f"ClickHouse budget insert error: {e}")

    def log_schedule_item(self, project_id: str, scene_number: int, shoot_day: int, location: str, cast_required: str, estimated_hours: float, status: str = "SCHEDULED", vfx_supervisor: str = "Alex Kim"):
        record = {
            "project_id": project_id,
            "scene_number": int(scene_number),
            "shoot_day": int(shoot_day),
            "location": location,
            "cast_required": cast_required,
            "estimated_hours": float(estimated_hours),
            "status": status,
            "vfx_supervisor": vfx_supervisor
        }
        self.local_schedules.append(record)
        if self.is_connected and self.client:
            try:
                row = [project_id, int(scene_number), int(shoot_day), location, cast_required, float(estimated_hours), status, vfx_supervisor]
                self.client.insert(f"{self.database}.shoot_schedules", [row])
            except Exception as e:
                logger.error(f"ClickHouse schedule insert error: {e}")

    def log_scene_cost(self, project_id: str, scene_number: int, slugline: str, base_loc: float, cast_cost: float, vfx_cost: float, stunt_cost: float, savings_potential: float = 0.0):
        total = base_loc + cast_cost + vfx_cost + stunt_cost
        record = {
            "project_id": project_id,
            "scene_number": int(scene_number),
            "slugline": slugline,
            "base_location_cost": float(base_loc),
            "cast_cost": float(cast_cost),
            "vfx_cost": float(vfx_cost),
            "stunt_cost": float(stunt_cost),
            "total_scene_cost": float(total),
            "optimization_savings_potential": float(savings_potential)
        }
        self.local_scene_costs.append(record)
        if self.is_connected and self.client:
            try:
                row = [project_id, int(scene_number), slugline, float(base_loc), float(cast_cost), float(vfx_cost), float(stunt_cost), float(total), float(savings_potential)]
                self.client.insert(f"{self.database}.scene_costs", [row])
            except Exception as e:
                logger.error(f"ClickHouse scene cost insert error: {e}")

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
        telemetry_rows = []
        for name, stage, p_tok, c_tok, lat in demo_agents:
            event = {
                "event_id": str(uuid.uuid4()),
                "project_id": "proj_last_spell",
                "timestamp": datetime.utcnow(),
                "agent_name": name,
                "pipeline_stage": stage,
                "prompt_tokens": int(p_tok),
                "completion_tokens": int(c_tok),
                "latency_ms": int(lat),
                "status": "SUCCESS",
                "summary": f"{name} executed successfully"
            }
            self.local_telemetry.append(event)
            telemetry_rows.append([
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
            ])

        # Seed character metrics
        demo_chars = [
            (1, "Kaelen Vance", 42, 680, 0.45, "Grim Determination", 280.0),
            (1, "Sister Mara", 28, 410, -0.20, "Sacred Somberness", 160.0),
            (2, "Elias (The Mimic)", 34, 520, 0.70, "Uncanny Calm", 210.0),
            (2, "Nia", 18, 230, 0.15, "Cautious Alertness", 140.0)
        ]
        char_rows = []
        for sc, name, lines, words, sent, emo, dur in demo_chars:
            record = {
                "event_id": str(uuid.uuid4()),
                "project_id": "proj_last_spell",
                "scene_number": int(sc),
                "character_name": name,
                "dialogue_lines": int(lines),
                "word_count": int(words),
                "sentiment_score": float(sent),
                "emotional_state": emo,
                "screen_time_seconds": float(dur)
            }
            self.local_characters.append(record)
            char_rows.append([
                uuid.UUID(record["event_id"]),
                record["project_id"],
                record["scene_number"],
                record["character_name"],
                record["dialogue_lines"],
                record["word_count"],
                record["sentiment_score"],
                record["emotional_state"],
                record["screen_time_seconds"]
            ])

        # Seed scene metrics
        demo_scenes = [
            ("sc_01", "proj_last_spell", 1, "EXT. ST. JUDE'S INNER SANCTUARY - DUSK", "Dusk", "Sanctuary", 12, 8, 14, "Tier B"),
            ("sc_02", "proj_last_spell", 2, "EXT. THE LIMBO BAZAAR - NIGHT", "Night", "Market", 16, 6, 28, "Tier A"),
            ("sc_03", "proj_last_spell", 3, "INT. DEAD METRO CONCOURSE - NIGHT", "Night", "Underground", 14, 9, 12, "Tier A"),
            ("sc_04", "proj_last_spell", 4, "EXT. FLOODED TRANSIT YARD - DAWN", "Dawn", "Ruins", 18, 10, 19, "Tier S"),
            ("sc_05", "proj_last_spell", 5, "INT. ST. JUDE'S CATHEDRAL NAVE - DAWN", "Dawn", "Sanctuary", 10, 7, 8, "Tier B")
        ]
        scene_rows = []
        for sid, pid, sc, slug, tod, loc_t, shots, vfx, props, b_tier in demo_scenes:
            record = {
                "scene_id": sid,
                "project_id": pid,
                "scene_number": int(sc),
                "slugline": slug,
                "time_of_day": tod,
                "location_type": loc_t,
                "shot_count": int(shots),
                "vfx_complexity_score": int(vfx),
                "practical_props_count": int(props),
                "estimated_budget_tier": b_tier,
                "keyframe_generated": 1
            }
            self.local_scenes.append(record)
            scene_rows.append([
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
            ])

        # Seed budget allocation metrics
        demo_budgets = [
            ("VFX & CGI", 1200000.0, 480000.0, 720000.0, "Forcefield domes, runic disintegration, particle shaders"),
            ("Locations & Sets", 850000.0, 320000.0, 530000.0, "Subway concourse stage build, Gothic sanctuary lease"),
            ("Cast & Talent", 950000.0, 450000.0, 500000.0, "Principal leads, mimic background crowd ensemble"),
            ("Stunts & Practical", 450000.0, 180000.0, 270000.0, "High-wire bridge fall rig, hydraulic vault door breach"),
            ("Camera & Lighting", 380000.0, 190000.0, 190000.0, "Arri Alexa 65 anamorphic package, sodium vapor rig"),
            ("Sound & Music", 220000.0, 85000.0, 135000.0, "30Hz spatial acoustic master, orchestral cello recording")
        ]
        budget_rows = []
        for dept, alloc, spent, rem, notes in demo_budgets:
            record = {
                "project_id": "proj_last_spell",
                "department": dept,
                "allocated_amount": float(alloc),
                "spent_amount": float(spent),
                "remaining_amount": float(rem),
                "currency": "USD",
                "notes": notes
            }
            self.local_budget.append(record)
            budget_rows.append(["proj_last_spell", dept, float(alloc), float(spent), float(rem), "USD", notes])

        # Seed shoot schedules
        demo_schedules = [
            (1, 1, "Soundstage A (Sanctuary Dome Set)", "Kaelen, Sister Mara", 10.5, "COMPLETED", "Alex Kim"),
            (2, 2, "Backlot Sector 4 (Limbo Bazaar)", "Kaelen, Elias, 30 Background Extras", 12.0, "SCHEDULED", "Alex Kim"),
            (3, 3, "Subterranean Pump Station 9", "Kaelen, Nia", 9.0, "SCHEDULED", "Elena Rostova"),
            (4, 4, "Decommissioned Iron Rail Bridge", "Kaelen, Elias, Stunt Doubles", 14.0, "PRE-PRODUCTION", "Alex Kim"),
            (5, 5, "Soundstage A (Cathedral Nave)", "Kaelen, Sister Mara, Nia", 8.0, "SCHEDULED", "Elena Rostova")
        ]
        schedule_rows = []
        for sc_num, day, loc, cast, hrs, stat, vfx_sup in demo_schedules:
            record = {
                "project_id": "proj_last_spell",
                "scene_number": int(sc_num),
                "shoot_day": int(day),
                "location": loc,
                "cast_required": cast,
                "estimated_hours": float(hrs),
                "status": stat,
                "vfx_supervisor": vfx_sup
            }
            self.local_schedules.append(record)
            schedule_rows.append(["proj_last_spell", int(sc_num), int(day), loc, cast, float(hrs), stat, vfx_sup])

        # Seed scene costs
        demo_costs = [
            (1, "EXT. ST. JUDE'S INNER SANCTUARY - DUSK", 45000.0, 60000.0, 140000.0, 15000.0, 35000.0),
            (2, "EXT. THE LIMBO BAZAAR - NIGHT", 85000.0, 120000.0, 65000.0, 20000.0, 42000.0),
            (3, "INT. DEAD METRO CONCOURSE - NIGHT", 60000.0, 50000.0, 95000.0, 40000.0, 38000.0),
            (4, "EXT. FLOODED TRANSIT YARD - DAWN", 110000.0, 80000.0, 210000.0, 95000.0, 85000.0),
            (5, "INT. ST. JUDE'S CATHEDRAL NAVE - DAWN", 40000.0, 55000.0, 50000.0, 10000.0, 20000.0)
        ]
        cost_rows = []
        for sc_num, slug, bloc, ccost, vcost, scost, sav in demo_costs:
            total = bloc + ccost + vcost + scost
            record = {
                "project_id": "proj_last_spell",
                "scene_number": int(sc_num),
                "slugline": slug,
                "base_location_cost": float(bloc),
                "cast_cost": float(ccost),
                "vfx_cost": float(vcost),
                "stunt_cost": float(scost),
                "total_scene_cost": float(total),
                "optimization_savings_potential": float(sav)
            }
            self.local_scene_costs.append(record)
            cost_rows.append(["proj_last_spell", int(sc_num), slug, float(bloc), float(ccost), float(vcost), float(scost), float(total), float(sav)])

        # Fast Batch Sync to ClickHouse
        if self.is_connected and self.client:
            try:
                cnt = self.client.command(f"SELECT count() FROM {self.database}.production_telemetry WHERE project_id = 'proj_last_spell'")
                if cnt == 0:
                    self.client.insert(f"{self.database}.production_telemetry", telemetry_rows)
                    self.client.insert(f"{self.database}.character_analytics", char_rows)
                    self.client.insert(f"{self.database}.scene_metrics", scene_rows)
                    self.client.insert(f"{self.database}.budget_allocation", budget_rows)
                    self.client.insert(f"{self.database}.shoot_schedules", schedule_rows)
                    self.client.insert(f"{self.database}.scene_costs", cost_rows)
                    logger.info("Successfully batch-seeded demo tables in ClickHouse.")
            except Exception as batch_err:
                logger.warning(f"Batch seed notice: {batch_err}")

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

    def get_budget_overview(self, project_id: str) -> Dict[str, Any]:
        """Query budget allocation and spending across departments."""
        if self.is_connected and self.client:
            try:
                res = self.client.query(f"""
                    SELECT department, allocated_amount, spent_amount, remaining_amount, currency, notes
                    FROM {self.database}.budget_allocation
                    WHERE project_id = '{project_id}'
                    ORDER BY allocated_amount DESC
                """).result_rows
                items = [
                    {"department": r[0], "allocated": float(r[1]), "spent": float(r[2]), "remaining": float(r[3]), "currency": r[4], "notes": r[5]}
                    for r in res
                ]
                total_alloc = sum(i["allocated"] for i in items)
                total_spent = sum(i["spent"] for i in items)
                return {
                    "source": "clickhouse_cloud",
                    "project_id": project_id,
                    "items": items,
                    "total_allocated": total_alloc,
                    "total_spent": total_spent,
                    "total_remaining": total_alloc - total_spent,
                    "burn_rate_percent": round((total_spent / max(1.0, total_alloc)) * 100, 1)
                }
            except Exception as e:
                logger.warning(f"ClickHouse budget query fallback: {e}")

        # Fallback to local buffer
        proj_budget = [b for b in self.local_budget if b["project_id"] == project_id]
        total_alloc = sum(b["allocated_amount"] for b in proj_budget)
        total_spent = sum(b["spent_amount"] for b in proj_budget)
        return {
            "source": "clickhouse_local_buffer",
            "project_id": project_id,
            "items": [
                {
                    "department": b["department"],
                    "allocated": b["allocated_amount"],
                    "spent": b["spent_amount"],
                    "remaining": b["remaining_amount"],
                    "currency": b["currency"],
                    "notes": b["notes"]
                }
                for b in proj_budget
            ],
            "total_allocated": total_alloc,
            "total_spent": total_spent,
            "total_remaining": total_alloc - total_spent,
            "burn_rate_percent": round((total_spent / max(1.0, total_alloc)) * 100, 1)
        }

    def get_schedule_overview(self, project_id: str) -> Dict[str, Any]:
        """Query shoot schedule timeline, cast requirements, and daily status."""
        if self.is_connected and self.client:
            try:
                res = self.client.query(f"""
                    SELECT scene_number, shoot_day, location, cast_required, estimated_hours, status, vfx_supervisor
                    FROM {self.database}.shoot_schedules
                    WHERE project_id = '{project_id}'
                    ORDER BY shoot_day ASC, scene_number ASC
                """).result_rows
                items = [
                    {"scene_number": r[0], "shoot_day": r[1], "location": r[2], "cast": r[3], "hours": float(r[4]), "status": r[5], "vfx_supervisor": r[6]}
                    for r in res
                ]
                return {"source": "clickhouse_cloud", "project_id": project_id, "schedules": items, "total_shoot_days": len(set(i["shoot_day"] for i in items))}
            except Exception as e:
                logger.warning(f"ClickHouse schedule query fallback: {e}")

        proj_sched = [s for s in self.local_schedules if s["project_id"] == project_id]
        items = [
            {
                "scene_number": s["scene_number"],
                "shoot_day": s["shoot_day"],
                "location": s["location"],
                "cast": s["cast_required"],
                "hours": s["estimated_hours"],
                "status": s["status"],
                "vfx_supervisor": s["vfx_supervisor"]
            }
            for s in sorted(proj_sched, key=lambda x: (x["shoot_day"], x["scene_number"]))
        ]
        return {"source": "clickhouse_local_buffer", "project_id": project_id, "schedules": items, "total_shoot_days": len(set(i["shoot_day"] for i in items))}

    def get_scene_costs_overview(self, project_id: str) -> Dict[str, Any]:
        """Query scene cost breakdowns and optimization savings."""
        if self.is_connected and self.client:
            try:
                res = self.client.query(f"""
                    SELECT scene_number, slugline, base_location_cost, cast_cost, vfx_cost, stunt_cost, total_scene_cost, optimization_savings_potential
                    FROM {self.database}.scene_costs
                    WHERE project_id = '{project_id}'
                    ORDER BY total_scene_cost DESC
                """).result_rows
                items = [
                    {
                        "scene_number": r[0], "slugline": r[1],
                        "base_location": float(r[2]), "cast_cost": float(r[3]), "vfx_cost": float(r[4]),
                        "stunt_cost": float(r[5]), "total_cost": float(r[6]), "savings_potential": float(r[7])
                    }
                    for r in res
                ]
                return {"source": "clickhouse_cloud", "project_id": project_id, "scenes": items, "total_production_cost": sum(i["total_cost"] for i in items), "total_savings_potential": sum(i["savings_potential"] for i in items)}
            except Exception as e:
                logger.warning(f"ClickHouse scene cost query fallback: {e}")

        proj_costs = [c for c in self.local_scene_costs if c["project_id"] == project_id]
        items = [
            {
                "scene_number": c["scene_number"],
                "slugline": c["slugline"],
                "base_location": c["base_location_cost"],
                "cast_cost": c["cast_cost"],
                "vfx_cost": c["vfx_cost"],
                "stunt_cost": c["stunt_cost"],
                "total_cost": c["total_scene_cost"],
                "savings_potential": c["optimization_savings_potential"]
            }
            for c in sorted(proj_costs, key=lambda x: x["total_scene_cost"], reverse=True)
        ]
        return {
            "source": "clickhouse_local_buffer",
            "project_id": project_id,
            "scenes": items,
            "total_production_cost": sum(i["total_cost"] for i in items),
            "total_savings_potential": sum(i["savings_potential"] for i in items)
        }

# Global DB instance
ClickHouseClient = ClickHouseStudioDB
db = ClickHouseStudioDB()

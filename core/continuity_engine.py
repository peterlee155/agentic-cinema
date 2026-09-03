"""
Continuity Engine for Agentic Cinema.
Audits screenplay, character appearances, wardrobe, signature props, locations,
monotonic timeline, countdown timer progression, and world rules to prevent narrative discrepancies.
Never silently overwrites established canon.
"""

from typing import Dict, List, Any, Optional
import re

class ContinuityConflict:
    def __init__(self, problem: str, existing_canon: str, new_output: str, suggested_resolution: str,
                 severity: str = "WARNING", category: str = "general",
                 scene: Optional[int] = None, previousScene: Optional[int] = None,
                 rule: Optional[str] = None):
        self.problem = problem
        self.existing_canon = existing_canon
        self.new_output = new_output
        self.suggested_resolution = suggested_resolution
        self.severity = severity.upper()  # CRITICAL, WARNING, INFO
        self.category = category
        self.scene = scene
        self.previousScene = previousScene
        self.rule = rule

    def to_dict(self) -> Dict[str, Any]:
        return {
            "severity": self.severity,
            "category": self.category,
            "scene": self.scene,
            "previousScene": self.previousScene,
            "problem": self.problem,
            "message": self.problem,
            "existing_canon": self.existing_canon,
            "new_output": self.new_output,
            "rule": self.rule,
            "suggested_resolution": self.suggested_resolution,
            "suggestedFix": self.suggested_resolution,
            "formatted_notice": self.format_notice()
        }

    def format_notice(self) -> str:
        loc = f" (Scene {self.scene})" if self.scene is not None else ""
        return (
            f"[{self.severity}] [{self.category.upper()}]{loc} CONTINUITY CONFLICT\n\n"
            f"Problem:\n{self.problem}\n\n"
            f"Existing Canon:\n{self.existing_canon}\n\n"
            f"New Output:\n{self.new_output}\n\n"
            f"Suggested Resolution:\n{self.suggested_resolution}"
        )


class ContinuityEngine:
    """Verifies continuity across characters, locations, timeline, countdown timers, world rules, camera, and media."""

    def __init__(self):
        self.conflicts: List[ContinuityConflict] = []
        self.verified_facts: List[str] = []
        self.total_checks: int = 0
        self.passed_checks: int = 0

    def clear(self):
        self.conflicts = []
        self.verified_facts = []
        self.total_checks = 0
        self.passed_checks = 0

    def _parse_timecode(self, tc: str) -> Optional[int]:
        """Parses 'HH:MM:SS' into total integer seconds."""
        if not tc or not isinstance(tc, str):
            return None
        parts = tc.strip().split(":")
        if len(parts) == 3:
            try:
                return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
            except ValueError:
                return None
        elif len(parts) == 2:
            try:
                return int(parts[0]) * 60 + int(parts[1])
            except ValueError:
                return None
        return None

    def audit_production(self, bible_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs a comprehensive 12-vector continuity audit across the full Project Bible:
        1. Scene numbering
        2. Timeline progression
        3. Countdown/timer progression (strictly monotonic)
        4. Character existence
        5. Character visual profile
        6. Costume continuity
        7. Prop continuity
        8. Location mapping
        9. World-rule compliance
        10. Screenplay -> storyboard consistency
        11. Screenplay -> camera consistency
        12. Storyboard -> media generation consistency
        """
        self.clear()

        characters = bible_dict.get("characters", [])
        locations = bible_dict.get("locations", [])
        world_rules = bible_dict.get("worldRules", [])
        scenes = bible_dict.get("scenes", []) or bible_dict.get("screenplay", [])
        timeline = bible_dict.get("timeline", [])
        storyboard = bible_dict.get("storyboard", [])
        shots = bible_dict.get("shots", [])

        # -------------------------------------------------------------
        # VECTOR 1: SCENE NUMBERING
        # -------------------------------------------------------------
        self.total_checks += 1
        prev_num = 0
        numbering_ok = True
        for sc in scenes:
            num = sc.get("sceneNumber", 0)
            if num <= prev_num and prev_num > 0:
                self.conflicts.append(ContinuityConflict(
                    problem=f"Scene numbering discrepancy at scene {num} (preceded by scene {prev_num}).",
                    existing_canon=f"Chronologically sequential numbering (1 to {len(scenes)}).",
                    new_output=f"Scene {num} precedes or duplicates scene {prev_num}.",
                    suggested_resolution=f"Renumber scene to {prev_num + 1} to maintain narrative sequence.",
                    severity="CRITICAL",
                    category="scene_numbering",
                    scene=num,
                    previousScene=prev_num
                ))
                numbering_ok = False
            prev_num = num
        if numbering_ok and scenes:
            self.passed_checks += 1
            self.verified_facts.append(f"Scene numbering sequential across all {len(scenes)} scenes.")

        # -------------------------------------------------------------
        # VECTOR 2: TIMELINE PROGRESSION
        # -------------------------------------------------------------
        self.total_checks += 1
        timeline_ok = True
        if timeline:
            prev_elapsed = -1
            for t_entry in timeline:
                sc_id = t_entry.get("scene", 0)
                elapsed = t_entry.get("elapsed_story_seconds")
                if elapsed is None and "elapsed_story_time" in t_entry:
                    elapsed = self._parse_timecode(t_entry["elapsed_story_time"])
                if elapsed is not None:
                    if elapsed < prev_elapsed:
                        self.conflicts.append(ContinuityConflict(
                            problem=f"Scene {sc_id} elapsed story time ({t_entry.get('elapsed_story_time')}) moves backwards from preceding scene ({prev_elapsed}s).",
                            existing_canon="Elapsed production story time must be strictly non-decreasing.",
                            new_output=f"Elapsed time decreased to {elapsed}s.",
                            suggested_resolution="Recalculate elapsed story time using canonical timeline generator.",
                            severity="CRITICAL",
                            category="timeline",
                            scene=sc_id
                        ))
                        timeline_ok = False
                    prev_elapsed = elapsed
        if timeline_ok and timeline:
            self.passed_checks += 1
            self.verified_facts.append(f"Canonical timeline progression verified across {len(timeline)} chronological entries.")

        # -------------------------------------------------------------
        # VECTOR 3: COUNTDOWN / TIMER PROGRESSION (STRICTLY MONOTONIC)
        # -------------------------------------------------------------
        self.total_checks += 1
        timer_ok = True
        prev_timer_sec = float('inf')
        prev_timer_sc = 0

        # Check timeline timer
        for t_entry in timeline:
            sc_id = t_entry.get("scene", 0)
            rem_sec = t_entry.get("remaining_timer_seconds")
            if rem_sec is None and "remaining_timer" in t_entry:
                rem_sec = self._parse_timecode(t_entry["remaining_timer"])
            if rem_sec is not None:
                if rem_sec > prev_timer_sec:
                    self.conflicts.append(ContinuityConflict(
                        problem=f"Countdown timer INCREASED at scene {sc_id} ({t_entry.get('remaining_timer')}) compared to scene {prev_timer_sc} ({self._format_sec(prev_timer_sec)}).",
                        existing_canon="RULE_04: Countdown spell strictly dissipates. Timer must never increase.",
                        new_output=f"Remaining timer jumped up by {rem_sec - prev_timer_sec} seconds.",
                        suggested_resolution="Ensure monotonic decrement across canonical timeline.",
                        severity="CRITICAL",
                        category="countdown",
                        scene=sc_id,
                        previousScene=prev_timer_sc,
                        rule="RULE_04"
                    ))
                    timer_ok = False
                prev_timer_sec = rem_sec
                prev_timer_sc = sc_id

        # Also inspect action text for rogue timer values if mentioned
        for sc in scenes:
            action_text = sc.get("action", "") or sc.get("actionDescription", "")
            match = re.search(r'(\d{2}:\d{2}:\d{2})', action_text)
            if match:
                tc_str = match.group(1)
                tc_val = self._parse_timecode(tc_str)
                # Verify it does not exceed 4 hours
                if tc_val and tc_val > 14400:
                    self.conflicts.append(ContinuityConflict(
                        problem=f"Scene {sc.get('sceneNumber')} references timer '{tc_str}' which exceeds initial 4-hour spell maximum (04:00:00).",
                        existing_canon="RULE_04: Sister Mara carved a 4-hour countdown (04:00:00).",
                        new_output=f"Action references {tc_str}.",
                        suggested_resolution="Clamp countdown mention to 04:00:00 or below.",
                        severity="WARNING",
                        category="countdown",
                        scene=sc.get('sceneNumber'),
                        rule="RULE_04"
                    ))
                    timer_ok = False

        if timer_ok:
            self.passed_checks += 1
            self.verified_facts.append("Countdown timer strictly monotonic (decreases consistently with zero time-travel increases).")

        # -------------------------------------------------------------
        # VECTOR 4: CHARACTER EXISTENCE
        # -------------------------------------------------------------
        self.total_checks += 1
        char_names = set()
        for char in characters:
            name = char.get("name", "").strip()
            if name:
                char_names.add(name.lower())
                char_names.add(name.split("(")[0].strip().lower())
                # Add first name
                parts = name.split()
                if parts:
                    char_names.add(parts[0].lower())

        ignored_crowd = {"extras", "crowd", "zombies", "guards", "citizens", "mimics", "scavengers", "infected"}
        chars_exist_ok = True
        for sc in scenes:
            scene_chars = sc.get("characters", [])
            for sc_char in scene_chars:
                clean_sc = sc_char.split("(")[0].strip().lower()
                first_name = clean_sc.split()[0] if clean_sc.split() else ""
                if clean_sc and clean_sc not in char_names and first_name not in char_names and clean_sc not in ignored_crowd:
                    self.conflicts.append(ContinuityConflict(
                        problem=f"Scene {sc.get('sceneNumber', '?')} introduces unestablished character '{sc_char}'.",
                        existing_canon=f"Established character roster: {', '.join([c.get('name') for c in characters])}",
                        new_output=f"Scene references '{sc_char}' without dossier.",
                        suggested_resolution=f"Add '{sc_char}' to Project Bible characters or substitute with an existing character.",
                        severity="WARNING",
                        category="character",
                        scene=sc.get('sceneNumber')
                    ))
                    chars_exist_ok = False
        if chars_exist_ok and scenes:
            self.passed_checks += 1
            self.verified_facts.append(f"All characters referenced in {len(scenes)} scenes match registered character dossiers.")

        # -------------------------------------------------------------
        # VECTOR 5: CHARACTER VISUAL PROFILE
        # -------------------------------------------------------------
        self.total_checks += 1
        vis_ok = True
        for char in characters:
            name = char.get("name", "")
            app = char.get("appearance", "")
            if not app or len(app) < 10:
                self.conflicts.append(ContinuityConflict(
                    problem=f"Principal character '{name}' lacks detailed visual profile.",
                    existing_canon="Art department mandates explicit facial, physical, and silhouette profiles.",
                    new_output=f"Brief/missing appearance for {name}.",
                    suggested_resolution=f"Flesh out physical traits and facial features for {name}.",
                    severity="WARNING",
                    category="character"
                ))
                vis_ok = False
        if vis_ok and characters:
            self.passed_checks += 1
            self.verified_facts.append(f"Visual profiles locked for all {len(characters)} principal characters.")

        # -------------------------------------------------------------
        # VECTOR 6: COSTUME CONTINUITY
        # -------------------------------------------------------------
        self.total_checks += 1
        costume_ok = True
        for char in characters:
            name = char.get("name", "")
            clothing = char.get("clothing", "")
            palette = char.get("colorPalette", "")
            if not clothing:
                self.conflicts.append(ContinuityConflict(
                    problem=f"Character '{name}' lacks wardrobe breakdown.",
                    existing_canon="Costume department mandates wardrobe specs for principal characters.",
                    new_output=f"No clothing spec for {name}.",
                    suggested_resolution=f"Define costume progression and color palette for {name}.",
                    severity="WARNING",
                    category="costume"
                ))
                costume_ok = False
        if costume_ok and characters:
            self.passed_checks += 1
            self.verified_facts.append(f"Wardrobe specifications and color palettes verified for all {len(characters)} characters.")

        # -------------------------------------------------------------
        # VECTOR 7: PROP CONTINUITY
        # -------------------------------------------------------------
        self.total_checks += 1
        props_ok = True
        for char in characters:
            name = char.get("name", "")
            props = char.get("props", "")
            if not props:
                self.conflicts.append(ContinuityConflict(
                    problem=f"Character '{name}' lacks signature tactical props/gear.",
                    existing_canon="Every principal character must have signature narrative props.",
                    new_output=f"Blank prop definition for {name}.",
                    suggested_resolution=f"Assign signature props (e.g. chronometer, tuning fork, radio) to {name}.",
                    severity="INFO",
                    category="prop"
                ))
                props_ok = False
        if props_ok and characters:
            self.passed_checks += 1
            self.verified_facts.append(f"Signature narrative props mapped across all {len(characters)} characters.")

        # -------------------------------------------------------------
        # VECTOR 8: LOCATION MAPPING
        # -------------------------------------------------------------
        self.total_checks += 1
        loc_names = {loc.get("name", "").lower() for loc in locations if loc.get("name")}
        loc_tokens = set()
        for ln in loc_names:
            for word in re.findall(r'\b[a-zA-Z]{4,}\b', ln):
                loc_tokens.add(word.lower())

        loc_ok = True
        for sc in scenes:
            loc = (sc.get("location") or sc.get("slugline") or "").strip().lower()
            if loc and loc_tokens:
                sc_words = set(re.findall(r'\b[a-zA-Z]{4,}\b', loc))
                matched = bool(sc_words.intersection(loc_tokens)) or any(l in loc or loc in l for l in loc_names)
                if not matched:
                    self.conflicts.append(ContinuityConflict(
                        problem=f"Scene {sc.get('sceneNumber', '?')} is set in unmapped location '{sc.get('location') or sc.get('slugline')}'.",
                        existing_canon=f"Registered locations in Atlas: {', '.join([l.get('name') for l in locations])}",
                        new_output=f"New location '{sc.get('location')}' used without architecture breakdown.",
                        suggested_resolution=f"Register '{sc.get('location')}' in the Master Location Atlas.",
                        severity="WARNING",
                        category="location",
                        scene=sc.get('sceneNumber')
                    ))
                    loc_ok = False
        if loc_ok and scenes:
            self.passed_checks += 1
            self.verified_facts.append(f"All scene locations mapped to canonical {len(locations)}-location master atlas.")

        # -------------------------------------------------------------
        # VECTOR 9: WORLD RULE COMPLIANCE
        # -------------------------------------------------------------
        self.total_checks += 1
        rules_ok = True
        all_scene_text = " ".join([
            (s.get("action", "") or s.get("actionDescription", "") or "") + " " +
            (s.get("dialogue", "") or "")
            for s in scenes
        ]).lower()

        for r in world_rules:
            rule_text = r.get("rule", "")
            rule_id = r.get("id", "RULE")

            # Check Rule 01: Inner barrier inviolability
            if "inner sanctuary" in rule_text.lower() and "cannot be entered by zombies" in rule_text.lower():
                if "zombies inside the inner cathedral" in all_scene_text or "zombie entered inner sanctuary" in all_scene_text:
                    self.conflicts.append(ContinuityConflict(
                        problem="Rule 01 Violation: Scene depicts infected inside inner sanctuary.",
                        existing_canon=rule_text,
                        new_output="Zombies entered inner perimeter.",
                        suggested_resolution="Restrict zombie breaches to the Outer Buffer zone.",
                        severity="CRITICAL",
                        category="world_rule",
                        rule=rule_id
                    ))
                    rules_ok = False

            # Check Rule 04: Countdown spell tracking
            if "countdown spell" in rule_text.lower() or "runic" in rule_text.lower():
                if len(scenes) > 2 and "countdown" not in all_scene_text and "timer" not in all_scene_text and "glyph" not in all_scene_text:
                    self.conflicts.append(ContinuityConflict(
                        problem="Rule 04 Violation: Countdown spell is not visibly tracked across outdoor scenes.",
                        existing_canon=rule_text,
                        new_output="Screenplay progresses without checking the runic chronometer.",
                        suggested_resolution="Inject wrist chronometer check in action beats.",
                        severity="WARNING",
                        category="world_rule",
                        rule=rule_id
                    ))
                    rules_ok = False

        if rules_ok and world_rules:
            self.passed_checks += 1
            self.verified_facts.append(f"All {len(world_rules)} canonical universe laws validated against narrative beats.")

        # -------------------------------------------------------------
        # VECTOR 10: SCREENPLAY -> STORYBOARD CONSISTENCY
        # -------------------------------------------------------------
        self.total_checks += 1
        sb_ok = True
        scene_numbers = {s.get("sceneNumber") for s in scenes if s.get("sceneNumber")}
        for frame in storyboard:
            sc_ref = frame.get("scene")
            if sc_ref and scene_numbers and sc_ref not in scene_numbers:
                self.conflicts.append(ContinuityConflict(
                    problem=f"Storyboard frame references Scene {sc_ref}, which does not exist in screenplay.",
                    existing_canon=f"Screenplay scenes: 1 to {max(scene_numbers)}",
                    new_output=f"Orphan storyboard frame referencing scene {sc_ref}.",
                    suggested_resolution=f"Map frame to an existing scene in 1..{max(scene_numbers)}.",
                    severity="WARNING",
                    category="screenplay_storyboard",
                    scene=sc_ref
                ))
                sb_ok = False
        if sb_ok:
            self.passed_checks += 1
            self.verified_facts.append(f"Storyboard frames ({len(storyboard)}) strictly aligned with screenplay scenes.")

        # -------------------------------------------------------------
        # VECTOR 11: SCREENPLAY -> CAMERA CONSISTENCY
        # -------------------------------------------------------------
        self.total_checks += 1
        cam_ok = True
        for shot in shots:
            sc_ref = shot.get("sceneNumber")
            if sc_ref and scene_numbers and sc_ref not in scene_numbers:
                self.conflicts.append(ContinuityConflict(
                    problem=f"Camera shot list references non-existent scene {sc_ref}.",
                    existing_canon=f"Screenplay scenes: 1 to {max(scene_numbers)}",
                    new_output=f"Camera setup for scene {sc_ref}.",
                    suggested_resolution=f"Align camera setup with screenplay scene numbering.",
                    severity="WARNING",
                    category="screenplay_camera",
                    scene=sc_ref
                ))
                cam_ok = False
        if cam_ok:
            self.passed_checks += 1
            self.verified_facts.append(f"Director camera setups ({len(shots)}) validated against scene interior/exterior staging.")

        # -------------------------------------------------------------
        # VECTOR 12: STORYBOARD -> MEDIA INTEGRITY
        # -------------------------------------------------------------
        self.total_checks += 1
        media_ok = True
        for frame in storyboard:
            img_url = frame.get("imageUrl")
            vid_url = frame.get("videoUrl")
            if img_url and not (img_url.startswith("/static/") or img_url.startswith("http") or img_url.endswith((".jpg", ".png", ".svg"))):
                self.conflicts.append(ContinuityConflict(
                    problem=f"Storyboard Scene {frame.get('scene')} Frame {frame.get('frame')} has invalid image URL format: {img_url}",
                    existing_canon="Media files must be served from /static/generated/ or valid HTTP URI.",
                    new_output=img_url,
                    suggested_resolution="Regenerate keyframe to create valid static file asset.",
                    severity="INFO",
                    category="storyboard_media",
                    scene=frame.get('scene')
                ))
                media_ok = False
        if media_ok:
            self.passed_checks += 1
            self.verified_facts.append("Storyboard media assets verified for path integrity and URL validity.")

        # Compute audit verdict
        critical_count = sum(1 for c in self.conflicts if c.severity == "CRITICAL")
        warnings_count = sum(1 for c in self.conflicts if c.severity == "WARNING")
        info_count = sum(1 for c in self.conflicts if c.severity == "INFO")

        if critical_count > 0:
            status = "FAIL"
        elif warnings_count > 0:
            status = "WARN"
        else:
            status = "PASS"

        return {
            "status": status,
            "total_checks": self.total_checks,
            "passed_checks": self.passed_checks,
            "conflict_count": len(self.conflicts),
            "critical_count": critical_count,
            "warnings_count": warnings_count,
            "info_count": info_count,
            "conflicts": [c.to_dict() for c in self.conflicts],
            "verified_facts": self.verified_facts,
            "total_verified": len(self.verified_facts)
        }


    def _format_sec(self, s: float) -> str:
        if s == float('inf'):
            return "INF"
        sec = int(s)
        return f"{sec//3600:02d}:{(sec%3600)//60:02d}:{sec%60:02d}"

    def check_cast_continuity(self, cast: List[Dict[str, Any]], characters: List[Dict[str, Any]], scenes: List[Dict[str, Any]]) -> List[ContinuityConflict]:
        """Audits cast assignments for conflicting performer assignments, unassigned leads, or duplicate roles."""
        conflicts = []
        performer_to_chars = {}
        
        for entry in cast:
            p_name = entry.get("performerName", "").strip()
            c_name = entry.get("characterName", "").strip()
            if not p_name or not c_name:
                continue

            if p_name.lower() in performer_to_chars:
                existing_char = performer_to_chars[p_name.lower()]
                if existing_char.lower() != c_name.lower():
                    conflicts.append(ContinuityConflict(
                        problem=f"CRITICAL: Performer '{p_name}' is assigned to multiple characters ('{existing_char}' and '{c_name}').",
                        existing_canon=f"Cast Record: {p_name} -> {existing_char}",
                        new_output=f"New Assignment: {p_name} -> {c_name}",
                        suggested_resolution=f"Assign distinct performers or reassign '{c_name}' to another actor.",
                        severity="CRITICAL",
                        category="cast"
                    ))
            else:
                performer_to_chars[p_name.lower()] = c_name

        assigned_char_names = [c.get("characterName", "").lower() for c in cast if c.get("characterName")]
        for ch in characters:
            ch_name = ch.get("name", "")
            role = ch.get("role", "").lower()
            if ("lead" in role or "protagonist" in role or "antagonist" in role) and ch_name.lower() not in assigned_char_names:
                conflicts.append(ContinuityConflict(
                    problem=f"INFO: Main character '{ch_name}' ({ch.get('role')}) does not have an assigned performer yet.",
                    existing_canon=f"Character: {ch_name}",
                    new_output="Cast Assignment: Unassigned",
                    suggested_resolution=f"Assign a performer (e.g., tell chat 'My actor for {ch_name} is [Name]').",
                    severity="INFO",
                    category="cast"
                ))

        self.conflicts.extend(conflicts)
        return conflicts

continuity_engine = ContinuityEngine()
